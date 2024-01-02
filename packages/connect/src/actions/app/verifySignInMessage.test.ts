import { createAppClient } from "../../clients/createAppClient";
import { createAuthClient } from "../../clients/createAuthClient";
import { viem } from "../../clients/ethereum/viem";
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";
import { ConnectError } from "../../errors";

describe("verifySignInMessage", () => {
  const client = createAppClient({
    ethereum: viem(),
  });

  const authClient = createAuthClient({
    ethereum: viem(),
  });

  const account = privateKeyToAccount(generatePrivateKey());

  const siweParams = {
    domain: "example.com",
    uri: "https://example.com/login",
    version: "1",
    issuedAt: "2023-10-01T00:00:00.000Z",
  };

  test("verifies sign in message", async () => {
    const { message } = authClient.buildSignInMessage({
      ...siweParams,
      address: account.address,
      fid: 1234,
    });

    const signature = await account.signMessage({
      message,
    });

    const errMsg = `Invalid resource: signer ${account.address} does not own fid 1234.`;
    const err = new ConnectError("unauthorized", errMsg);
    const { isError, error } = await client.verifySignInMessage({
      message,
      signature,
    });
    expect(isError).toBe(true);
    expect(error).toStrictEqual(err);
  });

  test("verifies 1271 sign in message", async () => {
    const LGTM = "0xC89858205c6AdDAD842E1F58eD6c42452671885A";
    const { message } = authClient.buildSignInMessage({
      ...siweParams,
      address: LGTM,
      fid: 1234,
    });

    const signature = await account.signMessage({
      message,
    });

    const errMsg = `Invalid resource: signer ${LGTM} does not own fid 1234.`;
    const err = new ConnectError("unauthorized", errMsg);
    const { isError, error } = await client.verifySignInMessage({
      message,
      signature,
    });
    expect(isError).toBe(true);
    expect(error).toStrictEqual(err);
  });
});
