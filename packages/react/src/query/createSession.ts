import {
  type CreateSessionParameters,
  type CreateSessionReturnType,
  type CreateSessionErrorType,
  createSession,
} from "../actions/createSession.js";
import { type UnionPartial } from "../types/utils.js";
import { type Config } from "../types/config.js";
import type { ScopeKeyParameter } from "../types/properties.js";
import { filterQueryOptions } from "./utils.js";
import type { QueryOptions } from "../types/query.js";

export type CreateSessionOptions = UnionPartial<CreateSessionParameters> & ScopeKeyParameter;

export function createSessionQueryOptions(
  config: Config,
  options: CreateSessionOptions,
): QueryOptions<CreateSessionQueryFnData, CreateSessionErrorType, CreateSessionData, CreateSessionQueryKey> {
  return {
    // TODO: Support `signal`
    // https://tkdodo.eu/blog/why-you-want-react-query#bonus-cancellation
    async queryFn({ queryKey }) {
      const { scopeKey: _, siweUri, domain, ...args } = queryKey[1];
      if (!siweUri || !domain) throw new Error("missing siweUri or domain");
      return createSession(config, { siweUri, domain, ...args });
    },
    queryKey: createSessionQueryKey(options),
  } as const;
}

export type CreateSessionQueryFnData = CreateSessionReturnType;

export type CreateSessionData = CreateSessionQueryFnData;

export function createSessionQueryKey(options: CreateSessionOptions = {}) {
  return ["createSession", filterQueryOptions(options)] as const;
}
export type CreateSessionQueryKey = ReturnType<typeof createSessionQueryKey>;
