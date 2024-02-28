import { Client } from "../createClient";
import { AuthClientError } from "../../errors";

export interface HttpOpts {
  authToken?: string;
  headers?: Record<string, string>;
}

export interface PollOpts {
  interval?: number;
  timeout?: number;
}

export interface HttpResponse<ResponseDataType> {
  response: Response;
  data: ResponseDataType;
}

export type AsyncHttpResponse<T> = Promise<HttpResponse<T>>;

const defaultPollOpts = {
  interval: 1000,
  timeout: 10000,
};

export const get = async <ResponseDataType>(
  client: Client,
  path: string,
  opts?: HttpOpts,
): Promise<HttpResponse<ResponseDataType>> => {
  try {
    const response = await fetch(getURI(client, path), {
      headers: getHeaders(opts),
    });

    if (!response.ok) {
      throw new AuthClientError("unknown", new Error(response.statusText));
    }

    const data = await response.json();
    return { response, data };
  } catch (error) {
    throw new AuthClientError("unknown", error as Error);
  }
};

export const post = async <BodyType, ResponseDataType>(
  client: Client,
  path: string,
  json: BodyType,
  opts?: HttpOpts,
): Promise<HttpResponse<ResponseDataType>> => {
  try {
    const response = await fetch(getURI(client, path), {
      method: "POST",
      body: JSON.stringify(json),
      headers: getHeaders(opts),
    });

    if (!response.ok) {
      throw new AuthClientError("unknown", new Error(response.statusText));
    }

    const data = await response.json();
    return { response, data };
  } catch (error) {
    throw new AuthClientError("unknown", error as Error);
  }
};

export async function* poll<ResponseDataType>(
  client: Client,
  path: string,
  pollOpts?: PollOpts,
  opts?: HttpOpts,
): AsyncGenerator<HttpResponse<ResponseDataType>> {
  const { timeout, interval } = {
    ...defaultPollOpts,
    ...pollOpts,
  };

  const deadline = Date.now() + timeout;

  while (Date.now() < deadline) {
    const res = await get<ResponseDataType>(client, path, opts);
    yield res;
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
  throw new AuthClientError("unavailable", `Polling timed out after ${timeout}ms`);
}

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
