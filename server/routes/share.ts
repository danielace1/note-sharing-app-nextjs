import { Hono } from "hono";
import { and, eq, isNull, sql } from "drizzle-orm";

import { db } from "@/db";
import { notes, shareLinks } from "@/db/schema";
import { verifyPassword } from "@/lib/security/password";
import { hashShareToken } from "@/lib/security/token";

const shareRouter = new Hono();

/**
 * GET /api/share/:token
 * Behavior:
 * - Invalid token -> 404
 * - Revoked -> 410
 * - Expired -> 410
 * - Used ONE_TIME -> 410
 * - PASSWORD -> requiresAccessKey
 * - PUBLIC ONE_TIME -> atomically consume + increment view count
 * - PUBLIC TIME_BASED -> atomically increment view count
 */

shareRouter.get("/:token", async (c) => {
  const token = c.req.param("token");

  if (!token) {
    return c.json(
      {
        success: false,
        message: "Invalid share token",
      },
      400,
    );
  }

  const tokenHash = await hashShareToken(token);

  const [shareLink] = await db
    .select({
      id: shareLinks.id,
      noteId: shareLinks.noteId,
      shareType: shareLinks.shareType,
      accessType: shareLinks.accessType,
      accessKeyHash: shareLinks.accessKeyHash,
      expiresAt: shareLinks.expiresAt,
      usedAt: shareLinks.usedAt,
      revokedAt: shareLinks.revokedAt,
      viewCount: shareLinks.viewCount,
    })
    .from(shareLinks)
    .where(eq(shareLinks.tokenHash, tokenHash))
    .limit(1);

  if (!shareLink) {
    return c.json(
      {
        success: false,
        message: "Share link not found",
      },
      404,
    );
  }

  // Revoked links can never be accessed again.
  if (shareLink.revokedAt) {
    return c.json(
      {
        success: false,
        message: "This share link has been revoked",
      },
      410,
    );
  }

  // TIME_BASED links are no longer accessible after expiration.
  if (
    shareLink.shareType === "TIME_BASED" &&
    shareLink.expiresAt &&
    shareLink.expiresAt <= new Date()
  ) {
    return c.json(
      {
        success: false,
        message: "This share link has expired",
      },
      410,
    );
  }

  // ONE_TIME links can only be successfully accessed once.
  if (shareLink.shareType === "ONE_TIME" && shareLink.usedAt) {
    return c.json(
      {
        success: false,
        message: "This one-time share link has already been used",
      },
      410,
    );
  }

  // Password-protected links must be unlocked separately.
  // Merely opening the URL must NOT consume the link.
  if (shareLink.accessType === "PASSWORD") {
    return c.json({
      success: true,
      requiresAccessKey: true,
    });
  }

  // ---------------------------------------------------------
  // PUBLIC ONE_TIME
  // ---------------------------------------------------------

  if (shareLink.shareType === "ONE_TIME") {
    const [claimedLink] = await db
      .update(shareLinks)
      .set({
        usedAt: new Date(),
        viewCount: sql`${shareLinks.viewCount} + 1`,
      })
      .where(
        and(
          eq(shareLinks.id, shareLink.id),
          isNull(shareLinks.usedAt),
          isNull(shareLinks.revokedAt),
        ),
      )
      .returning({
        id: shareLinks.id,
        viewCount: shareLinks.viewCount,
      });

    if (!claimedLink) {
      return c.json(
        {
          success: false,
          message: "This one-time share link has already been used",
        },
        410,
      );
    }

    shareLink.viewCount = claimedLink.viewCount;
  }

  // ---------------------------------------------------------
  // PUBLIC TIME_BASED
  // ---------------------------------------------------------

  if (shareLink.shareType === "TIME_BASED") {
    const now = new Date();

    const [updatedLink] = await db
      .update(shareLinks)
      .set({
        viewCount: sql`${shareLinks.viewCount} + 1`,
      })
      .where(
        and(
          eq(shareLinks.id, shareLink.id),
          isNull(shareLinks.revokedAt),
          sql`${shareLinks.expiresAt} > ${now}`,
        ),
      )
      .returning({
        viewCount: shareLinks.viewCount,
      });

    if (!updatedLink) {
      return c.json(
        {
          success: false,
          message: "This share link has expired",
        },
        410,
      );
    }

    shareLink.viewCount = updatedLink.viewCount;
  }

  // Fetch the actual note only after access has been validated.
  const [note] = await db
    .select({
      id: notes.id,
      title: notes.title,
      content: notes.content,
      createdAt: notes.createdAt,
      updatedAt: notes.updatedAt,
    })
    .from(notes)
    .where(eq(notes.id, shareLink.noteId))
    .limit(1);

  if (!note) {
    return c.json(
      {
        success: false,
        message: "Note not found",
      },
      404,
    );
  }

  return c.json({
    success: true,
    requiresAccessKey: false,
    note,
    viewCount: shareLink.viewCount,
  });
});

/**
 * POST /api/share/:token/unlock
 * Behavior:
 * - Invalid token -> 404
 * - Revoked -> 410
 * - Expired -> 410
 * - Already-used ONE_TIME -> 410
 * - Wrong access key -> 401
 * - Correct ONE_TIME key -> atomically consume + increment
 * - Correct TIME_BASED key -> increment view count
 */

