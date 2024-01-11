import { createWalletClient } from "../../clients/createWalletClient";
import { viemConnector } from "../../clients/ethereum/viemConnector";

describe("parseSignInURI", () => {
  const client = createWalletClient({
    relay: "https://relay.farcaster.xyz",
    ethereum: viemConnector(),
  });

  test("parses sign in params from protocol URI", async () => {
    const { channelToken, params } = client.parseSignInURI({
      uri: "https://warpcast.com/~/sign-in-with-farcaster?channelToken=76be6229-bdf7-4ad2-930a-540fb2de1e08&nonce=ESsxs6MaFio7OvqWb&siweUri=https%3A%2F%2Fexample.com%2Flogin&domain=example.com",
    });

    expect(channelToken).toBe("76be6229-bdf7-4ad2-930a-540fb2de1e08");
    expect(params).toStrictEqual({
      domain: "example.com",
      uri: "https://example.com/login",
      nonce: "ESsxs6MaFio7OvqWb",
    });
  });
});
