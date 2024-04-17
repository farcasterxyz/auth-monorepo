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
import type { QueryOptions } from "../types/query.js";

export type CreateChannelOptions = UnionPartial<CreateChannelParameters> & ScopeKeyParameter;

export function createChannelQueryOptions(
  config: Config,
  options: CreateChannelOptions,
): QueryOptions<CreateChannelQueryFnData, CreateChannelErrorType, CreateChannelData, CreateChannelQueryKey> {
  return {
    // TODO: Support `signal`
    // https://tkdodo.eu/blog/why-you-want-react-query#bonus-cancellation
    async queryFn({ queryKey }) {
      const { scopeKey: _, siweUri, domain, ...args } = queryKey[1];
      if (!siweUri || !domain) throw new Error("missing siweUri or domain");
      return createChannel(config, { siweUri, domain, ...args });
    },
    queryKey: createChannelQueryKey(options),
  } as const;
}

export type CreateChannelQueryFnData = CreateChannelReturnType;

export type CreateChannelData = CreateChannelQueryFnData;

export function createChannelQueryKey(options: CreateChannelOptions = {}) {
  return ["createChannel", filterQueryOptions(options)] as const;
}
export type CreateChannelQueryKey = ReturnType<typeof createChannelQueryKey>;
