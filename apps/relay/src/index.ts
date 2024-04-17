import { Hono } from "hono";
import { cors } from "hono/cors";
import { channel } from "./channel.js";
import { healthcheck } from "./healthcheck.js";
import { getConfig } from "./utils/getConfig.js";

const config = getConfig();

export const app = new Hono().basePath("/v2");

app.use(cors({ origin: config.corsOrigin }));

app.route("/healthcheck", healthcheck);
app.route("/channel", channel);
