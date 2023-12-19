import { RelayServer } from "../../../apps/relay/src/server";
import { createAppClient, createAuthClient } from "../../../packages/connect/src/clients";
import { jest } from "@jest/globals";

let httpServer: RelayServer;
let httpServerAddress: string;

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

describe("clients", () => {
  const connectParams = {
    siweUri: "https://example.com",
    domain: "example.com",
  };

  const authenticateParams = {
    message: "example.com wants you to sign in with your Ethereum account: [...]",
    signature:
      "0x9335c30585854d1bd7040dccfbb18bfecc9eba6ee18c55a3996ef0aca783fba832b13b05dc09beec99fc6477804113fd293c68c84ea350a11794cdc121c71fd51b" as const,
    fid: 1,
    username: "alice",
    bio: "I'm a little teapot who didn't fill out my bio",
    displayName: "Alice Teapot",
    pfpUrl: "https://example.com/alice.png",
  };

  describe("e2e", () => {
    test("end to end connect flow", async () => {
      const appClient = createAppClient({
        relayURI: httpServerAddress,
      });

      const authClient = createAuthClient({
        relayURI: httpServerAddress,
      });

      const customNonce = "some-custom-nonce";
      const {
        response: connectResponse,
        data: { channelToken },
      } = await appClient.connect({ ...connectParams, nonce: customNonce });

      expect(connectResponse.status).toBe(201);

      const {
        response: pendingStatusResponse,
        data: { state: pendingState },
      } = await appClient.status({ channelToken });

      expect(pendingStatusResponse.status).toBe(200);
      expect(pendingState).toBe("pending");

      const { response: authResponse } = await authClient.authenticate({
        channelToken,
        ...authenticateParams,
      });
      expect(authResponse.status).toBe(200);

      const {
        response: completedStatusResponse,
        data: { state: completedState, message, signature, nonce },
      } = await appClient.status({ channelToken });

      expect(completedStatusResponse.status).toBe(200);
      expect(completedState).toBe("completed");
      expect(message).toBe(authenticateParams.message);
      expect(signature).toBe(authenticateParams.signature);
      expect(nonce).toBe(nonce);

      const { response: channelClosedResponse } = await appClient.status({
        channelToken,
      });

      expect(channelClosedResponse.status).toBe(401);
    });
  });
});
