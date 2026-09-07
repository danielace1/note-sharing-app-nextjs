import { Hono } from "hono";
import { sessionMiddleware } from "./session-middleware";
import { auth } from "@/lib/auth";
import notesRouter from "./routes/notes";
import shareLinksRouter from "./routes/share-links";
import shareRouter from "./routes/share";

type Session = typeof auth.$Infer.Session;

type AppVariables = {
  session: Session;
};

const app = new Hono<{
  Variables: AppVariables;
}>().basePath("/api");

app.get("/health", (c) => {
  return c.json({
    success: true,
    message: "Hono API is running",
  });
});

app.get("/me", sessionMiddleware, (c) => {
  const session = c.get("session");

  return c.json({
    success: true,
    user: session.user,
  });
});

app.route("/notes", notesRouter);
app.route("/", shareLinksRouter);
app.route("/share", shareRouter);

export default app;
