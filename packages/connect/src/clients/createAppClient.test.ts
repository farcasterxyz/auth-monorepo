import { createAppClient, AppClient } from "./createAppClient";
import { viem } from "./ethereum/viem";

describe("createAppClient", () => {
  const config = {
    ethereum: viem(),
  };

  let appClient: AppClient;

  beforeEach(() => {
    appClient = createAppClient(config);
  });

  test("adds version to config", () => {
    expect(appClient.config).toEqual({
      relay: "https://relay.farcaster.xyz",
      version: "v1",
    });
  });

  test("overrides version", () => {
    appClient = createAppClient({
      ...config,
      version: "v2",
    });

    expect(appClient.config).toEqual({
      relay: "https://relay.farcaster.xyz",
      version: "v2",
    });
  });

  test("includes app actions", () => {
    expect(appClient.connect).toBeDefined();
    expect(appClient.status).toBeDefined();
  });
});
