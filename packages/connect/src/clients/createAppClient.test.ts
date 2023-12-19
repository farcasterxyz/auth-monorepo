import { createAppClient, AppClient } from "./createAppClient";

describe("createAppClient", () => {
  const config = {
    relayURI: "https://connect.farcaster.xyz",
  };

  let appClient: AppClient;

  beforeEach(() => {
    appClient = createAppClient(config);
  });

  test("adds version to config", () => {
    expect(appClient.config).toEqual({
      relayURI: "https://connect.farcaster.xyz",
      version: "v1",
    });
  });

  test("overrides version", () => {
    appClient = createAppClient({
      ...config,
      version: "v2",
    });

    expect(appClient.config).toEqual({
      relayURI: "https://connect.farcaster.xyz",
      version: "v2",
    });
  });

  test("includes app actions", () => {
    expect(appClient.connect).toBeDefined();
    expect(appClient.status).toBeDefined();
  });
});
