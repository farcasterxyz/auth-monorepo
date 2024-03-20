import { createAppClient } from "../../clients/createAppClient.js";
import { jest } from "@jest/globals";
import { viemConnector } from "../../clients/ethereum/viemConnector.js";
import { type StatusReturnType } from "./status.js";

describe("status", () => {
  const client = createAppClient({
    ethereum: viemConnector(),
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const statusResponseDataStub: StatusReturnType = {
    state: "pending",
    nonce: "abcd1234",
    url: "https://warpcast.com/~/sign-in-with-farcaster?nonce=abcd1234[...]",
  };

  test("constructs  request", async () => {
    const spy = jest.spyOn(global, "fetch").mockResolvedValue(new Response(JSON.stringify(statusResponseDataStub)));

    const res = await client.status({
      channelToken: "some-channel-token",
    });

    expect(res).toEqual(statusResponseDataStub);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith("https://relay.farcaster.xyz/v1/channel/status", {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer some-channel-token",
      },
    });
  });
});
