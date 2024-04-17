import {
  type PollChannelTillCompletedParameters,
  type PollChannelTillCompletedReturnType,
  type PollChannelTillCompletedErrorType,
  pollChannelTillCompleted,
} from "../actions/pollChannelTillCompleted.js";
import { type Config } from "../types/config.js";
import { filterQueryOptions } from "./utils.js";
import { type ScopeKeyParameter } from "../types/properties.js";
import { type UnionPartial } from "../types/utils.js";
import type { QueryOptions } from "../types/query.js";

export type PollChannelTillCompletedOptions = UnionPartial<PollChannelTillCompletedParameters> & ScopeKeyParameter;

export function pollChannelTillCompletedQueryOptions(
  config: Config,
  options: PollChannelTillCompletedOptions = {},
): QueryOptions<
  PollChannelTillCompletedQueryFnData,
  PollChannelTillCompletedErrorType,
  PollChannelTillCompletedData,
  PollChannelTillCompletedQueryKey
> {
  return {
    // TODO: Support `signal`
    // https://tkdodo.eu/blog/why-you-want-react-query#bonus-cancellation
    async queryFn({ queryKey }) {
      const { scopeKey: _, channelToken, timeout, interval } = queryKey[1];
      if (!channelToken) throw new Error("channelToken is required");
      return pollChannelTillCompleted(config, { channelToken, timeout, interval });
    },
    queryKey: pollChannelTillCompletedQueryKey(options),
  } as const;
}

export type PollChannelTillCompletedQueryFnData = PollChannelTillCompletedReturnType;

export type PollChannelTillCompletedData = PollChannelTillCompletedQueryFnData;

export function pollChannelTillCompletedQueryKey(options: PollChannelTillCompletedOptions = {}) {
  return ["pollChannelTillCompleted", filterQueryOptions(options)] as const;
}

export type PollChannelTillCompletedQueryKey = ReturnType<typeof pollChannelTillCompletedQueryKey>;
