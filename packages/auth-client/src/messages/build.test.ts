import { build } from "./build";

const siweParams = {
  domain: "example.com",
  address: "0x63C378DDC446DFf1d831B9B96F7d338FE6bd4231",
  uri: "https://example.com/login",
  version: "1",
  nonce: "12345678",
  issuedAt: "2023-10-01T00:00:00.000Z",
};

describe("build", () => {
  test("adds auth-specific parameters", () => {
    const result = build({
      ...siweParams,
      fid: 5678,
    });
    expect(result.isOk()).toBe(true);
    const { siweMessage, message } = result._unsafeUnwrap();
    expect(siweMessage).toMatchObject({
      ...siweParams,
      statement: "Farcaster Auth",
      chainId: 10,
      resources: ["farcaster://fid/5678"],
    });
    expect(message).toEqual(siweMessage.toMessage());
  });

  test("handles additional resources", () => {
    const result = build({
      ...siweParams,
      fid: 5678,
      resources: ["https://example.com/resource"],
    });
    expect(result.isOk()).toBe(true);
    const { siweMessage } = result._unsafeUnwrap();
    expect(siweMessage).toMatchObject({
      ...siweParams,
      statement: "Farcaster Auth",
      chainId: 10,
      resources: ["farcaster://fid/5678", "https://example.com/resource"],
    });
  });
});
