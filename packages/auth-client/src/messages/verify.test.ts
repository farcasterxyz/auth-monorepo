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
const { nonce, domain } = siweParams;

describe("verify", () => {
  test("verifies valid EOA signatures from custody address", async () => {
    const getFid = (_custody: Hex) => Promise.resolve(1234n);
    const isValidAuthAddress = (_authAddress: Hex, _fid: bigint) => Promise.resolve(false);

    const res = build({
      ...siweParams,
      address: account.address,
      fid: 1234,
    });
    const { siweMessage, message } = res._unsafeUnwrap();
    const sig = await account.signMessage({ message });
    const result = await verify(nonce, domain, message, sig, {
      acceptAuthAddress: false,
      getFid,
      isValidAuthAddress,
    });
    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toEqual({
      data: siweMessage,
      success: true,
      fid: 1234,
      authMethod: "custody",
    });
  });

  test("verifies valid EOA signatures from auth address", async () => {
    const getFid = (_custody: Hex) => Promise.resolve(0n);
    const isValidAuthAddress = (_authAddress: Hex, _fid: bigint) => Promise.resolve(true);

    const res = build({
      ...siweParams,
      address: account.address,
      fid: 1234,
    });
    const { siweMessage, message } = res._unsafeUnwrap();
    const sig = await account.signMessage({ message });
    const result = await verify(nonce, domain, message, sig, {
      acceptAuthAddress: true,
      getFid,
      isValidAuthAddress,
    });
    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toEqual({
      data: siweMessage,
      success: true,
      fid: 1234,
      authMethod: "authAddress",
    });
  });

  test("rejects valid EOA signatures from invalid auth address", async () => {
    const getFid = (_custody: Hex) => Promise.resolve(0n);
    const isValidAuthAddress = (_authAddress: Hex, _fid: bigint) => Promise.resolve(false);

    const res = build({
      ...siweParams,
      address: account.address,
      fid: 1234,
    });
    const { message } = res._unsafeUnwrap();
    const sig = await account.signMessage({ message });
    const result = await verify(nonce, domain, message, sig, {
      acceptAuthAddress: true,
      getFid,
      isValidAuthAddress,
    });
    expect(result.isOk()).toBe(false);
    const err = result._unsafeUnwrapErr();
    expect(err.errCode).toBe("unauthorized");
    expect(err.message).toBe(
      `Invalid resource: signer ${account.address} is not an auth address or owner of fid 1234.`,
    );
  });

  test("adds parsed resources to response", async () => {
    const getFid = (_custody: Hex) => Promise.resolve(1234n);
    const isValidAuthAddress = (_authAddress: Hex, _fid: bigint) => Promise.resolve(false);

    const res = build({
      ...siweParams,
      address: account.address,
      fid: 1234,
    });
    const { siweMessage, message } = res._unsafeUnwrap();
    const sig = await account.signMessage({ message });
    const result = await verify(nonce, domain, message, sig, {
      acceptAuthAddress: false,
      getFid,
      isValidAuthAddress,
    });
    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toEqual({
      authMethod: "custody",
      data: siweMessage,
      success: true,
      fid: 1234,
    });
  });

  test("verifies valid 1271 signatures", async () => {
    const getFid = (_custody: Hex) => Promise.resolve(1234n);
    const isValidAuthAddress = (_authAddress: Hex, _fid: bigint) => Promise.resolve(false);
    const provider = getDefaultProvider("https://mainnet.optimism.io");

    const res = build({
      ...siweParams,
      address: "0xC89858205c6AdDAD842E1F58eD6c42452671885A",
      fid: 1234,
    });
    const { siweMessage, message } = res._unsafeUnwrap();
    const sig = await account.signMessage({ message });
    const result = await verify(nonce, domain, message, sig, {
      acceptAuthAddress: false,
      getFid,
      isValidAuthAddress,
      provider,
    });
    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toEqual({
      authMethod: "custody",
      data: siweMessage,
      success: true,
      fid: 1234,
    });
  });

  test("verifies valid 1271 signatures from auth address", async () => {
    const getFid = (_custody: Hex) => Promise.resolve(0n);
    const isValidAuthAddress = (_authAddress: Hex, _fid: bigint) => Promise.resolve(true);
    const provider = getDefaultProvider("https://mainnet.optimism.io");

    const res = build({
      ...siweParams,
      address: "0xC89858205c6AdDAD842E1F58eD6c42452671885A",
      fid: 1234,
    });
    const { siweMessage, message } = res._unsafeUnwrap();
    const sig = await account.signMessage({ message });
    const result = await verify(nonce, domain, message, sig, {
      acceptAuthAddress: true,
      getFid,
      isValidAuthAddress,
      provider,
    });
    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toEqual({
      authMethod: "authAddress",
      data: siweMessage,
      success: true,
      fid: 1234,
    });
  });

  test("1271 signatures fail without provider", async () => {
    const getFid = (_custody: Hex) => Promise.resolve(1234n);
    const isValidAuthAddress = (_authAddress: Hex, _fid: bigint) => Promise.resolve(false);

    const res = build({
      ...siweParams,
      address: "0xC89858205c6AdDAD842E1F58eD6c42452671885A",
      fid: 1234,
    });
    const { message } = res._unsafeUnwrap();
    const sig = await account.signMessage({ message });
    const result = await verify(nonce, domain, message, sig, {
      acceptAuthAddress: false,
      getFid,
      isValidAuthAddress,
    });
    expect(result.isOk()).toBe(false);
    const err = result._unsafeUnwrapErr();
    expect(err.errCode).toBe("unauthorized");
    expect(err.message).toBe("Signature does not match address of the message.");
  });

  test("invalid SIWE message", async () => {
    const getFid = (_custody: Hex) => Promise.resolve(1234n);
    const isValidAuthAddress = (_authAddress: Hex, _fid: bigint) => Promise.resolve(false);

    const res = build({
      ...siweParams,
      address: zeroAddress,
      fid: 1234,
    });
    const { message } = res._unsafeUnwrap();
    const sig = await account.signMessage({
      message,
    });
    const result = await verify(nonce, domain, message, sig, {
      acceptAuthAddress: false,
      getFid,
      isValidAuthAddress,
    });
    expect(result.isOk()).toBe(false);
    const err = result._unsafeUnwrapErr();
    expect(err.errCode).toBe("unauthorized");
    expect(err.message).toBe("Signature does not match address of the message.");
  });

  test("invalid fid owner", async () => {
    const getFid = (_custody: Hex) => Promise.resolve(5678n);
    const isValidAuthAddress = (_authAddress: Hex, _fid: bigint) => Promise.resolve(false);

    const res = build({
      ...siweParams,
      address: account.address,
      fid: 1234,
    });
    const { message } = res._unsafeUnwrap();
    const sig = await account.signMessage({
      message,
    });
    const result = await verify(nonce, domain, message, sig, {
      acceptAuthAddress: false,
      getFid,
      isValidAuthAddress,
    });
    expect(result.isOk()).toBe(false);
    const err = result._unsafeUnwrapErr();
    expect(err.errCode).toBe("unauthorized");
    expect(err.message).toBe(`Invalid resource: signer ${account.address} does not own fid 1234.`);
  });

  test("client error", async () => {
    const getFid = (_custody: Hex) => Promise.reject(new Error("client error"));
    const isValidAuthAddress = (_authAddress: Hex, _fid: bigint) => Promise.resolve(false);

    const res = build({
      ...siweParams,
      address: account.address,
      fid: 1234,
    });
    const { message } = res._unsafeUnwrap();
    const sig = await account.signMessage({
      message,
    });
    const result = await verify(nonce, domain, message, sig, {
      acceptAuthAddress: false,
      getFid,
      isValidAuthAddress,
    });
    expect(result.isOk()).toBe(false);
    const err = result._unsafeUnwrapErr();
    expect(err.errCode).toBe("unavailable");
    expect(err.message).toBe("client error");
  });

  test("missing verifier", async () => {
    const res = build({
      ...siweParams,
      address: account.address,
      fid: 1234,
    });
    const { message } = res._unsafeUnwrap();
    const sig = await account.signMessage({
      message,
    });
    const result = await verify(nonce, domain, message, sig);
    expect(result.isOk()).toBe(false);
    const err = result._unsafeUnwrapErr();
    expect(err.errCode).toBe("unavailable");
    expect(err.message).toBe("Not implemented: Must provide an fid verifier");
  });

  test("mismatched nonce", async () => {
    const res = build({
      ...siweParams,
      address: account.address,
      fid: 1234,
    });
    const { message } = res._unsafeUnwrap();
    const sig = await account.signMessage({
      message,
    });
    const result = await verify("mismatched-nonce", domain, message, sig);
    expect(result.isOk()).toBe(false);
    const err = result._unsafeUnwrapErr();
    expect(err.errCode).toBe("unauthorized");
    expect(err.message).toBe("Invalid nonce");
  });

  test("mismatched domain", async () => {
    const res = build({
      ...siweParams,
      address: account.address,
      fid: 1234,
    });
    const { message } = res._unsafeUnwrap();
    const sig = await account.signMessage({
      message,
    });
    const result = await verify(nonce, "mismatched-domain", message, sig);
    expect(result.isOk()).toBe(false);
    const err = result._unsafeUnwrapErr();
    expect(err.errCode).toBe("unauthorized");
    expect(err.message).toBe("Invalid domain");
  });
});
