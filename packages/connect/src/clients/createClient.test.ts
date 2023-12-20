import { createClient, Client } from "./createClient";
import { viem } from "./ethereum/viem";

describe("createClient", () => {
  const ethereum = viem();
  const config = {
    relayURI: "https://connect.farcaster.xyz",
    ethereum,
  };

  let client: Client;

  beforeEach(() => {
    client = createClient(config);
  });

  test("adds version to config", () => {
    expect(client.config).toEqual({
      relayURI: "https://connect.farcaster.xyz",
      version: "v1",
    });
  });

  test("overrides version", () => {
    client = createClient({
      ...config,
      version: "v2",
    });

    expect(client.config).toEqual({
      relayURI: "https://connect.farcaster.xyz",
      version: "v2",
    });
  });

  test("includes no actions", () => {
    client = createClient({
      ...config,
      version: "v2",
    });

    expect(client).toEqual({
      config: {
        relayURI: "https://connect.farcaster.xyz",
        version: "v2",
      },
      ethereum,
    });
  });
});
