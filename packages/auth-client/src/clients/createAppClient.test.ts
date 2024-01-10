import { createAppClient, AppClient } from "./createAppClient";
import { viemConnector } from "./ethereum/viemConnector";

describe("createAppClient", () => {
  const config = {
    ethereum: viemConnector(),
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
    expect(appClient.createChannel).toBeDefined();
    expect(appClient.status).toBeDefined();
  });
});
