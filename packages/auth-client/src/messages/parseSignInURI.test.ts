import { parseSignInURI } from "./parseSignInURI";

describe("parseSignInUri", () => {
  test("parses Sign in With Farcaster URI into message params", () => {
    const signInUri = "https://farcaster.xyz/~/siwf?channelToken=ABCD2345";
    const result = parseSignInURI(signInUri);
    expect(result._unsafeUnwrap()).toStrictEqual({
      channelToken: "ABCD2345",
    });
  });
});
