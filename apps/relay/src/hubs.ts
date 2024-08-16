import { getSSLHubRpcClient, HubRpcClient } from "@farcaster/hub-nodejs";
import { RelayAsyncResult, RelayError } from "./errors";
import { err, ok } from "neverthrow";

export type HubClient = {
  host: string;
  client: HubRpcClient;
};

const MAX_RECEIVE_MESSAGE_LENGTH = 10 * 1024 * 1024; // 10mb

const clientOptions = {
  "grpc.max_receive_message_length": MAX_RECEIVE_MESSAGE_LENGTH,
};

export class HubService {
  public static async getReadyClient(host: string): RelayAsyncResult<HubClient> {
    const client = getSSLHubRpcClient(host, clientOptions);
    const res = await this.waitForReadyHubClient(client);
    if (res.isErr()) return err(res.error);

    return ok({
      host,
      client,
    });
  }

  public static waitForReadyHubClient(hubClient: HubRpcClient): RelayAsyncResult<void> {
    return new Promise((resolve) => {
      hubClient?.$.waitForReady(Date.now() + 500, (e) => {
        return e ? resolve(err(new RelayError("unknown", e))) : resolve(ok(undefined));
      });
    });
  }
}
