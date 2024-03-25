"use client";

import { useConfig } from "../hooks/useConfig.js";
import { structuralSharing, useQuery, type UseQueryReturnType } from "../types/query.js";
import {
  type CreateSessionData,
  type CreateSessionOptions,
  type CreateSessionQueryFnData,
  type CreateSessionQueryKey,
  createSessionQueryOptions,
} from "../query/createSession.js";
import { type CreateSessionErrorType } from "../actions/createSession.js";
import { type UnionEvaluate } from "../types/utils.js";
import type { QueryParameter } from "../types/properties.js";

export type UseCreateSessionParameters<selectData = CreateSessionData,> = UnionEvaluate<
  CreateSessionOptions &
    QueryParameter<CreateSessionQueryFnData, CreateSessionErrorType, selectData, CreateSessionQueryKey>
>;
export type UseCreateSessionReturnType<selectData = CreateSessionData,> = UseQueryReturnType<
  selectData,
  CreateSessionErrorType
>;

export function useCreateSession<selectData = CreateSessionData>(
  parameters: UseCreateSessionParameters<selectData> = {},
): UseCreateSessionReturnType<selectData> {
  const { query = {} } = parameters;
  const config = useConfig();

  const options = createSessionQueryOptions(config, parameters);

  const enabled = Boolean(parameters.domain && parameters.siweUri && (query.enabled ?? true));

  return useQuery({
    ...query,
    ...options,
    enabled,
    structuralSharing: query.structuralSharing ?? structuralSharing,
  });
}
