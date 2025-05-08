import { validate } from "./validate";
import { AuthClientError } from "../errors";

const siweParams = {
  domain: "example.com",
  address: "0x63C378DDC446DFf1d831B9B96F7d338FE6bd4231",
  uri: "https://example.com/login",
  version: "1",
  nonce: "12345678",
  issuedAt: "2023-10-01T00:00:00.000Z",
};

const authParams = {
  ...siweParams,
  statement: "Farcaster Auth",
  chainId: 10,
  resources: ["farcaster://fid/1234"],
};

describe("validate", () => {
  test("default parameters are valid", () => {
    const result = validate(authParams);
    expect(result.isOk()).toBe(true);
  });

  test("propagates SIWE message errors", () => {
    const result = validate({
      ...authParams,
      address: "Invalid address",
    });
    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().errCode).toEqual("bad_request.validation_failure");
    expect(result._unsafeUnwrapErr().message).toMatch("invalid address");
  });

  test("message must contain 'Farcaster Auth'", () => {
    const result = validate({
      ...authParams,
      statement: "Invalid statement",
    });
    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toEqual(
      new AuthClientError("bad_request.validation_failure", "Statement must be 'Farcaster Auth'"),
    );
  });

  test("statement allows 'Farcaster Connect'", () => {
    const result = validate({
      ...authParams,
      statement: "Farcaster Connect",
    });
    expect(result.isOk()).toBe(true);
  });

  test("message must include chainId 10", () => {
    const result = validate({
      ...authParams,
      chainId: 1,
    });
    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toEqual(
      new AuthClientError("bad_request.validation_failure", "Chain ID must be 10"),
    );
  });

  test("message must include FID resource", () => {
    const result = validate({
      ...authParams,
      resources: [],
    });
    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toEqual(
      new AuthClientError("bad_request.validation_failure", "No fid resource provided"),
    );
  });

  test("message must only include one FID resource", () => {
    const result = validate({
      ...authParams,
      resources: ["farcaster://fid/1", "farcaster://fid/2"],
    });
    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toEqual(
      new AuthClientError("bad_request.validation_failure", "Multiple fid resources provided"),
    );
  });
});
