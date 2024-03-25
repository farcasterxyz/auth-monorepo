import {
  type PollSessionTillCompletedParameters,
  type PollSessionTillCompletedReturnType,
  type PollSessionTillCompletedErrorType,
  pollSessionTillCompleted,
} from "../actions/pollSessionTillCompleted.js";
import { type Config } from "../types/config.js";
import { filterQueryOptions } from "./utils.js";
import { type ScopeKeyParameter } from "../types/properties.js";
import { type UnionPartial } from "../types/utils.js";
import type { QueryOptions } from "../types/query.js";

export type PollSessionTillCompletedOptions = UnionPartial<PollSessionTillCompletedParameters> & ScopeKeyParameter;

export function pollSessionTillCompletedQueryOptions(
  config: Config,
  options: PollSessionTillCompletedOptions = {},
): QueryOptions<
  PollSessionTillCompletedQueryFnData,
  PollSessionTillCompletedErrorType,
  PollSessionTillCompletedData,
  PollSessionTillCompletedQueryKey
> {
  return {
    // TODO: Support `signal`
    // https://tkdodo.eu/blog/why-you-want-react-query#bonus-cancellation
    async queryFn({ queryKey }) {
      const { scopeKey: _, sessionToken, timeout, interval } = queryKey[1];
      if (!sessionToken) throw new Error("sessionToken is required");
      return pollSessionTillCompleted(config, { sessionToken, timeout, interval });
    },
    queryKey: pollSessionTillCompletedQueryKey(options),
  } as const;
}

export type PollSessionTillCompletedQueryFnData = PollSessionTillCompletedReturnType;

export type PollSessionTillCompletedData = PollSessionTillCompletedQueryFnData;

export function pollSessionTillCompletedQueryKey(options: PollSessionTillCompletedOptions = {}) {
  return ["pollSessionTillCompleted", filterQueryOptions(options)] as const;
}

export type PollSessionTillCompletedQueryKey = ReturnType<typeof pollSessionTillCompletedQueryKey>;
