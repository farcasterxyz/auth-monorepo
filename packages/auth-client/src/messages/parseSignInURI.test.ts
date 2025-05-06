import { parseSignInURI } from "./parseSignInURI";

describe("parseSignInUri", () => {
  test("parses Sign in With Farcaster URI into message params", () => {
    const signInUri = "https://warpcast.com/~/siwf?channelToken=ABCD2345";
    const result = parseSignInURI(signInUri);
    expect(result._unsafeUnwrap()).toStrictEqual({
      channelToken: "ABCD2345",
      params: {
        domain: "example.com",
        uri: "https://example.com/login",
        nonce: "ESsxs6MaFio7OvqWb",
        redirectUrl: "https://example.com",
        method: "authAddress",
      },
    });
  });
});
