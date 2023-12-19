import { createWalletClient, WalletClient } from "./createWalletClient";

describe("createWalletClient", () => {
  const config = {
    relayURI: "https://connect.farcaster.xyz",
  };

  let walletClient: WalletClient;

  beforeEach(() => {
    walletClient = createWalletClient(config);
  });

  test("adds version to config", () => {
    expect(walletClient.config).toEqual({
      relayURI: "https://connect.farcaster.xyz",
      version: "v1",
    });
  });

  test("overrides version", () => {
    walletClient = createWalletClient({
      ...config,
      version: "v2",
    });

    expect(walletClient.config).toEqual({
      relayURI: "https://connect.farcaster.xyz",
      version: "v2",
    });
  });

  test("includes app actions", () => {
    expect(walletClient.authenticate).toBeDefined();
  });
});
