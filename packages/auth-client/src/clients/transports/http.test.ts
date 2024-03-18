import { createClient } from "../createClient.js";
import { viemConnector } from "../ethereum/viemConnector.js";
import { get, poll, post } from "./http.js";
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
      const { response } = res;

      expect(response).toEqual(httpResponse);
    });

    test("returns parsed body data", async () => {
      jest.spyOn(global, "fetch").mockResolvedValue(httpResponse);

      const res = await get(client, "path");
      const { data } = res;

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

      const { response } = res;
      expect(response).toEqual(httpResponse);
    });

    test("returns parsed body data", async () => {
      jest.spyOn(global, "fetch").mockResolvedValue(httpResponse);

      const requestData = { data: "request stub" };
      const res = await post(client, "path", requestData);

      const { data } = res;
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
      let i = 0;
      const spy = jest.spyOn(global, "fetch").mockImplementation(async () => {
        if (i === 2)
          return new Response(JSON.stringify({ state: "completed" }), {
            status: 200,
          });
        i++;
        return new Response(JSON.stringify({ state: "pending" }), {
          status: 202,
        });
      });
      // .mockResolvedValueOnce(accepted1)
      // .mockResolvedValueOnce(accepted2)
      // .mockResolvedValueOnce(ok);

      let res: { response: { status: number }; data: { state: string } } = {
        response: { status: 500 },
        data: { state: "error" },
      };
      for await (const generatorResponse of poll<typeof res["data"]>(client, "path", { interval: 100 })) {
        res = generatorResponse;
        if (res.response.status === 200) break;
      }

      expect(spy).toHaveBeenCalledTimes(3);
      const { response, data } = res;
      expect(response.status).toBe(200);
      expect(data).toEqual({ state: "completed" });
    });

    test("times out", async () => {
      const accepted = new Response(JSON.stringify({ state: "pending" }), {
        status: 202,
      });

      jest.spyOn(global, "fetch").mockResolvedValue(accepted);

      let i = 0;
      try {
        for await (const _generatorResponse of poll(client, "path", { timeout: 1, interval: 1 })) {
          if (i++ === 1) expect(true).toBe(false);
        }
      } catch (e) {
        expect(e.message).toBe("Polling timed out after 1ms");
      }
    });
  });
});
