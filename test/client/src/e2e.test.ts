import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { JsonRpcProvider } from "ethers";
import { RelayServer } from "../../../apps/relay/src/server";
import { createAppClient, createWalletClient } from "../../../packages/auth-client/src/clients";
import { viemConnector } from "../../../packages/auth-client/src/clients/ethereum/viemConnector";
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
    test("end to end auth flow", async () => {
      const appClient = createAppClient({
        relay: httpServerAddress,
        ethereum: viemConnector(),
      });

      const walletClient = createWalletClient({
        relay: httpServerAddress,
        ethereum: viemConnector(),
      });

      const account = privateKeyToAccount(generatePrivateKey());

      // 1. App client opens a sign in channel
      const {
        response: createChannelResponse,
        data: { channelToken, url },
      } = await appClient.createChannel({
        siweUri: "https://example.com",
        domain: "example.com",
        nonce: "abcd1234",
      });
      expect(createChannelResponse.status).toBe(201);

      // 1. App client checks channel status
      const {
        response: pendingStatusResponse,
        data: { state: pendingState },
      } = await appClient.status({ channelToken });
      expect(pendingStatusResponse.status).toBe(202);
      expect(pendingState).toBe("pending");

      // 3. Auth client generates a sign in message

      // 3a. Parse connect URI to get channel token and SIWE message params
      const { channelToken: token, params } = walletClient.parseSignInURI({
        uri: url,
      });
      expect(token).toBe(channelToken);

      expect(params.uri).toBe("https://example.com");
      expect(params.domain).toBe("example.com");
      expect(params.nonce).toBe("abcd1234");

      // 3b. Build sign in message
      const { message: messageString } = walletClient.buildSignInMessage({
        ...params,
        address: account.address,
        fid: 1,
      });

      // 3c. Collect user signature
      const sig = await account.signMessage({
        message: messageString,
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
      const { response: authResponse } = await walletClient.authenticate({
        channelToken,
        authKey: "farcaster-connect-auth-key",
        message: messageString,
        signature: sig,
        ...userData,
      });
      expect(authResponse.status).toBe(201);

      // 4. App client polls channel status
      const {
        response: completedStatusResponse,
        data: { state: completedState, message, signature, nonce, verifications, custody },
      } = await appClient.status({ channelToken });
      expect(completedStatusResponse.status).toBe(200);
      expect(completedState).toBe("completed");
      expect(message).toBe(messageString);
      expect(signature).toBe(sig);
      expect(nonce).toBe(nonce);
      expect(custody).toBe("0x8773442740C17C9d0F0B87022c722F9a136206eD");
      expect(verifications).toStrictEqual(["0x86924c37a93734e8611eb081238928a9d18a63c0"]);

      // 5. Channel is now closed
      const { response: channelClosedResponse } = await appClient.status({
        channelToken,
      });
      expect(channelClosedResponse.status).toBe(401);
    });
  });
});
