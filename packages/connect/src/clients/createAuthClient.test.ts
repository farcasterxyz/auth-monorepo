import { createAuthClient, AuthClient } from "./createAuthClient";

describe("createAuthClient", () => {
  const config = {
    relayURI: "https://connect.farcaster.xyz",
  };

  let authClient: AuthClient;

  beforeEach(() => {
    authClient = createAuthClient(config);
  });

  test("adds version to config", () => {
    expect(authClient.config).toEqual({
      relayURI: "https://connect.farcaster.xyz",
      version: "v1",
    });
  });

  test("overrides version", () => {
    authClient = createAuthClient({
      ...config,
      version: "v2",
    });

    expect(authClient.config).toEqual({
      relayURI: "https://connect.farcaster.xyz",
      version: "v2",
    });
  });

  test("includes app actions", () => {
    expect(authClient.authenticate).toBeDefined();
  });
});
