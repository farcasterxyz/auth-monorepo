import { createAppClient } from "../../clients/createAppClient.js";
import { viemConnector } from "../../clients/ethereum/viemConnector.js";
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";
import { AuthClientError } from "../../errors.js";
import { createSiweMessage } from "../../utils/createSiweMessage.js";
import { JsonRpcProvider } from "ethers";

describe("verifySiweMessage", () => {
  const client = createAppClient(
    {
      ethereum: viemConnector(),
    },
    new JsonRpcProvider("https://mainnet.optimism.io/", 10),
  );

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
    const siweMessage = createSiweMessage({
      ...siweParams,
      address: account.address,
      fid: 1234,
    });

    const signature = await account.signMessage({
      message: siweMessage.toMessage(),
    });

    const errMsg = `Invalid resource: signer ${account.address} does not own fid 1234.`;
    const err = new AuthClientError("unauthorized", errMsg);
    try {
      await client.verifySiweMessage({
        nonce,
        domain,
        message: siweMessage.toMessage(),
        signature,
      });
      expect(true).toBe(false);
    } catch (e) {
      expect(e).toStrictEqual(err);
    }
  });

  test("verifies 1271 sign in message", async () => {
    const LGTM = "0xC89858205c6AdDAD842E1F58eD6c42452671885A";
    const siweMessage = createSiweMessage({
      ...siweParams,
      address: LGTM,
      fid: 1234,
    });

    const signature = await account.signMessage({
      message: siweMessage.toMessage(),
    });

    const errMsg = `Invalid resource: signer ${LGTM} does not own fid 1234.`;
    const err = new AuthClientError("unauthorized", errMsg);

    try {
      await client.verifySiweMessage({
        nonce,
        domain,
        message: siweMessage,
        signature,
      });
      expect(true).toBe(false);
    } catch (e) {
      expect(e).toStrictEqual(err);
    }
  });
});
