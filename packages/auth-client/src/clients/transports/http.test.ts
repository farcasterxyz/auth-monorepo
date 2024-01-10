import { createClient } from "../createClient";
import { viemConnector } from "../ethereum/viemConnector";
import { get, poll, post } from "./http";
import { jest } from "@jest/globals";

describe("http", () => {
  const config = {
    relay: "https://relay.farcaster.xyz",
    ethereum: viemConnector(),
  };

  const client = createClient(config);

  const bodyData = { data: "response stub" };
  let httpResponse: Response;

  beforeEach(() => {
    httpResponse = new Response(JSON.stringify(bodyData));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("get", () => {
    test("returns fetch response", async () => {
      jest.spyOn(global, "fetch").mockResolvedValue(httpResponse);

      const res = await get(client, "path");
      const { response } = res._unsafeUnwrap();

      expect(response).toEqual(httpResponse);
    });

    test("returns parsed body data", async () => {
      jest.spyOn(global, "fetch").mockResolvedValue(httpResponse);

      const res = await get(client, "path");
      const { data } = res._unsafeUnwrap();

      expect(data).toEqual(bodyData);
    });

    test("constructs fetch request", async () => {
      const spy = jest.spyOn(global, "fetch").mockResolvedValue(httpResponse);

      await get(client, "path");

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith("https://relay.farcaster.xyz/v1/path", {
        headers: { "Content-Type": "application/json" },
      });
    });

    test("adds optional params", async () => {
      const spy = jest.spyOn(global, "fetch").mockResolvedValue(httpResponse);

      await get(client, "path", {
        authToken: "some-auth-token",
        headers: { "X-Some-Header": "some-header-value" },
      });

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith("https://relay.farcaster.xyz/v1/path", {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer some-auth-token",
          "X-Some-Header": "some-header-value",
        },
      });
    });
  });

  describe("post", () => {
    test("returns fetch response", async () => {
      jest.spyOn(global, "fetch").mockResolvedValue(httpResponse);

      const requestData = { data: "request stub" };
      const res = await post(client, "path", requestData);

      const { response } = res._unsafeUnwrap();
      expect(response).toEqual(httpResponse);
    });

    test("returns parsed body data", async () => {
      jest.spyOn(global, "fetch").mockResolvedValue(httpResponse);

      const requestData = { data: "request stub" };
      const res = await post(client, "path", requestData);

      const { data } = res._unsafeUnwrap();
      expect(data).toEqual(data);
    });

    test("constructs fetch request", async () => {
      const spy = jest.spyOn(global, "fetch").mockResolvedValue(httpResponse);

      const requestData = { data: "request stub" };
      await post(client, "path", requestData, {
        authToken: "some-auth-token",
        headers: { "X-Some-Header": "some-header-value" },
      });

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith("https://relay.farcaster.xyz/v1/path", {
        method: "POST",
        body: JSON.stringify(requestData),
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer some-auth-token",
          "X-Some-Header": "some-header-value",
        },
      });
    });
  });

  describe("poll", () => {
    test("polls for success response", async () => {
      const accepted1 = new Response(JSON.stringify({ state: "pending" }), {
        status: 202,
      });
      const accepted2 = new Response(JSON.stringify({ state: "pending" }), {
        status: 202,
      });
      const ok = new Response(JSON.stringify({ state: "completed" }), {
        status: 200,
      });

      const spy = jest
        .spyOn(global, "fetch")
        .mockResolvedValueOnce(accepted1)
        .mockResolvedValueOnce(accepted2)
        .mockResolvedValueOnce(ok);

      const res = await poll(client, "path");

      expect(spy).toHaveBeenCalledTimes(3);
      expect(res.isOk()).toBe(true);
      const { response, data } = res._unsafeUnwrap();
      expect(response.status).toBe(200);
      expect(data).toEqual({ state: "completed" });
    });

    test("times out", async () => {
      const accepted = new Response(JSON.stringify({ state: "pending" }), {
        status: 202,
      });

      jest.spyOn(global, "fetch").mockResolvedValue(accepted);

      const res = await poll(client, "path", { timeout: 1, interval: 1 });
      expect(res.isErr()).toBe(true);
      expect(res._unsafeUnwrapErr().message).toBe("Polling timed out after 1ms");
    });
  });
});
