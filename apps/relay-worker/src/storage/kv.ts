import { ResultAsync, err, ok } from "neverthrow";
import type { ChannelStorage, ChannelStorageConfig, RelayAsyncResult } from "@farcaster/relay-core";
import { RelayError, generateChannelToken } from "@farcaster/relay-core";

export interface KVChannelStorageConfig extends ChannelStorageConfig {
  kv: KVNamespace;
}

export class KVChannelStorage<T> implements ChannelStorage<T> {
  private kv: KVNamespace;
  private ttl: number;

  constructor({ kv, ttl }: KVChannelStorageConfig) {
    this.kv = kv;
    this.ttl = ttl;
  }

  async open(state?: T): RelayAsyncResult<string> {
    const channelToken = generateChannelToken();
    return ResultAsync.fromPromise(
      this.kv.put(channelToken, JSON.stringify(state ?? {}), {
        expirationTtl: this.ttl,
      }),
      (error) => new RelayError("unavailable", error as Error),
    ).andThen(() => ok(channelToken));
  }

  async update(channelToken: string, state: T): RelayAsyncResult<T> {
    return ResultAsync.fromPromise(
      this.kv.put(channelToken, JSON.stringify(state), {
        expirationTtl: this.ttl,
      }),
      (error) => new RelayError("unavailable", error as Error),
    ).andThen(() => ok(state));
  }

  async read(channelToken: string): RelayAsyncResult<T> {
    return ResultAsync.fromPromise(
      this.kv.get(channelToken),
      (error) => new RelayError("unavailable", error as Error),
    ).andThen((channel) => {
      if (channel) {
        return ok(JSON.parse(channel) as T);
      }
      return err(new RelayError("not_found", "Channel not found"));
    });
  }

  async close(channelToken: string): RelayAsyncResult<number> {
    return ResultAsync.fromPromise(
      this.kv.delete(channelToken).then(() => 1),
      (error) => new RelayError("unknown", error as Error),
    );
  }
}
