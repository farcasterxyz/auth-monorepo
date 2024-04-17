"use client";

import { useConfig } from "./useConfig.js";
import { structuralSharing, useQuery, type UseQueryReturnType } from "../types/query.js";
import {
  type CreateChannelData,
  type CreateChannelOptions,
  type CreateChannelQueryFnData,
  type CreateChannelQueryKey,
  createChannelQueryOptions,
} from "../query/createChannel.js";
import { type CreateChannelErrorType } from "../actions/createChannel.js";
import { type UnionEvaluate } from "../types/utils.js";
import type { QueryParameter } from "../types/properties.js";

export type UseCreateChannelParameters<selectData = CreateChannelData,> = UnionEvaluate<
  CreateChannelOptions &
    QueryParameter<CreateChannelQueryFnData, CreateChannelErrorType, selectData, CreateChannelQueryKey>
>;
export type UseCreateChannelReturnType<selectData = CreateChannelData,> = UseQueryReturnType<
  selectData,
  CreateChannelErrorType
>;

export function useCreateChannel<selectData = CreateChannelData>(
  parameters: UseCreateChannelParameters<selectData> = {},
): UseCreateChannelReturnType<selectData> {
  const { query = {} } = parameters;
  const config = useConfig();

  const options = createChannelQueryOptions(config, parameters);

  const enabled = query.enabled ?? true;

  return useQuery({
    ...query,
    ...options,
    enabled,
    structuralSharing: query.structuralSharing ?? structuralSharing,
  });
}
