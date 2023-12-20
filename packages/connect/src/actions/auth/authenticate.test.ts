import { createAuthClient } from "../../clients/createAuthClient";
import { jest } from "@jest/globals";

describe("authenticate", () => {
  const client = createAuthClient({
    relayURI: "https://connect.farcaster.xyz",
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

  const statusResponseDataStub = {
    state: "completed",
    nonce: "abcd1234",
    connectURI: "farcaster://connect?nonce=abcd1234[...]",
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
    expect(spy).toHaveBeenCalledWith("https://connect.farcaster.xyz/v1/connect/authenticate", {
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
      },
    });
  });
});
