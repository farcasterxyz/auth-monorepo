"use client";

import { useConfig } from "../hooks/useConfig.js";
import {
  type PollSessionTillCompletedOptions,
  type PollSessionTillCompletedData,
  type PollSessionTillCompletedQueryFnData,
  type PollSessionTillCompletedQueryKey,
  pollSessionTillCompletedQueryOptions,
} from "../query/pollSessionTillCompleted.js";
import { type UnionEvaluate } from "../types/utils.js";
import { type QueryParameter } from "../types/properties.js";
import { type PollSessionTillCompletedErrorType } from "../actions/pollSessionTillCompleted.js";
import { type UseQueryReturnType, structuralSharing, useQuery } from "../types/query.js";

export type UsePollSessionTillCompletedParameters<selectData = PollSessionTillCompletedData,> = UnionEvaluate<
  PollSessionTillCompletedOptions &
    QueryParameter<
      PollSessionTillCompletedQueryFnData,
      PollSessionTillCompletedErrorType,
      selectData,
      PollSessionTillCompletedQueryKey
    >
>;

export type UsePollSessionTillCompletedReturnType<selectData = PollSessionTillCompletedData,> = UseQueryReturnType<
  selectData,
  PollSessionTillCompletedErrorType
>;

export function usePollSessionTillCompleted<selectData = PollSessionTillCompletedData>(
  parameters: UsePollSessionTillCompletedParameters<selectData> = {},
): UsePollSessionTillCompletedReturnType<selectData> {
  const { sessionToken, query = {} } = parameters;
  const config = useConfig();

  const options = pollSessionTillCompletedQueryOptions(config, parameters);

  const enabled = Boolean(sessionToken && (query.enabled ?? true));

  return useQuery({
    ...query,
    ...options,
    enabled,
    structuralSharing: query.structuralSharing ?? structuralSharing,
  });
}
