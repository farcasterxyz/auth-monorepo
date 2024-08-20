import { createWalletClient } from "../../clients/createWalletClient";
import { viemConnector } from "../../clients/ethereum/viemConnector";

describe("parseSignInURI", () => {
  const client = createWalletClient({
    relay: "https://relay.farcaster.xyz",
    ethereum: viemConnector(),
  });

  test("parses sign in params from protocol URI", async () => {
    const { channelToken } = client.parseSignInURI({
      uri: "https://warpcast.com/~/siwf?channelToken=ABCD2345",
    });

    expect(channelToken).toBe("ABCD2345");
  });
});
