import { Hono } from "hono";
import { desc, eq } from "drizzle-orm";
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

export default notesRouter;
