import { createClient, Client } from "./createClient";
import { viem } from "./ethereum/viem";

describe("createClient", () => {
  const ethereum = viem();
  const config = {
    ethereum,
  };

  let client: Client;

  beforeEach(() => {
    client = createClient(config);
  });

  test("adds defaults to config", () => {
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

  test("overrides relayURI", () => {
    client = createClient({
      ...config,
      relayURI: "https://custom-server.example.com",
    });

    expect(client.config).toEqual({
      relayURI: "https://custom-server.example.com",
      version: "v1",
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
