import { createAppClient } from "../../clients/createAppClient";
import { createWalletClient } from "../../clients/createWalletClient";
import { viemConnector } from "../../clients/ethereum/viemConnector";
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";
import { AuthClientError } from "../../errors";

describe("verifySignInMessage", () => {
  const client = createAppClient({
    ethereum: viemConnector(),
  });

  const walletClient = createWalletClient({
    ethereum: viemConnector(),
  });

  const account = privateKeyToAccount(generatePrivateKey());

  const siweParams = {
    domain: "example.com",
    uri: "https://example.com/login",
    version: "1",
    nonce: "abcd1234",
  } as const;
  const { nonce, domain } = siweParams;

  test("verifies sign in message", async () => {
    const { message } = walletClient.buildSignInMessage({
      ...siweParams,
      address: account.address,
      fid: 1234,
    });

    const signature = await account.signMessage({
      message,
    });

    const errMsg = `Invalid resource: signer ${account.address} does not own fid 1234.`;
    const err = new AuthClientError("unauthorized", errMsg);
    const { isError, error } = await client.verifySignInMessage({
      nonce,
      domain,
      message,
      signature,
      acceptAuthAddress: false,
    });
    expect(isError).toBe(true);
    expect(error).toStrictEqual(err);
  });

  test("verifies 1271 sign in message", async () => {
    const LGTM = "0xC89858205c6AdDAD842E1F58eD6c42452671885A";
    const { message } = walletClient.buildSignInMessage({
      ...siweParams,
      address: LGTM,
      fid: 1234,
    });

    const signature = await account.signMessage({
      message,
    });

    const errMsg = `Invalid resource: signer ${LGTM} does not own fid 1234.`;
    const err = new AuthClientError("unauthorized", errMsg);
    const { isError, error } = await client.verifySignInMessage({
      nonce,
      domain,
      message,
      signature,
      acceptAuthAddress: false,
    });
    expect(isError).toBe(true);
    expect(error).toStrictEqual(err);
  });

  test("verifies auth address sign in message", async () => {
    const { message } = walletClient.buildSignInMessage({
      ...siweParams,
      address: account.address,
      fid: 1234,
    });

    const signature = await account.signMessage({
      message,
    });

    const errMsg = `Invalid resource: signer ${account.address} is not an auth address or owner of fid 1234.`;
    const err = new AuthClientError("unauthorized", errMsg);
    const { isError, error } = await client.verifySignInMessage({
      nonce,
      domain,
      message,
      signature,
      acceptAuthAddress: true,
    });
    expect(isError).toBe(true);
    expect(error).toStrictEqual(err);
  });
});
