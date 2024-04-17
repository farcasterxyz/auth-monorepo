import { type Client } from "../createClient.js";
import { AuthClientError } from "../../errors.js";

export interface HttpOpts {
  channelToken?: string;
  headers?: Record<string, string>;
}

export interface PollOpts<BodyType> {
  interval?: number;
  timeout?: number;
  conditionToReturn?: (data: BodyType) => boolean;
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
): Promise<ResponseDataType> => {
  try {
    const response = await fetch(getURI(client, path), {
      headers: getHeaders(opts),
    });

    if (!response.ok) {
      throw new AuthClientError("unknown", new Error(response.statusText));
    }

    return await response.json();
  } catch (error) {
    throw new AuthClientError("unknown", error as Error);
  }
};

export const post = async <BodyType, ResponseDataType>(
  client: Client,
  path: string,
  parameters: BodyType,
  opts?: HttpOpts,
): Promise<ResponseDataType> => {
  try {
    const response = await fetch(getURI(client, path), {
      method: "POST",
      body: JSON.stringify(parameters),
      headers: getHeaders(opts),
    });

    if (!response.ok) {
      throw new AuthClientError("unknown", new Error(response.statusText));
    }

    return await response.json();
  } catch (error) {
    throw new AuthClientError("unknown", error as Error);
  }
};

export async function* poll<ResponseDataType>(
  client: Client,
  path: string,
  pollOpts?: PollOpts<ResponseDataType>,
  opts?: HttpOpts,
): AsyncGenerator<ResponseDataType> {
  const { timeout, interval } = {
    ...defaultPollOpts,
    ...pollOpts,
  };

  const deadline = Date.now() + timeout;

  while (Date.now() < deadline) {
    const data = await get<ResponseDataType>(client, path, opts);
    if (pollOpts?.conditionToReturn?.(data)) return data;
    yield data;
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
  if (opts?.channelToken) {
    headers["Authorization"] = `Bearer ${opts.channelToken}`;
  }
  return { ...headers, "Content-Type": "application/json" };
};
