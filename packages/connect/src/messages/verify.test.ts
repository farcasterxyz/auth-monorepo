import { build } from "./build";
import { verify } from "./verify";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { Hex, zeroAddress } from "viem";
import { getDefaultProvider } from "ethers";

const account = privateKeyToAccount(generatePrivateKey());

const siweParams = {
  domain: "example.com",
  address: "0x63C378DDC446DFf1d831B9B96F7d338FE6bd4231",
  uri: "https://example.com/login",
  version: "1",
  nonce: "12345678",
  issuedAt: "2023-10-01T00:00:00.000Z",
};

describe("verify", () => {
  test("verifies valid EOA signatures", async () => {
    const getFid = (_custody: Hex) => Promise.resolve(1234n);

    const res = build({
      ...siweParams,
      address: account.address,
      fid: 1234,
    });
    const message = res._unsafeUnwrap();
    const sig = await account.signMessage({ message: message.toMessage() });
    const result = await verify(message, sig, { getFid });
    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toStrictEqual({
      data: message,
      success: true,
      fid: 1234,
    });
  });

  test("adds parsed resources to response", async () => {
    const getFid = (_custody: Hex) => Promise.resolve(1234n);

    const res = build({
      ...siweParams,
      address: account.address,
      fid: 1234,
    });
    const message = res._unsafeUnwrap();
    const sig = await account.signMessage({ message: message.toMessage() });
    const result = await verify(message, sig, { getFid });
    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toStrictEqual({
      data: message,
      success: true,
      fid: 1234,
    });
  });

  test("verifies valid 1271 signatures", async () => {
    const getFid = (_custody: Hex) => Promise.resolve(1234n);
    const provider = getDefaultProvider(10);

    const res = build({
      ...siweParams,
      address: "0xC89858205c6AdDAD842E1F58eD6c42452671885A",
      fid: 1234,
    });
    const message = res._unsafeUnwrap();
    const sig = await account.signMessage({ message: message.toMessage() });
    const result = await verify(message, sig, { getFid, provider });
    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toStrictEqual({
      data: message,
      success: true,
      fid: 1234,
    });
  });

  test("1271 signatures fail without provider", async () => {
    const getFid = (_custody: Hex) => Promise.resolve(1234n);

    const res = build({
      ...siweParams,
      address: "0xC89858205c6AdDAD842E1F58eD6c42452671885A",
      fid: 1234,
    });
    const message = res._unsafeUnwrap();
    const sig = await account.signMessage({ message: message.toMessage() });
    const result = await verify(message, sig, { getFid });
    expect(result.isOk()).toBe(false);
    const err = result._unsafeUnwrapErr();
    expect(err.errCode).toBe("unauthorized");
    expect(err.message).toBe("Signature does not match address of the message.");
  });

  test("invalid SIWE message", async () => {
    const getFid = (_custody: Hex) => Promise.resolve(1234n);

    const message = build({
      ...siweParams,
      address: zeroAddress,
      fid: 1234,
    });
    const sig = await account.signMessage({
      message: message._unsafeUnwrap().toMessage(),
    });
    const result = await verify(message._unsafeUnwrap(), sig, { getFid });
    expect(result.isOk()).toBe(false);
    const err = result._unsafeUnwrapErr();
    expect(err.errCode).toBe("unauthorized");
    expect(err.message).toBe("Signature does not match address of the message.");
  });

  test("invalid fid owner", async () => {
    const getFid = (_custody: Hex) => Promise.resolve(5678n);

    const message = build({
      ...siweParams,
      address: account.address,
      fid: 1234,
    });
    const sig = await account.signMessage({
      message: message._unsafeUnwrap().toMessage(),
    });
    const result = await verify(message._unsafeUnwrap(), sig, { getFid });
    expect(result.isOk()).toBe(false);
    const err = result._unsafeUnwrapErr();
    expect(err.errCode).toBe("unauthorized");
    expect(err.message).toBe(`Invalid resource: signer ${account.address} does not own fid 1234.`);
  });

  test("client error", async () => {
    const getFid = (_custody: Hex) => Promise.reject(new Error("client error"));

    const message = build({
      ...siweParams,
      address: account.address,
      fid: 1234,
    });
    const sig = await account.signMessage({
      message: message._unsafeUnwrap().toMessage(),
    });
    const result = await verify(message._unsafeUnwrap(), sig, { getFid });
    expect(result.isOk()).toBe(false);
    const err = result._unsafeUnwrapErr();
    expect(err.errCode).toBe("unavailable");
    expect(err.message).toBe("client error");
  });

  test("missing verifier", async () => {
    const message = build({
      ...siweParams,
      address: account.address,
      fid: 1234,
    });
    const sig = await account.signMessage({
      message: message._unsafeUnwrap().toMessage(),
    });
    const result = await verify(message._unsafeUnwrap(), sig);
    expect(result.isOk()).toBe(false);
    const err = result._unsafeUnwrapErr();
    expect(err.errCode).toBe("unavailable");
    expect(err.message).toBe("Not implemented: Must provide an fid verifier");
  });
});
