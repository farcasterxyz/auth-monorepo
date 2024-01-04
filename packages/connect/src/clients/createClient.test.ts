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
      relay: "https://connect.farcaster.xyz",
      version: "v1",
    });
  });

  test("overrides version", () => {
    client = createClient({
      ...config,
      version: "v2",
    });

    expect(client.config).toEqual({
      relay: "https://connect.farcaster.xyz",
      version: "v2",
    });
  });

  test("overrides relay", () => {
    client = createClient({
      ...config,
      relay: "https://custom-server.example.com",
    });

    expect(client.config).toEqual({
      relay: "https://custom-server.example.com",
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
        relay: "https://connect.farcaster.xyz",
        version: "v2",
      },
      ethereum,
    });
  });
});
