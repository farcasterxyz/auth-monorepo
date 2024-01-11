import { createWalletClient } from "../../clients/createWalletClient";
import { jest } from "@jest/globals";
import { viemConnector } from "../../clients/ethereum/viemConnector";
import { AuthenticateAPIResponse } from "./authenticate";

describe("authenticate", () => {
  const client = createWalletClient({
    relay: "https://relay.farcaster.xyz",
    ethereum: viemConnector(),
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const message = "example.com wants you to sign in with your Ethereum account = [...]";
  const signature = "0xabcd1234";
  const fid = 1;
  const username = "alice";
  const bio = "I'm a little teapot who didn't fill out my bio";
  const displayName = "Alice Teapot";
  const pfpUrl = "https://example.com/alice.png";

  const statusResponseDataStub: AuthenticateAPIResponse = {
    state: "completed",
    nonce: "abcd1234",
    url: "https://warpcast.com/~/sign-in-with-farcaster?nonce=abcd1234[...]",
    message,
    signature,
    fid,
    username,
    bio,
    displayName,
    pfpUrl,
  };

  test("constructs API request", async () => {
    const response = new Response(JSON.stringify(statusResponseDataStub));
    const spy = jest.spyOn(global, "fetch").mockResolvedValue(response);

    const res = await client.authenticate({
      authKey: "some-auth-key",
      channelToken: "some-channel-token",
      message,
      signature,
      fid,
      username,
      bio,
      displayName,
      pfpUrl,
    });

    expect(res.response).toEqual(response);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith("https://relay.farcaster.xyz/v1/channel/authenticate", {
      method: "POST",
      body: JSON.stringify({
        message,
        signature,
        fid,
        username,
        bio,
        displayName,
        pfpUrl,
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer some-channel-token",
        "X-Farcaster-Auth-Relay-Key": "some-auth-key",
      },
    });
  });
});
