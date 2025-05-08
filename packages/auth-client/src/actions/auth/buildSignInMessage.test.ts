import { createWalletClient } from "../../clients/createWalletClient";
import { viemConnector } from "../../clients/ethereum/viemConnector";

describe("buildSignInMessage", () => {
  const client = createWalletClient({
    relay: "https://relay.farcaster.xyz",
    ethereum: viemConnector(),
  });

  test("builds Siwe message from provided parameters", async () => {
    const { siweMessage, message } = client.buildSignInMessage({
      address: "0x63C378DDC446DFf1d831B9B96F7d338FE6bd4231",
      uri: "https://example.com/login",
      domain: "example.com",
      nonce: "12345678",
      fid: 1,
      resources: ["https://example.com/resource"],
    });

    expect(siweMessage).toMatchObject({
      address: "0x63C378DDC446DFf1d831B9B96F7d338FE6bd4231",
      statement: "Farcaster Auth",
      chainId: 10,
      uri: "https://example.com/login",
      domain: "example.com",
      version: "1",
      nonce: "12345678",
      resources: ["farcaster://fid/1", "https://example.com/resource"],
    });
    expect(message).toBe(siweMessage.toMessage());
  });
});
