import fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import { err, ok } from "neverthrow";
import { connectRequestSchema, authenticateRequestSchema } from "./schemas";
import { ChannelStore } from "./channels";
import {
  AuthenticateRequest,
  ConnectRequest,
  RelaySession,
  authenticate,
  connect,
  handleError,
  status,
} from "./handlers";
import { logger } from "./logger";
import { ConnectError, ConnectAsyncResult } from "./errors";

const log = logger.child({ component: "RelayServer" });

interface RelayServerConfig {
  redisUrl: string;
  ttl: number;
  corsOrigin: string;
}

export class RelayServer {
  app = fastify();
  channels: ChannelStore<RelaySession>;

  constructor({ redisUrl, ttl, corsOrigin }: RelayServerConfig) {
    this.channels = new ChannelStore<RelaySession>({
      redisUrl,
      ttl,
    });
    this.app.setErrorHandler(handleError.bind(this, log));

    this.app.register(cors, { origin: [corsOrigin] });
    this.app.decorateRequest("channels");
    this.app.addHook("onRequest", async (request) => {
      request.channels = this.channels;
    });
    this.app.get("/healthcheck", async (_request, reply) => reply.send({ status: "OK" }));
    this.app.addSchema(connectRequestSchema);
    this.app.addSchema(authenticateRequestSchema);
    this.initHandlers();
  }

  initHandlers() {
    this.app.register(
      (v1, _opts, next) => {
        v1.register(async (publicRoutes, _opts, next) => {
          await publicRoutes.register(rateLimit);
          publicRoutes.post<{ Body: ConnectRequest }>("/connect", { schema: { body: connectRequestSchema } }, connect);
          next();
        });

        v1.register((protectedRoutes, _opts, next) => {
          protectedRoutes.decorateRequest("channelToken", "");
          protectedRoutes.addHook("preHandler", async (request, reply) => {
            const auth = request.headers.authorization;
            const channelToken = auth?.split(" ")[1];
            if (channelToken) {
              request.channelToken = channelToken;
            } else {
              reply.code(401).send({ error: "Unauthorized " });
              return;
            }
          });

          protectedRoutes.post<{
            Body: AuthenticateRequest;
          }>("/connect/authenticate", { schema: { body: authenticateRequestSchema } }, authenticate);

          protectedRoutes.get("/connect/status", status);

          next();
        });
        next();
      },
      { prefix: "/v1" },
    );
  }

  async start(ip = "0.0.0.0", port = 0): ConnectAsyncResult<string> {
    return new Promise((resolve) => {
      this.app.listen({ host: ip, port }, (e, address) => {
        if (e) {
          log.error({ err: e, errMsg: e.message }, "Failed to start http server");
          resolve(err(new ConnectError("unavailable", `Failed to start http server: ${e.message}`)));
        }

        log.info({ address }, "Started relay server");
        resolve(ok(address));
      });
    });
  }

  async stop() {
    await this.app.close();
    await this.channels.stop();
    log.info("Stopped relay server");
  }
}
