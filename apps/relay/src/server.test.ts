import { RelayServer } from "./server";
import axios from "axios";
import { jest } from "@jest/globals";

let httpServer: RelayServer;
let httpServerAddress: string;

const http = axios.create({
  validateStatus: () => true,
});

function getFullUrl(path: string) {
  return `${httpServerAddress}${path}`;
}

beforeAll(async () => {
  httpServer = new RelayServer({
    redisUrl: "redis://localhost:6379",
    ttl: 3600,
    corsOrigin: "*",
  });
  httpServerAddress = (await httpServer.start())._unsafeUnwrap();
});

afterAll(async () => {
  await httpServer.stop();
});

afterEach(async () => {
  await httpServer.channels.clear();
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
      const response = await http.get(getFullUrl("/healthcheck"), {
        headers: { Origin: "http://example.com" },
      });

      expect(response.status).toBe(200);
      expect(response.headers["access-control-allow-origin"]).toBe("*");
    });
  });

  describe("/healthcheck", () => {
    test("GET returns status", async () => {
      const response = await http.get(getFullUrl("/healthcheck"));

      expect(response.status).toBe(200);
      expect(response.data).toStrictEqual({ status: "OK" });
    });
  });

  describe("/v1/channel", () => {
    test("POST creates a channel", async () => {
      const response = await http.post(getFullUrl("/v1/channel"), channelParams);

      expect(response.status).toBe(201);
      const { channelToken, url, connectUri, nonce, ...rest } = response.data;
      expect(channelToken).toMatch(/[a-f0-9]{8}-([a-f0-9]{4}-){3}[a-f0-9]{12}/);
      expect(url).toMatch("https://warpcast.com/~/sign-in-with-farcaster");
      expect(url).toBe(connectUri);
      expect(rest).toStrictEqual({});
    });

    test("creates a channel with extra SIWE parameters", async () => {
      const customNonce = "some-custom-nonce";
      const notBefore = "2023-01-01T00:00:00Z";
      const expirationTime = "2023-12-31T00:00:00Z";
      const requestId = "some-request-id";
      const redirectUrl = "http://some-redirect-url";
      const response = await http.post(getFullUrl("/v1/channel"), {
        ...channelParams,
        nonce: customNonce,
        notBefore,
        expirationTime,
        requestId,
        redirectUrl,
      });

      expect(response.status).toBe(201);
      const { channelToken, url, connectUri, nonce, ...rest } = response.data;
      // parse query params from URI
      const params = new URLSearchParams(url.split("?")[1]);
      expect(params.get("siweUri")).toBe(channelParams.siweUri);
      expect(params.get("domain")).toBe(channelParams.domain);
      expect(params.get("nonce")).toBe(customNonce);
      expect(params.get("notBefore")).toBe(notBefore);
      expect(params.get("expirationTime")).toBe(expirationTime);
      expect(params.get("requestId")).toBe(requestId);
      expect(params.get("redirectUrl")).toBe(redirectUrl);
      expect(channelToken).toMatch(/[a-f0-9]{8}-([a-f0-9]{4}-){3}[a-f0-9]{12}/);
      expect(nonce).toBe(customNonce);
      expect(url).toBe(connectUri);
      expect(rest).toStrictEqual({});
    });

    test("validates extra SIWE parameters", async () => {
      const notBefore = "not a datetime";
      const response = await http.post(getFullUrl("/v1/channel"), {
        ...channelParams,
        notBefore,
      });

      expect(response.status).toBe(400);
      expect(response.data).toStrictEqual({
        error: "Validation error",
        message: 'body/notBefore must match format "date-time"',
      });
    });

    test("missing siweUri", async () => {
      const { siweUri, ...missingUri } = channelParams;
      const response = await http.post(getFullUrl("/v1/channel"), missingUri);

      expect(response.status).toBe(400);
      expect(response.data).toStrictEqual({
        error: "Validation error",
        message: "body must have required property 'siweUri'",
      });
    });

    test("invalid siweUri", async () => {
      const response = await http.post(getFullUrl("/v1/channel"), {
        ...channelParams,
        siweUri: "not-a-uri",
      });

      expect(response.status).toBe(400);
      expect(response.data).toStrictEqual({
        error: "Validation error",
        message: 'body/siweUri must match format "uri"',
      });
    });

    test("missing domain", async () => {
      const { domain, ...missingDomain } = channelParams;
      const response = await http.post(getFullUrl("/v1/channel"), missingDomain);

      expect(response.status).toBe(400);
      expect(response.data).toStrictEqual({
        error: "Validation error",
        message: "body must have required property 'domain'",
      });
    });

    test("invalid domain", async () => {
      const response = await http.post(getFullUrl("/v1/channel"), {
        ...channelParams,
        domain: "not a domain",
      });

      expect(response.status).toBe(400);
      expect(response.data).toStrictEqual({
        error: "Validation error",
        message: 'body/domain must match pattern "^[a-zA-Z0-9.-]+(:[0-9]+)?$"',
      });
    });

    test("domain with port", async () => {
      const response = await http.post(getFullUrl("/v1/channel"), {
        ...channelParams,
        domain: "localhost:3000",
      });

      expect(response.status).toBe(201);
    });

    test("open channel error", async () => {
      jest.spyOn(httpServer.channels, "open").mockImplementation(() => {
        throw new Error("open error");
      });
      const response = await http.post(getFullUrl("/v1/channel"), channelParams);

      expect(response.status).toBe(500);
      expect(response.data).toStrictEqual({ error: "open error" });
    });

    test("update channel error", async () => {
      jest.spyOn(httpServer.channels, "update").mockImplementation(() => {
        throw new Error("update error");
      });
      const response = await http.post(getFullUrl("/v1/channel"), channelParams);

      expect(response.status).toBe(500);
      expect(response.data).toStrictEqual({ error: "update error" });
    });
  });

  describe("/v1/channel/authenticate", () => {
    let channelToken: string;

    beforeEach(async () => {
      const response = await http.post(getFullUrl("/v1/channel"), channelParams);
      channelToken = response.data.channelToken;
    });

    test("POST with no token", async () => {
      const response = await http.post(getFullUrl("/v1/channel/authenticate"), authenticateParams);
      expect(response.status).toBe(401);
    });

    test("POST with valid token", async () => {
      const response = await http.post(getFullUrl("/v1/channel/authenticate"), authenticateParams, {
        headers: {
          Authorization: `Bearer ${channelToken}`,
          "X-Farcaster-Auth-Relay-Key": "some-shared-secret",
        },
      });
      expect(response.status).toBe(201);
    });

    test("POST with invalid token", async () => {
      let response = await http.post(getFullUrl("/v1/channel/authenticate"), authenticateParams, {
        headers: {
          Authorization: "Bearer abc-123-def",
          "X-Farcaster-Auth-Relay-Key": "some-shared-secret",
        },
      });
      expect(response.status).toBe(401);
      response = await http.get(getFullUrl("/v1/channel/status"), {
        headers: { Authorization: `Bearer ${channelToken}` },
      });
      expect(response.data.state).toBe("pending");
    });

    test("POST with invalid key", async () => {
      const response = await http.post(getFullUrl("/v1/channel/authenticate"), authenticateParams, {
        headers: {
          Authorization: "Bearer abc-123-def",
          "X-Farcaster-Auth-Relay-Key": "invalid-shared-secret",
        },
      });
      expect(response.status).toBe(401);
    });

    test("missing body param", async () => {
      const { fid, ...missingFid } = authenticateParams;
      const response = await http.post(getFullUrl("/v1/channel/authenticate"), missingFid, {
        headers: { Authorization: `Bearer ${channelToken}` },
      });
      expect(response.status).toBe(400);
      expect(response.data).toStrictEqual({
        error: "Validation error",
        message: "body must have required property 'fid'",
      });
    });

    test("optional body param", async () => {
      const { username, ...missingUsername } = authenticateParams;
      const response = await http.post(getFullUrl("/v1/channel/authenticate"), missingUsername, {
        headers: {
          Authorization: `Bearer ${channelToken}`,
          "X-Farcaster-Auth-Relay-Key": "some-shared-secret",
        },
      });
      expect(response.status).toBe(201);
    });

    test("invalid username", async () => {
      const response = await http.post(
        getFullUrl("/v1/channel/authenticate"),
        { ...authenticateParams, username: "not a username" },
        { headers: { Authorization: `Bearer ${channelToken}` } },
      );
      expect(response.status).toBe(400);
      expect(response.data).toStrictEqual({
        error: "Validation error",
        message: 'body/username must match pattern "^[a-z0-9][a-z0-9-]{0,15}$|^[a-z0-9][a-z0-9-]{0,15}\\.eth$"',
      });
    });

    test("invalid signature", async () => {
      const response = await http.post(
        getFullUrl("/v1/channel/authenticate"),
        { ...authenticateParams, signature: "0x123" },
        { headers: { Authorization: `Bearer ${channelToken}` } },
      );
      expect(response.status).toBe(400);
      expect(response.data).toStrictEqual({
        error: "Validation error",
        message: 'body/signature must match pattern "^0x[a-fA-F0-9]{130}$"',
      });
    });

    test("invalid pfpUrl", async () => {
      const response = await http.post(
        getFullUrl("/v1/channel/authenticate"),
        { ...authenticateParams, pfpUrl: "not a URL" },
        { headers: { Authorization: `Bearer ${channelToken}` } },
      );
      expect(response.status).toBe(400);
      expect(response.data).toStrictEqual({
        error: "Validation error",
        message: 'body/pfpUrl must match format "uri"',
      });
    });

    test("read channel error", async () => {
      jest.spyOn(httpServer.channels, "read").mockImplementation(() => {
        throw new Error("read error");
      });
      const response = await http.post(getFullUrl("/v1/channel/authenticate"), authenticateParams, {
        headers: {
          Authorization: `Bearer ${channelToken}`,
          "X-Farcaster-Auth-Relay-Key": "some-shared-secret",
        },
      });
      expect(response.status).toBe(500);
      expect(response.data).toStrictEqual({ error: "read error" });
    });

    test("update channel error", async () => {
      jest.spyOn(httpServer.channels, "update").mockImplementation(() => {
        throw new Error("update error");
      });
      const response = await http.post(getFullUrl("/v1/channel/authenticate"), authenticateParams, {
        headers: {
          Authorization: `Bearer ${channelToken}`,
          "X-Farcaster-Auth-Relay-Key": "some-shared-secret",
        },
      });
      expect(response.status).toBe(500);
      expect(response.data).toStrictEqual({ error: "update error" });
    });

    test("expired channel", async () => {
      await httpServer.channels.close(channelToken);
      const response = await http.post(getFullUrl("/v1/channel/authenticate"), authenticateParams, {
        headers: { Authorization: `Bearer ${channelToken}` },
      });
      expect(response.status).toBe(401);
    });
  });

  describe("/v1/channel/status", () => {
    let channelToken: string;

    beforeEach(async () => {
      const response = await http.post(getFullUrl("/v1/channel"), channelParams);
      channelToken = response.data.channelToken;
    });

    test("GET with no token", async () => {
      const response = await http.get(getFullUrl("/v1/channel/status"));
      expect(response.status).toBe(401);
    });

    test("GET with valid token", async () => {
      const response = await http.get(getFullUrl("/v1/channel/status"), {
        headers: { Authorization: `Bearer ${channelToken}` },
      });
      expect(response.status).toBe(202);

      const { state, nonce, ...rest } = response.data;
      expect(state).toBe("pending");
      expect(nonce).toMatch(/[a-zA-Z0-9]{16}/);
      expect(rest).toStrictEqual({});
    });

    test("GET with invalid token", async () => {
      const response = await http.get(getFullUrl("/v1/channel/status"), {
        headers: { Authorization: "Bearer abc-123-def" },
      });
      expect(response.status).toBe(401);
    });

    test("read channel error", async () => {
      jest.spyOn(httpServer.channels, "read").mockImplementation(() => {
        throw new Error("read error");
      });
      const response = await http.get(getFullUrl("/v1/channel/status"), {
        headers: { Authorization: `Bearer ${channelToken}` },
      });
      expect(response.status).toBe(500);
      expect(response.data).toStrictEqual({ error: "read error" });
    });

    test("close channel error", async () => {
      jest.spyOn(httpServer.channels, "close").mockImplementation(() => {
        throw new Error("close error");
      });
      await http.post(getFullUrl("/v1/channel/authenticate"), authenticateParams, {
        headers: {
          Authorization: `Bearer ${channelToken}`,
          "X-Farcaster-Auth-Relay-Key": "some-shared-secret",
        },
      });
      const response = await http.get(getFullUrl("/v1/channel/status"), {
        headers: { Authorization: `Bearer ${channelToken}` },
      });
      expect(response.status).toBe(500);
      expect(response.data).toStrictEqual({ error: "close error" });
    });
  });

  describe("e2e", () => {
    test("end to end channel flow", async () => {
      const nonce = "some-custom-nonce";
      let response = await http.post(getFullUrl("/v1/channel"), {
        ...channelParams,
        nonce,
      });
      expect(response.status).toBe(201);

      const channelToken = response.data.channelToken;
      const authHeaders = {
        headers: { Authorization: `Bearer ${channelToken}` },
      };

      response = await http.get(getFullUrl("/v1/channel/status"), authHeaders);
      expect(response.status).toBe(202);
      expect(response.data.state).toBe("pending");

      response = await http.post(getFullUrl("/v1/channel/authenticate"), authenticateParams, {
        headers: {
          Authorization: `Bearer ${channelToken}`,
          "X-Farcaster-Auth-Relay-Key": "some-shared-secret",
        },
      });
      expect(response.status).toBe(201);

      response = await http.get(getFullUrl("/v1/channel/status"), authHeaders);
      expect(response.status).toBe(200);
      expect(response.data.state).toBe("completed");
      expect(response.data.message).toBe(authenticateParams.message);
      expect(response.data.signature).toBe(authenticateParams.signature);
      expect(response.data.nonce).toBe(nonce);

      response = await http.get(getFullUrl("/v1/channel/status"), authHeaders);
      expect(response.status).toBe(401);
    });
  });
});
