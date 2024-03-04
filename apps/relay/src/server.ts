import fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import { err, ok } from "neverthrow";
import { createChannelRequestSchema, authenticateRequestSchema } from "./schemas";
import { ChannelStore } from "./channels";
import { AddressService } from "./addresses";
import {
  AuthenticateRequest,
  CreateChannelRequest,
  RelaySession,
  authenticate,
  createChannel,
  handleError,
  status,
} from "./handlers";
import { RelayError, RelayAsyncResult } from "./errors";
import logger from "./logger";

interface RelayServerConfig {
  redisUrl: string;
  ttl: number;
  corsOrigin: string;
}

export class RelayServer {
  app = fastify({ logger });
  channels: ChannelStore<RelaySession>;
  addresses: AddressService;

  constructor({ redisUrl, ttl, corsOrigin }: RelayServerConfig) {
    this.channels = new ChannelStore<RelaySession>({
      redisUrl,
      ttl,
    });
    this.addresses = new AddressService();
    this.app.setErrorHandler(handleError);

    this.app.register(cors, { origin: [corsOrigin] });
    this.app.decorateRequest("channels");
    this.app.decorateRequest("addresses");
    this.app.addHook("onRequest", async (request) => {
      request.channels = this.channels;
      request.addresses = this.addresses;
    });
    this.app.get("/healthcheck", async (_request, reply) => reply.send({ status: "OK" }));
    this.app.addSchema(createChannelRequestSchema);
    this.app.addSchema(authenticateRequestSchema);
    this.initHandlers();
  }

  initHandlers() {
    this.app.register(
      (v1, _opts, next) => {
        v1.register(async (publicRoutes, _opts, next) => {
          await publicRoutes.register(rateLimit);
          publicRoutes.post<{ Body: CreateChannelRequest }>(
            "/channel",
            { schema: { body: createChannelRequestSchema } },
            createChannel,
          );
          next();
        });

        v1.register(async (publicRoutes, _opts, next) => {
          await publicRoutes.register(rateLimit);
          publicRoutes.post<{ Body: CreateChannelRequest }>(
            "/connect",
            { schema: { body: createChannelRequestSchema } },
            createChannel,
          );
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
              return reply.code(401).send({ error: "Unauthorized " });
            }
          });

          protectedRoutes.post<{
            Body: AuthenticateRequest;
          }>("/connect/authenticate", { schema: { body: authenticateRequestSchema } }, authenticate);

          protectedRoutes.get("/connect/status", status);

          protectedRoutes.post<{
            Body: AuthenticateRequest;
          }>("/channel/authenticate", { schema: { body: authenticateRequestSchema } }, authenticate);

          protectedRoutes.get("/channel/status", status);

          next();
        });
        next();
      },
      { prefix: "/v1" },
    );
  }

  async start(ip = "0.0.0.0", port = 0): RelayAsyncResult<string> {
    return new Promise((resolve) => {
      this.app.listen({ host: ip, port }, (e, address) => {
        if (e) {
          this.app.log.error({ err: e, errMsg: e.message }, "Failed to start http server");
          resolve(err(new RelayError("unavailable", `Failed to start http server: ${e.message}`)));
        }

        this.app.log.info({ address }, "Started relay server");
        resolve(ok(address));
      });
    });
  }

  async stop() {
    await this.app.close();
    await this.channels.stop();
    this.app.log.info("Stopped relay server");
  }
}
