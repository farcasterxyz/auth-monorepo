import { createMiddleware } from "hono/factory";

export type AuthVariables = {
  sessionToken: string;
};

export const auth = createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
  const auth = c.req.header("authorization");

  const sessionToken = auth?.split(" ")[1];
  if (!sessionToken) {
    c.status(401);
    return c.json({ error: "Unauthorized" });
  }
  c.set("sessionToken", sessionToken);
  return next();
});
