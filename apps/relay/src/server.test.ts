import { RelayServer } from "./server";
import { jest } from "@jest/globals";

let httpServer: RelayServer;
let httpServerAddress: string;

async function request(
  path: string,
  options: RequestInit = {},
): Promise<{ status: number; data: Record<string, unknown>; headers: Headers }> {
  const url = `${httpServerAddress}${path}`;
  const res = await fetch(url, options);
  const data = await res.json();
  return { status: res.status, data: data as Record<string, unknown>, headers: res.headers };
}

beforeAll(async () => {
  httpServer = new RelayServer({
    redisUrl: "redis://localhost:6379",
    ttl: 3600,
    corsOrigin: "*",
  });
  httpServerAddress = await httpServer.start("127.0.0.1", 0);
});

afterAll(async () => {
  await httpServer.stop();
});

afterEach(async () => {
  await httpServer.channels.clear?.();
  jest.restoreAllMocks();
});

describe("relay server", () => {
  const channelParams = {
    siweUri: "https://example.com",
    domain: "example.com",
  };

  const authenticateParams = {
    message: "example.com wants you to sign in with your Ethereum account: [...]",
    signature:
      "0x9335c30585854d1bd7040dccfbb18bfecc9eba6ee18c55a3996ef0aca783fba832b13b05dc09beec99fc6477804113fd293c68c84ea350a11794cdc121c71fd51b",
    fid: 1,
    username: "alice",
    bio: "I'm a little teapot who didn't fill out my bio",
    displayName: "Alice Teapot",
    pfpUrl: "https://example.com/alice.png",
  };

  describe("cors", () => {
    test("allows cross-origin requests", async () => {
      const response = await request("/healthcheck", {
        headers: { Origin: "http://example.com" },
      });

      expect(response.status).toBe(200);
      expect(response.headers.get("access-control-allow-origin")).toBe("*");
    });
  });

  describe("/healthcheck", () => {
    test("GET returns status", async () => {
      const response = await request("/healthcheck");

      expect(response.status).toBe(200);
      expect(response.data).toEqual({ status: "OK" });
    });
  });

  describe("/v1/channel", () => {
    test("POST creates a channel", async () => {
      const response = await request("/v1/channel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(channelParams),
      });

      expect(response.status).toBe(201);
      const { channelToken, url, connectUri, nonce } = response.data;
      expect(channelToken).toMatch(/[2-9A-HJ-NP-Z]{8}/);
      expect(url).toContain("farcaster.xyz/~/siwf");
      expect(url).toBe(connectUri);
      expect(nonce).toBeDefined();
    });

    test("creates a channel with extra SIWE parameters", async () => {
      const customNonce = "some-custom-nonce";
      const notBefore = "2023-01-01T00:00:00Z";
      const expirationTime = "2023-12-31T00:00:00Z";
      const requestId = "some-request-id";
      const redirectUrl = "http://some-redirect-url";
      let response = await request("/v1/channel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...channelParams,
          nonce: customNonce,
          notBefore,
          expirationTime,
          requestId,
          redirectUrl,
        }),
      });

      expect(response.status).toBe(201);
      const { channelToken, url, connectUri, nonce, ...rest } = response.data;
      const params = new URLSearchParams((url as string).split("?")[1]);
      expect(params.get("channelToken")).toBe(channelToken);
      expect(channelToken).toMatch(/[2-9A-HJ-NP-Z]{8}/);
      expect(nonce).toBe(customNonce);
      expect(url).toBe(connectUri);
      expect(rest).toStrictEqual({});

      response = await request("/v1/channel/status", {
        headers: { Authorization: `Bearer ${channelToken}` },
      });

      expect(response.data["acceptAuthAddress"]).toBe(true);

      const siweParams = response.data["signatureParams"] as Record<string, unknown>;

      expect(siweParams["siweUri"]).toBe(channelParams.siweUri);
      expect(siweParams["domain"]).toBe(channelParams.domain);
      expect(siweParams["nonce"]).toBe(customNonce);
      expect(siweParams["notBefore"]).toBe(notBefore);
      expect(siweParams["expirationTime"]).toBe(expirationTime);
      expect(siweParams["requestId"]).toBe(requestId);
      expect(siweParams["redirectUrl"]).toBe(redirectUrl);
    });

    test("creates a channel with accepted auth method", async () => {
      let response = await request("/v1/channel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...channelParams,
          acceptAuthAddress: true,
        }),
      });

      expect(response.status).toBe(201);
      const { channelToken, url, connectUri } = response.data;
      const params = new URLSearchParams((url as string).split("?")[1]);
      expect(params.get("channelToken")).toBe(channelToken);
      expect(channelToken).toMatch(/[2-9A-HJ-NP-Z]{8}/);
      expect(url).toBe(connectUri);

      response = await request("/v1/channel/status", {
        headers: { Authorization: `Bearer ${channelToken}` },
      });

      expect(response.data["acceptAuthAddress"]).toBe(true);
    });

    test("restricted domain", async () => {
      const response = await request("/v1/channel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...channelParams,
          domain: "farcaster.xyz",
        }),
      });

      expect(response.status).toBe(400);
      expect(response.data).toEqual({ error: "Domain not allowed" });
    });

    test("subdomain of restricted domain", async () => {
      const response = await request("/v1/channel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...channelParams,
          domain: "app.farcaster.xyz",
        }),
      });

      expect(response.status).toBe(400);
      expect(response.data).toEqual({ error: "Domain not allowed" });
    });
  });

  describe("/v1/channel/authenticate", () => {
    let channelToken: string;

    beforeEach(async () => {
      const response = await request("/v1/channel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(channelParams),
      });
      channelToken = response.data["channelToken"] as string;
    });

    test("POST with no token", async () => {
      const response = await request("/v1/channel/authenticate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authenticateParams),
      });
      expect(response.status).toBe(401);
    });

    test("POST with valid token", async () => {
      const response = await request("/v1/channel/authenticate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${channelToken}`,
          "X-Farcaster-Auth-Relay-Key": "some-shared-secret",
        },
        body: JSON.stringify(authenticateParams),
      });
      expect(response.status).toBe(201);
    });

    test("POST with invalid token", async () => {
      let response = await request("/v1/channel/authenticate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer abc-123-def",
          "X-Farcaster-Auth-Relay-Key": "some-shared-secret",
        },
        body: JSON.stringify(authenticateParams),
      });
      expect(response.status).toBe(401);

      response = await request("/v1/channel/status", {
        headers: { Authorization: `Bearer ${channelToken}` },
      });
      expect(response.data["state"]).toBe("pending");
    });

    test("POST with invalid key", async () => {
      const response = await request("/v1/channel/authenticate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer abc-123-def",
          "X-Farcaster-Auth-Relay-Key": "invalid-shared-secret",
        },
        body: JSON.stringify(authenticateParams),
      });
      expect(response.status).toBe(401);
    });

    test("expired channel", async () => {
      await httpServer.channels.close(channelToken);
      const response = await request("/v1/channel/authenticate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${channelToken}`,
          "X-Farcaster-Auth-Relay-Key": "some-shared-secret",
        },
        body: JSON.stringify(authenticateParams),
      });
      expect(response.status).toBe(401);
    });
  });

  describe("/v1/channel/status", () => {
    let channelToken: string;

    beforeEach(async () => {
      const response = await request("/v1/channel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(channelParams),
      });
      channelToken = response.data["channelToken"] as string;
    });

    test("GET with no token", async () => {
      const response = await request("/v1/channel/status");
      expect(response.status).toBe(401);
    });

    test("GET with valid token", async () => {
      const response = await request("/v1/channel/status", {
        headers: { Authorization: `Bearer ${channelToken}` },
      });
      expect(response.status).toBe(202);

      const { state, nonce } = response.data;
      expect(state).toBe("pending");
      expect(nonce).toMatch(/[a-zA-Z0-9]{16}/);
    });

    test("GET with invalid token", async () => {
      const response = await request("/v1/channel/status", {
        headers: { Authorization: "Bearer abc-123-def" },
      });
      expect(response.status).toBe(401);
    });
  });

  describe("e2e", () => {
    test("end to end channel flow", async () => {
      const nonce = "some-custom-nonce";
      let response = await request("/v1/channel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...channelParams,
          nonce,
        }),
      });
      expect(response.status).toBe(201);

      const channelToken = response.data["channelToken"] as string;

      response = await request("/v1/channel/status", {
        headers: { Authorization: `Bearer ${channelToken}` },
      });
      expect(response.status).toBe(202);
      expect(response.data["state"]).toBe("pending");

      response = await request("/v1/channel/authenticate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${channelToken}`,
          "X-Farcaster-Auth-Relay-Key": "some-shared-secret",
        },
        body: JSON.stringify(authenticateParams),
      });
      expect(response.status).toBe(201);

      response = await request("/v1/channel/status", {
        headers: { Authorization: `Bearer ${channelToken}` },
      });
      expect(response.status).toBe(200);
      expect(response.data["state"]).toBe("completed");
      expect(response.data["message"]).toBe(authenticateParams.message);
      expect(response.data["signature"]).toBe(authenticateParams.signature);
      expect(response.data["nonce"]).toBe(nonce);

      response = await request("/v1/channel/status", {
        headers: { Authorization: `Bearer ${channelToken}` },
      });
      expect(response.status).toBe(401);
    });
  });
});
