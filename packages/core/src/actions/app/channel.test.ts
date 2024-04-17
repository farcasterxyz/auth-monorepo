import { createAppClient } from "../../clients/createAppClient.js";
import { jest } from "@jest/globals";
import { viemConnector } from "../../clients/ethereum/viemConnector.js";
import { type ChannelReturnType } from "./channel.js";

describe("channel", () => {
  const client = createAppClient({
    ethereum: viemConnector(),
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const channelResponseDataStub: ChannelReturnType = {
    status: "pending",
    nonce: "abcd1234",
    url: "https://warpcast.com/~/sign-in-with-farcaster?nonce=abcd1234[...]",
  };

  test("constructs  request", async () => {
    const spy = jest.spyOn(global, "fetch").mockResolvedValue(new Response(JSON.stringify(channelResponseDataStub)));

    const res = await client.channel({
      channelToken: "some-channel-token",
    });

    expect(res).toEqual(channelResponseDataStub);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith("https://relay.farcaster.xyz/v1/channel/channel", {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer some-channel-token",
      },
    });
  });
});
