import type { z } from "zod";
import type { CompletedChannel, PendingChannel, Channel } from "./channel.js";
import type { channelCreateSchema } from "../schemas/channelCreate.js";
import type { channelAuthenticateSchema } from "../schemas/channelAuthenticate.js";

export type ChannelCreateParameters = z.infer<typeof channelCreateSchema>;
export type ChannelCreateReturnType = PendingChannel & { channelToken: string };

export type ChannelAuthenticateParameters = z.infer<typeof channelAuthenticateSchema>;
export type ChannelAuthenticateReturnType = CompletedChannel;

export type ChannelGetReturnType = Channel;
