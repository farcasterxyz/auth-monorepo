import { Hono } from "hono";

export const healthcheck = new Hono();

healthcheck.get("/", (c) => {
  return c.json({ status: "OK" });
});
