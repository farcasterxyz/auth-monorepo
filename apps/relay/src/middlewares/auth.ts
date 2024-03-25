import { createMiddleware } from "hono/factory";

export type AuthVariables = {
  channelToken: string;
};

export const auth = createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
  const auth = c.req.header("authorization");

  const channelToken = auth?.split(" ")[1];
  if (!channelToken) {
    c.status(401);
    return c.json({ error: "Unauthorized" });
  }
  c.set("channelToken", channelToken);
  return next();
});
