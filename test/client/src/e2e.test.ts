import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { RelayServer } from "../../../apps/relay/src/server";
import { createAppClient, createAuthClient } from "../../../packages/connect/src/clients";
import { viem } from "../../../packages/connect/src/clients/ethereum/viem";
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
  describe("e2e", () => {
    test("end to end connect flow", async () => {
      const appClient = createAppClient({
        relayURI: httpServerAddress,
        ethereum: viem(),
      });

      const authClient = createAuthClient({
        relayURI: httpServerAddress,
        ethereum: viem(),
      });

      const account = privateKeyToAccount(generatePrivateKey());

      // 1. App client opens a sign in channel
      const {
        response: connectResponse,
        data: { channelToken, connectURI },
      } = await appClient.connect({
        siweUri: "https://example.com",
        domain: "example.com",
        nonce: "abcd1234",
      });
      expect(connectResponse.status).toBe(201);

      // 1. App client checks channel status
      const {
        response: pendingStatusResponse,
        data: { state: pendingState },
      } = await appClient.status({ channelToken });
      expect(pendingStatusResponse.status).toBe(202);
      expect(pendingState).toBe("pending");

      // 3. Auth client generates a sign in message

      // 3a. Parse connect URI to get channel token and SIWE message params
      const { channelToken: token, params } = authClient.parseSignInURI({
        uri: connectURI,
      });
      expect(token).toBe(channelToken);

      const { siweUri, ...siweParams } = params;
      expect(siweUri).toBe("https://example.com");
      expect(siweParams.domain).toBe("example.com");
      expect(siweParams.nonce).toBe("abcd1234");

      // 3b. Build sign in message
      const siweMessage = authClient.buildSignInMessage({
        ...siweParams,
        uri: siweUri,
        address: account.address,
        fid: 1,
      });

      // 3c. Collect user signature
      const sig = await account.signMessage({
        message: siweMessage.toMessage(),
      });

      // 3d. Look up userData
      const userData = {
        fid: 1,
        username: "alice",
        bio: "I'm a little teapot who didn't fill out my bio",
        displayName: "Alice Teapot",
        pfpUrl: "https://example.com/alice.png",
      };

      // 3e. Send back signed message
      const { response: authResponse } = await authClient.authenticate({
        channelToken,
        message: siweMessage.toMessage(),
        signature: sig,
        ...userData,
      });
      expect(authResponse.status).toBe(201);

      // 4. App client polls channel status
      const {
        response: completedStatusResponse,
        data: { state: completedState, message, signature, nonce },
      } = await appClient.status({ channelToken });
      expect(completedStatusResponse.status).toBe(200);
      expect(completedState).toBe("completed");
      expect(message).toBe(siweMessage.toMessage());
      expect(signature).toBe(sig);
      expect(nonce).toBe(nonce);

      // 5. Channel is now closed
      const { response: channelClosedResponse } = await appClient.status({
        channelToken,
      });
      expect(channelClosedResponse.status).toBe(401);
    });
  });
});
