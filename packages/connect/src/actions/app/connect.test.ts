import { createAppClient } from "../../clients/createAppClient";
import { jest } from "@jest/globals";
import { viem } from "../../clients/ethereum/viem";
import { ConnectError } from "../../errors";

describe("connect", () => {
  const client = createAppClient({
    relayURI: "https://connect.farcaster.xyz",
    ethereum: viem(),
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const siweUri = "https://example.com/login";
  const domain = "example.com";
  const nonce = "abcd1234";

  const connectResponseDataStub = {
    channelToken: "some-channel-token",
    state: "completed",
  };

  test("constructs API request", async () => {
    const response = new Response(JSON.stringify(connectResponseDataStub));
    const spy = jest.spyOn(global, "fetch").mockResolvedValue(response);

    const res = await client.connect({
      siweUri,
      domain,
      nonce,
    });

    expect(res.response).toEqual(response);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith("https://connect.farcaster.xyz/v1/connect", {
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

    const res = await client.connect({
      siweUri,
      domain,
      nonce,
    });

    expect(spy).toHaveBeenCalledTimes(1);
    expect(res.isError).toBe(true);
    expect(res.error).toEqual(new ConnectError("unknown", "some error"));
  });
});
