import { createAppClient } from "../../clients/createAppClient.js";
import { jest } from "@jest/globals";
import { viemConnector } from "../../clients/ethereum/viemConnector.js";
import { AuthClientError } from "../../errors.js";
import { type CreateSessionReturnType } from "./createSession.js";

describe("createSession", () => {
  const client = createAppClient({
    ethereum: viemConnector(),
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const siweUri = "https://example.com/login";
  const domain = "example.com";
  const nonce = "abcd1234";

  const createSessionResponseDataStub: CreateSessionReturnType = {
    url: "https://some-url",
    status: "pending",
    nonce,
  };

  test("constructs API request", async () => {
    const spy = jest
      .spyOn(global, "fetch")
      .mockResolvedValue(new Response(JSON.stringify(createSessionResponseDataStub)));

    const res = await client.createSession({
      siweUri,
      domain,
      nonce,
    });

    expect(res).toEqual(createSessionResponseDataStub);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith("https://relay.farcaster.xyz/v1/channel", {
      method: "POST",
      body: JSON.stringify({
        siweUri,
        domain,
        nonce,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  });

  test("handles errors", async () => {
    const spy = jest.spyOn(global, "fetch").mockRejectedValue(new Error("some error"));

    try {
      await client.createSession({
        siweUri,
        domain,
        nonce,
      });
      expect(true).toBe(false);
    } catch (e) {
      expect(spy).toHaveBeenCalledTimes(1);
      expect(e).toEqual(new AuthClientError("unknown", "some error"));
    }
  });
});
