import { verifySiweMessageWithVerifier } from "./verifySiweMessageWithVerifier.js";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { type Hex, zeroAddress } from "viem";
import { getDefaultProvider } from "ethers";
import { AuthClientError } from "../errors.js";
import { createSiweMessage } from "./createSiweMessage.js";

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
  test("verifies valid EOA signatures", async () => {
    const getFid = (_custody: Hex) => Promise.resolve(1234n);

    const res = createSiweMessage({
      ...siweParams,
      address: account.address,
      fid: 1234,
    });
    const siweMessage = res;
    const message = siweMessage.toMessage();
    const signature = await account.signMessage({ message });
    const result = await verifySiweMessageWithVerifier({ nonce, domain, message, signature, verifier: { getFid } });
    expect(result).toEqual({
      data: siweMessage,
      success: true,
      fid: 1234,
    });
  });

  test("adds parsed resources to response", async () => {
    const getFid = (_custody: Hex) => Promise.resolve(1234n);

    const res = createSiweMessage({
      ...siweParams,
      address: account.address,
      fid: 1234,
    });
    const siweMessage = res;
    const message = siweMessage.toMessage();
    const signature = await account.signMessage({ message });
    const result = await verifySiweMessageWithVerifier({ nonce, domain, message, signature, verifier: { getFid } });
    expect(result).toEqual({
      data: siweMessage,
      success: true,
      fid: 1234,
    });
  });

  test("verifies valid 1271 signatures", async () => {
    const getFid = (_custody: Hex) => Promise.resolve(1234n);
    const provider = getDefaultProvider("https://mainnet.optimism.io");

    const res = createSiweMessage({
      ...siweParams,
      address: "0xC89858205c6AdDAD842E1F58eD6c42452671885A",
      fid: 1234,
    });
    const siweMessage = res;
    const message = siweMessage.toMessage();
    const sig = await account.signMessage({ message });
    const result = await verifySiweMessageWithVerifier({ nonce, domain, message, sig, verifier: { getFid, provider } });
    expect(result).toEqual({
      data: siweMessage,
      success: true,
      fid: 1234,
    });
  });

  test("1271 signatures fail without provider", async () => {
    const getFid = (_custody: Hex) => Promise.resolve(1234n);

    const res = createSiweMessage({
      ...siweParams,
      address: "0xC89858205c6AdDAD842E1F58eD6c42452671885A",
      fid: 1234,
    });
    const siweMessage = res;
    const message = siweMessage.toMessage();
    const signature = await account.signMessage({ message });
    try {
      await verifySiweMessageWithVerifier({ nonce, domain, message, signature, verifier: { getFid } });
      expect(true).toBe(false);
    } catch (e) {
      expect(e).toBeInstanceOf(AuthClientError);
      if (!(e instanceof AuthClientError)) throw new Error("unexpected");

      expect(e.errCode).toBe("unauthorized");
      expect(e.message).toBe("Signature does not match address of the message.");
    }
  });

  test("invalid SIWE message", async () => {
    const getFid = (_custody: Hex) => Promise.resolve(1234n);

    const res = createSiweMessage({
      ...siweParams,
      address: zeroAddress,
      fid: 1234,
    });
    const siweMessage = res;
    const message = siweMessage.toMessage();
    const sig = await account.signMessage({
      message,
    });
    try {
      await verifySiweMessageWithVerifier({ nonce, domain, message, sig, verifier: { getFid } });
      expect(true).toBe(false);
    } catch (e) {
      expect(e).toBeInstanceOf(AuthClientError);
      if (!(e instanceof AuthClientError)) throw new Error("unexpected");

      expect(e.errCode).toBe("unauthorized");
      expect(e.message).toBe("Signature does not match address of the message.");
    }
  });

  test("invalid fid owner", async () => {
    const getFid = (_custody: Hex) => Promise.resolve(5678n);

    const res = createSiweMessage({
      ...siweParams,
      address: account.address,
      fid: 1234,
    });
    const siweMessage = res;
    const message = siweMessage.toMessage();
    const signature = await account.signMessage({
      message,
    });
    try {
      await verifySiweMessageWithVerifier({ nonce, domain, message, signature, verifier: { getFid } });
      expect(true).toBe(false);
    } catch (e) {
      expect(e).toBeInstanceOf(AuthClientError);
      if (!(e instanceof AuthClientError)) throw new Error("unexpected");

      expect(e.errCode).toBe("unauthorized");
      expect(e.message).toBe(`Invalid resource: signer ${account.address} does not own fid 1234.`);
    }
  });

  test("client error", async () => {
    const getFid = (_custody: Hex) => Promise.reject(new Error("client error"));

    const res = createSiweMessage({
      ...siweParams,
      address: account.address,
      fid: 1234,
    });
    const siweMessage = res;
    const message = siweMessage.toMessage();
    const signature = await account.signMessage({
      message,
    });
    try {
      await verifySiweMessageWithVerifier({ nonce, domain, message, signature, verifier: { getFid } });
      expect(true).toBe(false);
    } catch (e) {
      expect(e).toBeInstanceOf(AuthClientError);
      if (!(e instanceof AuthClientError)) throw new Error("unexpected");

      expect(e.errCode).toBe("unavailable");
      expect(e.message).toBe("client error");
    }
  });

  test("mismatched nonce", async () => {
    const res = createSiweMessage({
      ...siweParams,
      address: account.address,
      fid: 1234,
    });
    const siweMessage = res;
    const message = siweMessage.toMessage();
    const signature = await account.signMessage({
      message,
    });
    const getFid = (_custody: Hex) => Promise.resolve(1234n);
    try {
      await verifySiweMessageWithVerifier({
        nonce: "mismatched-nonce",
        domain,
        message,
        signature,
        verifier: { getFid },
      });
      expect(true).toBe(false);
    } catch (e) {
      expect(e).toBeInstanceOf(AuthClientError);
      if (!(e instanceof AuthClientError)) throw new Error("unexpected");

      expect(e.errCode).toBe("unauthorized");
      expect(e.message).toBe("Invalid nonce");
    }
  });

  test("mismatched domain", async () => {
    const res = createSiweMessage({
      ...siweParams,
      address: account.address,
      fid: 1234,
    });
    const siweMessage = res;
    const message = siweMessage.toMessage();
    const signature = await account.signMessage({
      message,
    });
    const getFid = (_custody: Hex) => Promise.resolve(1234n);
    try {
      await verifySiweMessageWithVerifier({
        nonce,
        domain: "mismatched-domain",
        message,
        signature,
        verifier: { getFid },
      });
      expect(true).toBe(false);
    } catch (e) {
      expect(e).toBeInstanceOf(AuthClientError);
      if (!(e instanceof AuthClientError)) throw new Error("unexpected");

      expect(e.errCode).toBe("unauthorized");
      expect(e.message).toBe("Invalid domain");
    }
  });
});
