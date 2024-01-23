import { FastifyRequest as DefaultFastifyRequest } from "fastify";
import { RelaySession } from "./src/handlers";
import { ChannelStore } from "./src/channels";
import { AddressService } from "./src/addresses";

declare module "fastify" {
  export interface FastifyRequest extends DefaultFastifyRequest {
    channelToken: string;
    channels: ChannelStore<RelaySession>;
    addresses: AddressService;
  }
}
