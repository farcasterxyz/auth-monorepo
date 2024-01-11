import { createAppClient } from "../../clients/createAppClient";
import { jest } from "@jest/globals";
import { viemConnector } from "../../clients/ethereum/viemConnector";
import { AuthClientError } from "../../errors";
import { CreateChannelAPIResponse } from "./createChannel";

describe("createChannel", () => {
  const client = createAppClient({
    ethereum: viemConnector(),
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const siweUri = "https://example.com/login";
  const domain = "example.com";
  const nonce = "abcd1234";

  const createChannelResponseDataStub: CreateChannelAPIResponse = {
    channelToken: "some-channel-token",
    url: "completed",
    nonce,
  };

  test("constructs API request", async () => {
    const response = new Response(JSON.stringify(createChannelResponseDataStub));
    const spy = jest.spyOn(global, "fetch").mockResolvedValue(response);

    const res = await client.createChannel({
      siweUri,
      domain,
      nonce,
    });

    expect(res.response).toEqual(response);
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

    const res = await client.createChannel({
      siweUri,
      domain,
      nonce,
    });

    expect(spy).toHaveBeenCalledTimes(1);
    expect(res.isError).toBe(true);
    expect(res.error).toEqual(new AuthClientError("unknown", "some error"));
  });
});
