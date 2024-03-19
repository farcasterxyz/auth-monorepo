"use client";

import { useConfig } from "../hooks/useConfig.js";
import {
  type PollStatusTillSuccessOptions,
  type PollStatusTillSuccessData,
  type PollStatusTillSuccessQueryFnData,
  type PollStatusTillSuccessQueryKey,
  pollStatusTillSuccessQueryOptions,
} from "../query/pollStatusTillSuccess.js";
import { type UnionEvaluate } from "../types/utils.js";
import { type QueryParameter } from "../types/properties.js";
import { type PollStatusTillSuccessErrorType } from "../actions/pollStatusTillSuccess.js";
import { type UseQueryReturnType, structuralSharing, useQuery } from "../types/query.js";

export type UsePollStatusTillSuccessParameters<selectData = PollStatusTillSuccessData,> = UnionEvaluate<
  PollStatusTillSuccessOptions &
    QueryParameter<
      PollStatusTillSuccessQueryFnData,
      PollStatusTillSuccessErrorType,
      selectData,
      PollStatusTillSuccessQueryKey
    >
>;

export type UsePollStatusTillSuccessReturnType<selectData = PollStatusTillSuccessData,> = UseQueryReturnType<
  selectData,
  PollStatusTillSuccessErrorType
>;

export function usePollStatusTillSuccess<selectData = PollStatusTillSuccessData>(
  parameters: UsePollStatusTillSuccessParameters<selectData> = {},
): UsePollStatusTillSuccessReturnType<selectData> {
  const { channelToken, query = {} } = parameters;
  const config = useConfig();

  const options = pollStatusTillSuccessQueryOptions(config, parameters);

  const enabled = Boolean(channelToken && (query.enabled ?? true));

  return useQuery({
    ...query,
    ...options,
    enabled,
    structuralSharing: query.structuralSharing ?? structuralSharing,
  });
}
