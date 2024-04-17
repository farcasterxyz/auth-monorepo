import { parseSignInURI } from "./parseSignInURI";

describe("parseSignInUri", () => {
  test("parses Sign in With Farcaster URI into message params", () => {
    const signInUri =
      "https://warpcast.com/~/sign-in-with-farcaster?channelToken=76be6229-bdf7-4ad2-930a-540fb2de1e08&nonce=ESsxs6MaFio7OvqWb&siweUri=https%3A%2F%2Fexample.com%2Flogin&domain=example.com&redirectUrl=https%3A%2F%2Fexample.com";
    const result = parseSignInURI(signInUri);
    expect(result._unsafeUnwrap()).toStrictEqual({
      channelToken: "76be6229-bdf7-4ad2-930a-540fb2de1e08",
      params: {
        domain: "example.com",
        uri: "https://example.com/login",
        nonce: "ESsxs6MaFio7OvqWb",
        redirectUrl: "https://example.com",
      },
    });
  });
});
