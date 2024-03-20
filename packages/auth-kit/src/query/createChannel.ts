import type { QueryOptions } from "@tanstack/query-core";

import {
  type CreateChannelParameters,
  type CreateChannelReturnType,
  type CreateChannelErrorType,
  createChannel,
} from "../actions/createChannel.js";
import { type UnionPartial } from "../types/utils.js";
import { type Config } from "../types/config.js";
import type { ScopeKeyParameter } from "../types/properties.js";
import { filterQueryOptions } from "./utils.js";

export type CreateChannelOptions = UnionPartial<CreateChannelParameters> & ScopeKeyParameter;

export function createChannelQueryOptions(config: Config, options: CreateChannelOptions) {
  return {
    // TODO: Support `signal`
    // https://tkdodo.eu/blog/why-you-want-react-query#bonus-cancellation
    async queryFn({ queryKey }) {
      const { scopeKey: _, ...args } = queryKey[1];
      return createChannel(config, args);
    },
    queryKey: createChannelQueryKey(options),
  } as const satisfies QueryOptions<
    CreateChannelQueryFnData,
    CreateChannelErrorType,
    CreateChannelData,
    CreateChannelQueryKey
  >;
}

export type CreateChannelQueryFnData = CreateChannelReturnType;

export type CreateChannelData = CreateChannelQueryFnData;

export function createChannelQueryKey(options: CreateChannelOptions = {}) {
  return ["createChannel", filterQueryOptions(options)] as const;
}
export type CreateChannelQueryKey = ReturnType<typeof createChannelQueryKey>;
