import {
  type DefaultError,
  type QueryKey,
  type UseInfiniteQueryOptions,
  type UseInfiniteQueryResult,
  type UseMutationOptions,
  type UseMutationResult,
  type UseQueryOptions,
  type UseQueryResult,
  type QueryOptions as tanstack_QueryOptions,
  replaceEqualDeep,
  useInfiniteQuery as tanstack_useInfiniteQuery,
  useQuery as tanstack_useQuery,
} from "@tanstack/react-query";
import { type Evaluate, type ExactPartial, type Omit, type UnionOmit } from "./utils.js";
import { deepEqual } from "./deepEqual.js";

export function hashFn(queryKey: QueryKey): string {
  return JSON.stringify(queryKey, (_, value) => {
    if (isPlainObject(value))
      return Object.keys(value)
        .sort()
        .reduce((result, key) => {
          result[key] = value[key];
          return result;
        }, {} as any);
    if (typeof value === "bigint") return value.toString();
    return value;
  });
}

function isPlainObject(o: any): o is Object {
  if (!hasObjectPrototype(o)) {
    return false;
  }

  // If has modified constructor
  const ctor = o.constructor;
  if (typeof ctor === "undefined") return true;

  // If has modified prototype
  const prot = ctor.prototype;
  if (!hasObjectPrototype(prot)) return false;

  // If constructor does not have an Object-specific method
  // biome-ignore lint/suspicious/noPrototypeBuiltins: <explanation>
  if (!prot.hasOwnProperty("isPrototypeOf")) return false;

  // Most likely a plain Object
  return true;
}

function hasObjectPrototype(o: any): boolean {
  return Object.prototype.toString.call(o) === "[object Object]";
}

export type UseMutationParameters<data = unknown, error = Error, variables = void, context = unknown> = Evaluate<
  Omit<UseMutationOptions<data, error, Evaluate<variables>, context>, "mutationFn" | "mutationKey" | "throwOnError">
>;

export type UseMutationReturnType<data = unknown, error = Error, variables = void, context = unknown> = Evaluate<
  UnionOmit<UseMutationResult<data, error, variables, context>, "mutate" | "mutateAsync">
>;

////////////////////////////////////////////////////////////////////////////////

export type UseQueryParameters<
  queryFnData = unknown,
  error = DefaultError,
  data = queryFnData,
  queryKey extends QueryKey = QueryKey,
> = Evaluate<
  ExactPartial<Omit<UseQueryOptions<queryFnData, error, data, queryKey>, "initialData">> & {
    // Fix `initialData` type
    initialData?: UseQueryOptions<queryFnData, error, data, queryKey>["initialData"] | undefined;
  }
>;

export type UseQueryReturnType<data = unknown, error = DefaultError> = Evaluate<
  UseQueryResult<data, error> & {
    queryKey: QueryKey;
  }
>;

// Adding some basic customization.
// Ideally we don't have this function, but `import('@tanstack/react-query').useQuery` currently has some quirks where it is super hard to
// pass down the inferred `initialData` type because of it's discriminated overload in the on `useQuery`.
export function useQuery<queryFnData, error, data, queryKey extends QueryKey>(
  parameters: UseQueryParameters<queryFnData, error, data, queryKey> & {
    queryKey: QueryKey;
  },
): UseQueryReturnType<data, error> {
  const result = tanstack_useQuery({
    ...(parameters as any),
    queryKeyHashFn: hashFn, // for bigint support
  }) as UseQueryReturnType<data, error>;
  result.queryKey = parameters.queryKey;
  return result;
}

export type QueryOptions<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = never,
> = Evaluate<
  Omit<tanstack_QueryOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam>, "queryKey"> &
    Required<Pick<tanstack_QueryOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam>, "queryKey">>
>;

////////////////////////////////////////////////////////////////////////////////

export type UseInfiniteQueryParameters<
  queryFnData = unknown,
  error = DefaultError,
  data = queryFnData,
  queryData = queryFnData,
  queryKey extends QueryKey = QueryKey,
  pageParam = unknown,
> = Evaluate<
  Omit<UseInfiniteQueryOptions<queryFnData, error, data, queryData, queryKey, pageParam>, "initialData"> & {
    // Fix `initialData` type
    initialData?: UseInfiniteQueryOptions<queryFnData, error, data, queryKey>["initialData"] | undefined;
  }
>;

export type UseInfiniteQueryReturnType<data = unknown, error = DefaultError> = UseInfiniteQueryResult<data, error> & {
  queryKey: QueryKey;
};

// Adding some basic customization.
export function useInfiniteQuery<queryFnData, error, data, queryKey extends QueryKey>(
  parameters: UseInfiniteQueryParameters<queryFnData, error, data, queryKey> & {
    queryKey: QueryKey;
  },
): UseInfiniteQueryReturnType<data, error> {
  const result = tanstack_useInfiniteQuery({
    ...(parameters as any),
    queryKeyHashFn: hashFn, // for bigint support
  }) as UseInfiniteQueryReturnType<data, error>;
  result.queryKey = parameters.queryKey;
  return result;
}

////////////////////////////////////////////////////////////////////////////////

export function structuralSharing<data>(oldData: data | undefined, newData: data): data {
  if (deepEqual(oldData, newData)) return oldData as data;
  return replaceEqualDeep(oldData, newData);
}
