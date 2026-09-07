import { Hono } from "hono";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { notes } from "@/db/schema";
import { sessionMiddleware } from "../session-middleware";

const notesRouter = new Hono<{
  Variables: {
    session: typeof import("@/lib/auth").auth.$Infer.Session;
  };
}>();

const createNoteSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or less"),

  content: z
    .string()
    .trim()
    .min(1, "Content is required")
    .max(100_000, "Content must be 100,000 characters or less"),
});

const updateNoteSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or less"),

  content: z
    .string()
    .trim()
    .min(1, "Content is required")
    .max(100_000, "Content must be 100,000 characters or less"),
});

notesRouter.get("/", sessionMiddleware, async (c) => {
  const session = c.get("session");
  const userId = session.user.id;

  const userNotes = await db
    .select({
      id: notes.id,
      title: notes.title,
      content: notes.content,
      createdAt: notes.createdAt,
      updatedAt: notes.updatedAt,
    })
    .from(notes)
    .where(eq(notes.userId, userId))
    .orderBy(desc(notes.createdAt));

  return c.json({
    success: true,
    notes: userNotes,
  });
});

notesRouter.post("/", sessionMiddleware, async (c) => {
  const body = await c.req.json();

  const result = createNoteSchema.safeParse(body);

  if (!result.success) {
    return c.json(
      {
        success: false,
        message: "Invalid note data",
        errors: result.error.flatten().fieldErrors,
      },
      400,
    );
  }

  const session = c.get("session");
  const userId = session.user.id;

  const [note] = await db
    .insert(notes)
    .values({
      id: crypto.randomUUID(),
      userId,
      title: result.data.title,
      content: result.data.content,
    })
    .returning({
      id: notes.id,
      title: notes.title,
      content: notes.content,
      createdAt: notes.createdAt,
      updatedAt: notes.updatedAt,
    });

  return c.json(
    {
      success: true,
      note,
    },
    201,
  );
});

notesRouter.get("/:id", sessionMiddleware, async (c) => {
  const session = c.get("session");
  const userId = session.user.id;
  const noteId = c.req.param("id");

  const [note] = await db
    .select({
      id: notes.id,
      title: notes.title,
      content: notes.content,
      createdAt: notes.createdAt,
      updatedAt: notes.updatedAt,
    })
    .from(notes)
    .where(and(eq(notes.userId, userId), eq(notes.id, noteId)))
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
    note,
  });
});

notesRouter.patch("/:id", sessionMiddleware, async (c) => {
  const session = c.get("session");
  const userId = session.user.id;
  const noteId = c.req.param("id");

  const body = await c.req.json();

  const result = updateNoteSchema.safeParse(body);

  if (!result.success) {
    return c.json(
      {
        success: false,
        message: "Invalid note data",
        errors: result.error.flatten().fieldErrors,
      },
      400,
    );
  }

  const [updatedNote] = await db
    .update(notes)
    .set({
      title: result.data.title,
      content: result.data.content,
      updatedAt: new Date(),
    })
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
    .returning({
      id: notes.id,
      title: notes.title,
      content: notes.content,
      createdAt: notes.createdAt,
      updatedAt: notes.updatedAt,
    });

  if (!updatedNote) {
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
    note: updatedNote,
  });
});

notesRouter.delete("/:id", sessionMiddleware, async (c) => {
  const session = c.get("session");
  const userId = session.user.id;
  const noteId = c.req.param("id");

  const [deletedNote] = await db
    .delete(notes)
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
    .returning({
      id: notes.id,
    });

  if (!deletedNote) {
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
    message: "Note deleted successfully",
  });
});

export default notesRouter;
