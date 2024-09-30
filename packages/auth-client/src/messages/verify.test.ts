import { build } from "./build";
import { verify } from "./verify";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { type Hex, zeroAddress, createPublicClient, http } from "viem";
import { optimism } from "viem/chains";
import { parseNonPartialSiweMessage } from "../utils/parseNonPartialSiweMessage";

const account = privateKeyToAccount(generatePrivateKey());

const siweParams = {
  domain: "example.com",
  address: "0x63C378DDC446DFf1d831B9B96F7d338FE6bd4231",
  uri: "https://example.com/login",
  nonce: "12345678",
  issuedAt: new Date("2023-10-01T00:00:00"),
};
const { nonce, domain } = siweParams;

describe("verify", () => {
  test("verifies valid EOA signatures", async () => {
    const getFid = (_custody: Hex) => Promise.resolve(1234n);

    const res = build({
      ...siweParams,
      address: account.address,
      fid: 1234,
    });
    const { siweMessage, message } = res._unsafeUnwrap();
    const sig = await account.signMessage({ message });
    const parsedSiweMessage = parseNonPartialSiweMessage(message);
    const result = await verify(nonce, domain, parsedSiweMessage, sig, {
      getFid,
      client: createPublicClient({ chain: optimism, transport: http() }),
    });
    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toEqual({
      ...siweMessage,
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
    const { siweMessage, message } = res._unsafeUnwrap();
    const sig = await account.signMessage({ message });

    const parsedSiweMessage = parseNonPartialSiweMessage(message);
    const result = await verify(nonce, domain, parsedSiweMessage, sig, {
      getFid,
      client: createPublicClient({ chain: optimism, transport: http() }),
    });
    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toEqual({
      ...siweMessage,
      fid: 1234,
    });
  });

  test("verifies valid 1271 signatures", async () => {
    const getFid = (_custody: Hex) => Promise.resolve(1234n);

    const res = build({
      ...siweParams,
      address: "0xC89858205c6AdDAD842E1F58eD6c42452671885A",
      fid: 1234,
    });
    const { siweMessage, message } = res._unsafeUnwrap();
    const sig = await account.signMessage({ message });
    const parsedSiweMessage = parseNonPartialSiweMessage(message);
    const result = await verify(nonce, domain, parsedSiweMessage, sig, {
      getFid,
      client: createPublicClient({ chain: optimism, transport: http() }),
    });
    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toEqual({
      ...siweMessage,
      fid: 1234,
    });
  });

  test("invalid SIWE message", async () => {
    const getFid = (_custody: Hex) => Promise.resolve(1234n);

    const res = build({
      ...siweParams,
      address: zeroAddress,
      fid: 1234,
    });
    const { message } = res._unsafeUnwrap();
    const sig = await account.signMessage({
      message,
    });
    const parsedSiweMessage = parseNonPartialSiweMessage(message);
    const result = await verify(nonce, domain, parsedSiweMessage, sig, {
      getFid,
      client: createPublicClient({ chain: optimism, transport: http() }),
    });
    expect(result.isOk()).toBe(false);
    const err = result._unsafeUnwrapErr();
    expect(err.errCode).toBe("unauthorized");
    expect(err.message).toBe("Signature does not match address of the message.");
  });

  test("invalid fid owner", async () => {
    const getFid = (_custody: Hex) => Promise.resolve(5678n);

    const res = build({
      ...siweParams,
      address: account.address,
      fid: 1234,
    });
    const { message } = res._unsafeUnwrap();
    const sig = await account.signMessage({
      message,
    });
    const parsedSiweMessage = parseNonPartialSiweMessage(message);
    const result = await verify(nonce, domain, parsedSiweMessage, sig, {
      getFid,
      client: createPublicClient({ chain: optimism, transport: http() }),
    });
    expect(result.isOk()).toBe(false);
    const err = result._unsafeUnwrapErr();
    expect(err.errCode).toBe("unauthorized");
    expect(err.message).toBe(`Invalid resource: signer ${account.address} does not own fid 1234.`);
  });

  test("client error", async () => {
    const getFid = (_custody: Hex) => Promise.reject(new Error("client error"));

    const res = build({
      ...siweParams,
      address: account.address,
      fid: 1234,
    });
    const { message } = res._unsafeUnwrap();
    const sig = await account.signMessage({
      message,
    });
    const parsedSiweMessage = parseNonPartialSiweMessage(message);
    const result = await verify(nonce, domain, parsedSiweMessage, sig, {
      getFid,
      client: createPublicClient({ chain: optimism, transport: http() }),
    });
    expect(result.isOk()).toBe(false);
    const err = result._unsafeUnwrapErr();
    expect(err.errCode).toBe("unavailable");
    expect(err.message).toBe("client error");
  });

  test("mismatched nonce", async () => {
    const getFid = (_custody: Hex) => Promise.resolve(5678n);
    const res = build({
      ...siweParams,
      address: account.address,
      fid: 1234,
    });
    const { message } = res._unsafeUnwrap();
    const sig = await account.signMessage({
      message,
    });
    const parsedSiweMessage = parseNonPartialSiweMessage(message);
    const result = await verify("mismatched-nonce", domain, parsedSiweMessage, sig, {
      getFid,
      client: createPublicClient({ chain: optimism, transport: http() }),
    });
    expect(result.isOk()).toBe(false);
    const err = result._unsafeUnwrapErr();
    expect(err.errCode).toBe("unauthorized");
    expect(err.message).toBe("Invalid nonce");
  });

  test("mismatched domain", async () => {
    const getFid = (_custody: Hex) => Promise.resolve(5678n);
    const res = build({
      ...siweParams,
      address: account.address,
      fid: 1234,
    });
    const { message } = res._unsafeUnwrap();
    const sig = await account.signMessage({
      message,
    });
    const parsedSiweMessage = parseNonPartialSiweMessage(message);
    const result = await verify(nonce, "mismatched-domain", parsedSiweMessage, sig, {
      getFid,
      client: createPublicClient({ chain: optimism, transport: http() }),
    });
    expect(result.isOk()).toBe(false);
    const err = result._unsafeUnwrapErr();
    expect(err.errCode).toBe("unauthorized");
    expect(err.message).toBe("Invalid domain");
  });
});
