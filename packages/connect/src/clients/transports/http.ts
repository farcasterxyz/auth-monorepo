import { Client } from "../createClient";

export interface HttpOpts {
  authToken?: string;
  headers?: Record<string, string>;
}

export interface HttpResponse<ResponseDataType> {
  response: Response;
  data: ResponseDataType;
}

export type AsyncHttpResponse<T> = Promise<HttpResponse<T>>;

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
