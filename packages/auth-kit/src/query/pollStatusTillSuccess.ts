import {
  type PollStatusTillSuccessParameters,
  type PollStatusTillSuccessReturnType,
  type PollStatusTillSuccessErrorType,
  pollStatusTillSuccess,
} from "../actions/pollStatusTillSuccess.js";
import { type Config } from "../types/config.js";
import { type QueryOptions } from "@tanstack/query-core";
import { filterQueryOptions } from "./utils.js";
import { type ScopeKeyParameter } from "../types/properties.js";
import { type UnionPartial } from "../types/utils.js";

export type PollStatusTillSuccessOptions = UnionPartial<PollStatusTillSuccessParameters> & ScopeKeyParameter;

export function pollStatusTillSuccessQueryOptions(config: Config, options: PollStatusTillSuccessOptions = {}) {
  return {
    // TODO: Support `signal`
    // https://tkdodo.eu/blog/why-you-want-react-query#bonus-cancellation
    async queryFn({ queryKey }) {
      const { scopeKey: _, channelToken, timeout, interval } = queryKey[1];
      if (!channelToken) throw new Error("channelToken is required");
      return pollStatusTillSuccess(config, { channelToken, timeout, interval });
    },
    queryKey: pollStatusTillSuccessQueryKey(options),
  } as const satisfies QueryOptions<
    PollStatusTillSuccessQueryFnData,
    PollStatusTillSuccessErrorType,
    PollStatusTillSuccessData,
    PollStatusTillSuccessQueryKey
  >;
}

export type PollStatusTillSuccessQueryFnData = PollStatusTillSuccessReturnType;

export type PollStatusTillSuccessData = PollStatusTillSuccessQueryFnData;

export function pollStatusTillSuccessQueryKey(options: PollStatusTillSuccessOptions = {}) {
  return ["pollStatusTillSuccess", filterQueryOptions(options)] as const;
}

export type PollStatusTillSuccessQueryKey = ReturnType<typeof pollStatusTillSuccessQueryKey>;
