import { createAppClient } from "../../clients/createAppClient";
import { createAuthClient } from "../../clients/createAuthClient";
import { viem } from "../../clients/ethereum/viem";
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";
import { ConnectError } from "../../errors";

describe("verifySignInMessage", () => {
  const client = createAppClient({
    relayURI: "https://connect.farcaster.xyz",
    ethereum: viem(),
  });

  const authClient = createAuthClient({
    relayURI: "https://connect.farcaster.xyz",
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
    const message = authClient.buildSignInMessage({
      ...siweParams,
      address: account.address,
      fid: 1234,
    });

    const signature = await account.signMessage({
      message: message.toMessage(),
    });

    const errMsg = `Invalid resource: signer ${account.address} does not own fid 1234.`;
    const error = new ConnectError("unauthorized", errMsg);

    await expect(
      client.verifySignInMessage({
        message,
        signature,
      }),
    ).rejects.toStrictEqual(error);
  });
});
