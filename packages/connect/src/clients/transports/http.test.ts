import { createClient } from "../createClient";
import { viem } from "../ethereum/viem";
import { get, poll, post } from "./http";
import { jest } from "@jest/globals";

describe("http", () => {
  const config = {
    relayURI: "https://connect.farcaster.xyz",
    ethereum: viem(),
  };

  const client = createClient(config);

  const data = { data: "response stub" };
  let response: Response;

  beforeEach(() => {
    response = new Response(JSON.stringify(data));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("get", () => {
    test("returns fetch response", async () => {
      jest.spyOn(global, "fetch").mockResolvedValue(response);

      const res = await get(client, "path");

      expect(res.response).toEqual(response);
    });

    test("returns parsed body data", async () => {
      jest.spyOn(global, "fetch").mockResolvedValue(response);

      const res = await get(client, "path");

      expect(res.data).toEqual(data);
    });

    test("constructs fetch request", async () => {
      const spy = jest.spyOn(global, "fetch").mockResolvedValue(response);

      await get(client, "path");

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith("https://connect.farcaster.xyz/v1/path", {
        headers: { "Content-Type": "application/json" },
      });
    });

    test("adds optional params", async () => {
      const spy = jest.spyOn(global, "fetch").mockResolvedValue(response);

      await get(client, "path", {
        authToken: "some-auth-token",
        headers: { "X-Some-Header": "some-header-value" },
      });

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith("https://connect.farcaster.xyz/v1/path", {
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
      jest.spyOn(global, "fetch").mockResolvedValue(response);

      const requestData = { data: "request stub" };
      const res = await post(client, "path", requestData);

      expect(res.response).toEqual(response);
    });

    test("returns parsed body data", async () => {
      jest.spyOn(global, "fetch").mockResolvedValue(response);

      const requestData = { data: "request stub" };
      const res = await post(client, "path", requestData);

      expect(res.data).toEqual(data);
    });

    test("constructs fetch request", async () => {
      const spy = jest.spyOn(global, "fetch").mockResolvedValue(response);

      const requestData = { data: "request stub" };
      await post(client, "path", requestData, {
        authToken: "some-auth-token",
        headers: { "X-Some-Header": "some-header-value" },
      });

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith("https://connect.farcaster.xyz/v1/path", {
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
      expect(res.response.status).toBe(200);
      expect(res.data).toEqual({ state: "completed" });
    });

    test("times out", async () => {
      const accepted = new Response(JSON.stringify({ state: "pending" }), {
        status: 202,
      });

      jest.spyOn(global, "fetch").mockResolvedValue(accepted);

      await expect(poll(client, "path", { timeout: 1, interval: 1 })).rejects.toThrow("Polling timed out after 1ms");
    });
  });
});
