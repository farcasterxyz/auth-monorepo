import { type DefaultError, type QueryKey } from "@tanstack/react-query";
import { type UseQueryParameters } from "./query.js";
import { type Omit } from "./utils.js";

export type EnabledParameter = {
  enabled?: boolean | undefined;
};

export type ScopeKeyParameter = { scopeKey?: string | undefined };

export type QueryParameter<
  queryFnData = unknown,
  error = DefaultError,
  data = queryFnData,
  queryKey extends QueryKey = QueryKey,
> = {
  query?:
    | Omit<
        UseQueryParameters<queryFnData, error, data, queryKey>,
        "queryFn" | "queryHash" | "queryKey" | "queryKeyHashFn" | "throwOnError"
      >
    | undefined;
};
