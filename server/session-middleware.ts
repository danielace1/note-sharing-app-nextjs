import { createMiddleware } from "hono/factory";
import { auth } from "@/lib/auth";

type Session = typeof auth.$Infer.Session;

type SessionVariables = {
  session: Session;
};

export const sessionMiddleware = createMiddleware<{
  Variables: SessionVariables;
}>(async (c, next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return c.json(
      {
        success: false,
        message: "Unauthorized",
      },
      401,
    );
  }

  c.set("session", session);

  await next();
});
