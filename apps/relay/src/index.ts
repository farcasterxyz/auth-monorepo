import { Hono } from "hono";
import { cors } from "hono/cors";
import { channels } from "./channels";
import { healthcheck } from "./healthcheck";
import { getConfig } from "./utils/getConfig";
import { connect } from "./connect";

const config = getConfig();

export const app = new Hono().basePath("/v1");

app.use(cors({ origin: config.corsOrigin }));

app.route("/healthcheck", healthcheck);
app.route("/channels", channels);
app.route("/connect", connect);
