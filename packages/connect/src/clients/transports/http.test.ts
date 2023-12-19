import { createClient } from "../createClient";
import { get, post } from "./http";
import { jest } from "@jest/globals";

describe("http", () => {
  const config = {
    relayURI: "https://connect.farcaster.xyz",
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
});
