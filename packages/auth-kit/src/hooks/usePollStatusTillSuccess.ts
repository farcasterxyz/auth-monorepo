"use client";

import { useConfig } from "../hooks/useConfig";
import {
  PollStatusTillSuccessOptions,
  type PollStatusTillSuccessData,
  PollStatusTillSuccessQueryFnData,
  PollStatusTillSuccessQueryKey,
  pollStatusTillSuccessQueryOptions,
} from "../query/pollStatusTillSuccess";
import { UnionEvaluate } from "../types/utils";
import { QueryParameter } from "../types/properties";
import { PollStatusTillSuccessErrorType } from "../actions/pollStatusTillSuccess";
import { UseQueryReturnType, structuralSharing, useQuery } from "../types/query";

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
  parameters: UsePollStatusTillSuccessParameters<selectData> = {} as any,
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
