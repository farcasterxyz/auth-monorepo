import { createWalletClient } from "../../clients/createWalletClient.js";
import { jest } from "@jest/globals";
import { viemConnector } from "../../clients/ethereum/viemConnector.js";
import { type AuthenticateReturnType } from "./authenticate.js";

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

  const statusResponseDataStub: AuthenticateReturnType = {
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
    verifications: [],
    custody: "0x0000000000000000000000000000000000000000",
  };

  test("constructs API request", async () => {
    const spy = jest.spyOn(global, "fetch").mockResolvedValue(new Response(JSON.stringify(statusResponseDataStub)));

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

    expect(res).toEqual(statusResponseDataStub);
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
