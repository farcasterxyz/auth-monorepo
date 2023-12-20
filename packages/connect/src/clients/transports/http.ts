import { time } from "console";
import { Client } from "../createClient";

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
): Promise<HttpResponse<ResponseDataType>> => {
  const response = await fetch(getURI(client, path), {
    headers: getHeaders(opts),
  });
  const data: ResponseDataType = await response.json();
  return { response, data };
};

export const post = async <BodyType, ResponseDataType>(
  client: Client,
  path: string,
  json: BodyType,
  opts?: HttpOpts,
): Promise<HttpResponse<ResponseDataType>> => {
  const response = await fetch(getURI(client, path), {
    method: "POST",
    body: JSON.stringify(json),
    headers: getHeaders(opts),
  });
  const data: ResponseDataType = await response.json();
  return { response, data };
};

export const poll = async <ResponseDataType>(
  client: Client,
  path: string,
  pollOpts?: PollOpts<ResponseDataType>,
  opts?: HttpOpts,
): Promise<HttpResponse<ResponseDataType>> => {
  const { timeout, interval, successCode, onResponse } = {
    ...defaultPollOpts,
    ...pollOpts,
  };

  const deadline = Date.now() + timeout;

  while (Date.now() < deadline) {
    const res = await get<ResponseDataType>(client, path, opts);
    if (res.response.status === successCode) {
      return res;
    }
    onResponse(res);
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
  throw new Error(`Polling timed out after ${timeout}ms`);
};

const getURI = (client: Client, path: string) => {
  return `${client.config.relayURI}/${client.config.version}/${path}`;
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
