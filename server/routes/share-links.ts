import { Hono } from "hono";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { notes, shareLinks } from "@/db/schema";
import { sessionMiddleware } from "../session-middleware";
import { hashPassword } from "@/lib/security/password";
import { generateShareToken, hashShareToken } from "@/lib/security/token";

const shareLinksRouter = new Hono<{
  Variables: {
    session: typeof import("@/lib/auth").auth.$Infer.Session;
  };
}>();

const createShareLinkSchema = z
  .object({
    shareType: z.enum(["ONE_TIME", "TIME_BASED"]),
    accessType: z.enum(["PUBLIC", "PASSWORD"]),
    expiresAt: z.string().datetime().optional(),
    accessKey: z.string().min(1).max(100).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.shareType === "TIME_BASED" && !data.expiresAt) {
      ctx.addIssue({
        code: "custom",
        path: ["expiresAt"],
        message: "Expiration time is required for time-based links",
      });
    }

    if (data.shareType === "ONE_TIME" && data.expiresAt) {
      ctx.addIssue({
        code: "custom",
        path: ["expiresAt"],
        message: "Expiration time is not allowed for one-time links",
      });
    }

    if (data.accessType === "PASSWORD" && !data.accessKey) {
      ctx.addIssue({
        code: "custom",
        path: ["accessKey"],
        message: "Access key is required for password-protected links",
      });
    }

    if (data.accessType === "PUBLIC" && data.accessKey) {
      ctx.addIssue({
        code: "custom",
        path: ["accessKey"],
        message: "Access key is not allowed for public links",
      });
    }
  });

shareLinksRouter.post("/notes/:noteId/share", sessionMiddleware, async (c) => {
  const session = c.get("session");
  const userId = session.user.id;
  const noteId = c.req.param("noteId");

  const body = await c.req.json();

  const result = createShareLinkSchema.safeParse(body);

  if (!result.success) {
    return c.json(
      {
        success: false,
        message: "Invalid share link data",
        errors: result.error.flatten().fieldErrors,
      },
      400,
    );
  }

  const data = result.data;

  // Verify that the note belongs to the logged-in user.
  const [note] = await db
    .select({
      id: notes.id,
    })
    .from(notes)
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
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

  const rawToken = generateShareToken();

  // Store only the hash of the token in the database.
  const tokenHash = await hashShareToken(rawToken);

  const [shareLink] = await db
    .insert(shareLinks)
    .values({
      id: crypto.randomUUID(),
      noteId,
      tokenHash,
      shareType: data.shareType,
      accessType: data.accessType,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      accessKeyHash:
        data.accessType === "PASSWORD" && data.accessKey
          ? await hashPassword(data.accessKey)
          : null,
    })
    .returning({
      id: shareLinks.id,
      noteId: shareLinks.noteId,
      shareType: shareLinks.shareType,
      accessType: shareLinks.accessType,
      expiresAt: shareLinks.expiresAt,
      createdAt: shareLinks.createdAt,
    });

  return c.json(
    {
      success: true,
      shareLink: {
        ...shareLink,
        token: rawToken,
      },
    },
    201,
  );
});

export default shareLinksRouter;