shareRouter.post("/:token/unlock", async (c) => {
  const token = c.req.param("token");

  if (!token) {
    return c.json(
      {
        success: false,
        message: "Invalid share token",
      },
      400,
    );
  }

  const body = await c.req.json().catch(() => null);

  const accessKey =
    body && typeof body.accessKey === "string" ? body.accessKey : "";

  if (!accessKey) {
    return c.json(
      {
        success: false,
        message: "Access key is required",
      },
      400,
    );
  }

  const tokenHash = await hashShareToken(token);

  const [shareLink] = await db
    .select({
      id: shareLinks.id,
      noteId: shareLinks.noteId,
      shareType: shareLinks.shareType,
      accessType: shareLinks.accessType,
      accessKeyHash: shareLinks.accessKeyHash,
      expiresAt: shareLinks.expiresAt,
      usedAt: shareLinks.usedAt,
      revokedAt: shareLinks.revokedAt,
    })
    .from(shareLinks)
    .where(eq(shareLinks.tokenHash, tokenHash))
    .limit(1);

  if (!shareLink) {
    return c.json(
      {
        success: false,
        message: "Share link not found",
      },
      404,
    );
  }

  // Revoked links cannot be unlocked.
  if (shareLink.revokedAt) {
    return c.json(
      {
        success: false,
        message: "This share link has been revoked",
      },
      410,
    );
  }

  // Check expiration before verifying the access key.
  if (
    shareLink.shareType === "TIME_BASED" &&
    shareLink.expiresAt &&
    shareLink.expiresAt <= new Date()
  ) {
    return c.json(
      {
        success: false,
        message: "This share link has expired",
      },
      410,
    );
  }

  // A consumed ONE_TIME link cannot be unlocked again.
  if (shareLink.shareType === "ONE_TIME" && shareLink.usedAt) {
    return c.json(
      {
        success: false,
        message: "This one-time share link has already been used",
      },
      410,
    );
  }

  // Only PASSWORD links should reach this endpoint.
  if (shareLink.accessType !== "PASSWORD" || !shareLink.accessKeyHash) {
    return c.json(
      {
        success: false,
        message: "This share link does not require an access key",
      },
      400,
    );
  }

  // Verify the user-provided access key against the Argon2id hash.
  const isValid = await verifyPassword(shareLink.accessKeyHash, accessKey);

  if (!isValid) {
    return c.json(
      {
        success: false,
        message: "Invalid access key",
      },
      401,
    );
  }

  // ---------------------------------------------------------
  // PASSWORD + ONE_TIME
  // ---------------------------------------------------------

  if (shareLink.shareType === "ONE_TIME") {
    const [claimedLink] = await db
      .update(shareLinks)
      .set({
        usedAt: new Date(),
        viewCount: sql`${shareLinks.viewCount} + 1`,
      })
      .where(
        and(
          eq(shareLinks.id, shareLink.id),
          isNull(shareLinks.usedAt),
          isNull(shareLinks.revokedAt),
        ),
      )
      .returning({
        id: shareLinks.id,
        viewCount: shareLinks.viewCount,
      });

    if (!claimedLink) {
      return c.json(
        {
          success: false,
          message: "This one-time share link has already been used",
        },
        410,
      );
    }

    const [note] = await db
      .select({
        id: notes.id,
        title: notes.title,
        content: notes.content,
        createdAt: notes.createdAt,
        updatedAt: notes.updatedAt,
      })
      .from(notes)
      .where(eq(notes.id, shareLink.noteId))
      .limit(1);

    if (!note) {
      return c.json(
        {
          success: false,
          message: "Note not found",
        },
        404,
      );
    }

    return c.json({
      success: true,
      requiresAccessKey: false,
      note,
      viewCount: claimedLink.viewCount,
    });
  }

  // ---------------------------------------------------------
  // PASSWORD + TIME_BASED
  // ---------------------------------------------------------

  const [note] = await db
    .select({
      id: notes.id,
      title: notes.title,
      content: notes.content,
      createdAt: notes.createdAt,
      updatedAt: notes.updatedAt,
    })
    .from(notes)
    .where(eq(notes.id, shareLink.noteId))
    .limit(1);

  if (!note) {
    return c.json(
      {
        success: false,
        message: "Note not found",
      },
      404,
    );
  }

  const now = new Date();

  const [updatedLink] = await db
    .update(shareLinks)
    .set({
      viewCount: sql`${shareLinks.viewCount} + 1`,
    })
    .where(
      and(
        eq(shareLinks.id, shareLink.id),
        isNull(shareLinks.revokedAt),
        sql`${shareLinks.expiresAt} > ${now}`,
      ),
    )
    .returning({
      viewCount: shareLinks.viewCount,
    });

  if (!updatedLink) {
    return c.json(
      {
        success: false,
        message: "This share link has expired",
      },
      410,
    );
  }

  return c.json({
    success: true,
    requiresAccessKey: false,
    note,
    viewCount: updatedLink.viewCount,
  });
});

export default shareRouter;
