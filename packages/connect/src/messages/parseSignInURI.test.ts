import { parseSignInURI } from "./parseSignInURI";

describe("parseSignInUri", () => {
  test("parses protocol handler URI into message params", () => {
    const signInUri =
      "farcaster://connect?channelToken=76be6229-bdf7-4ad2-930a-540fb2de1e08&nonce=ESsxs6MaFio7OvqWb&siweUri=https%3A%2F%2Fexample.com%2Flogin&domain=example.com";
    const result = parseSignInURI(signInUri);
    expect(result._unsafeUnwrap()).toStrictEqual({
      channelToken: "76be6229-bdf7-4ad2-930a-540fb2de1e08",
      params: {
        domain: "example.com",
        siweUri: "https://example.com/login",
        nonce: "ESsxs6MaFio7OvqWb",
      },
    });
  });
});
