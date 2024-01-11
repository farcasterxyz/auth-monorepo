import { ResultAsync, ok, err } from "neverthrow";
import { Client } from "../createClient";
import { AuthClientError, AuthClientAsyncResult } from "../../errors";

export interface HttpOpts {
  authToken?: string;
  headers?: Record<string, string>;
}

export interface PollOpts<ResponseDataType> {
  interval?: number;
  timeout?: number;
  successCode?: number;
  onResponse?: (response: HttpResponse<ResponseDataType>) => void;
}

export interface HttpResponse<ResponseDataType> {
  response: Response;
  data: ResponseDataType;
}

export type AsyncHttpResponse<T> = Promise<HttpResponse<T>>;

const defaultPollOpts = {
  interval: 1000,
  timeout: 10000,
  successCode: 200,
  onResponse: () => {},
};

export const get = async <ResponseDataType>(
  client: Client,
  path: string,
  opts?: HttpOpts,
): AuthClientAsyncResult<HttpResponse<ResponseDataType>> => {
  return ResultAsync.fromPromise(
    fetch(getURI(client, path), {
      headers: getHeaders(opts),
    }),
    (e) => {
      return new AuthClientError("unknown", e as Error);
    },
  ).andThen((response) => {
    return ResultAsync.fromPromise(response.json(), (e) => {
      return new AuthClientError("unknown", e as Error);
    }).andThen((data) => {
      return ok({ response, data });
    });
  });
};

export const post = async <BodyType, ResponseDataType>(
  client: Client,
  path: string,
  json: BodyType,
  opts?: HttpOpts,
): AuthClientAsyncResult<HttpResponse<ResponseDataType>> => {
  return ResultAsync.fromPromise(
    fetch(getURI(client, path), {
      method: "POST",
      body: JSON.stringify(json),
      headers: getHeaders(opts),
    }),
    (e) => {
      return new AuthClientError("unknown", e as Error);
    },
  ).andThen((response) => {
    return ResultAsync.fromPromise(response.json(), (e) => {
      return new AuthClientError("unknown", e as Error);
    }).andThen((data) => {
      return ok({ response, data });
    });
  });
};

export const poll = async <ResponseDataType>(
  client: Client,
  path: string,
  pollOpts?: PollOpts<ResponseDataType>,
  opts?: HttpOpts,
): AuthClientAsyncResult<HttpResponse<ResponseDataType>> => {
  const { timeout, interval, successCode, onResponse } = {
    ...defaultPollOpts,
    ...pollOpts,
  };

  const deadline = Date.now() + timeout;

  while (Date.now() < deadline) {
    const res = await get<ResponseDataType>(client, path, opts);
    if (res.isOk()) {
      const { response } = res.value;
      if (response.status === successCode) {
        return ok(res.value);
      }
      onResponse(res.value);
      await new Promise((resolve) => setTimeout(resolve, interval));
    } else {
      return err(res.error);
    }
  }
  return err(new AuthClientError("unavailable", `Polling timed out after ${timeout}ms`));
};

const getURI = (client: Client, path: string) => {
  return `${client.config.relay}/${client.config.version}/${path}`;
};

const getHeaders = (opts?: HttpOpts) => {
  const headers = {
    ...opts?.headers,
  };
  if (opts?.authToken) {
    headers["Authorization"] = `Bearer ${opts.authToken}`;
  }
  return { ...headers, "Content-Type": "application/json" };
};
