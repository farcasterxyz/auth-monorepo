import { createAppClient } from "../../clients/createAppClient";
import { createWalletClient } from "../../clients/createWalletClient";
import { viemConnector } from "../../clients/ethereum/viemConnector";
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";
import { AuthClientError } from "../../errors";
import { JsonRpcProvider } from "ethers";

describe("verifySignInMessage", () => {
  const client = createAppClient(
    {
      ethereum: viemConnector(),
    },
    new JsonRpcProvider("https://mainnet.optimism.io/", 10),
  );

  const walletClient = createWalletClient({
    ethereum: viemConnector(),
  });

  const account = privateKeyToAccount(generatePrivateKey());

  const siweParams = {
    domain: "example.com",
    uri: "https://example.com/login",
    version: "1",
    issuedAt: "2023-10-01T00:00:00.000Z",
    nonce: "abcd1234",
  };
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
    });
    expect(isError).toBe(true);
    expect(error).toStrictEqual(err);
  });
});
