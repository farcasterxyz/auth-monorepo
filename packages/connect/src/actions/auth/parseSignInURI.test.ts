import { createAuthClient } from "../../clients/createAuthClient";
import { viem } from "../../clients/ethereum/viem";

describe("parseSignInURI", () => {
  const client = createAuthClient({
    relay: "https://relay.farcaster.xyz",
    ethereum: viem(),
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
