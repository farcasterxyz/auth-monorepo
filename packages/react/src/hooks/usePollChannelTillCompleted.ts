"use client";

import { useConfig } from "./useConfig.js";
import {
  type PollChannelTillCompletedOptions,
  type PollChannelTillCompletedData,
  type PollChannelTillCompletedQueryFnData,
  type PollChannelTillCompletedQueryKey,
  pollChannelTillCompletedQueryOptions,
} from "../query/pollChannelTillCompleted.js";
import { type UnionEvaluate } from "../types/utils.js";
import { type QueryParameter } from "../types/properties.js";
import { type PollChannelTillCompletedErrorType } from "../actions/pollChannelTillCompleted.js";
import { type UseQueryReturnType, structuralSharing, useQuery } from "../types/query.js";

export type UsePollChannelTillCompletedParameters<selectData = PollChannelTillCompletedData,> = UnionEvaluate<
  PollChannelTillCompletedOptions &
    QueryParameter<
      PollChannelTillCompletedQueryFnData,
      PollChannelTillCompletedErrorType,
      selectData,
      PollChannelTillCompletedQueryKey
    >
>;

export type UsePollChannelTillCompletedReturnType<selectData = PollChannelTillCompletedData,> = UseQueryReturnType<
  selectData,
  PollChannelTillCompletedErrorType
>;

export function usePollChannelTillCompleted<selectData = PollChannelTillCompletedData>(
  parameters: UsePollChannelTillCompletedParameters<selectData> = {},
): UsePollChannelTillCompletedReturnType<selectData> {
  const { channelToken, query = {} } = parameters;
  const config = useConfig();

  const options = pollChannelTillCompletedQueryOptions(config, parameters);

  const enabled = Boolean(channelToken && (query.enabled ?? true));

  return useQuery({
    ...query,
    ...options,
    enabled,
    structuralSharing: query.structuralSharing ?? structuralSharing,
  });
}
