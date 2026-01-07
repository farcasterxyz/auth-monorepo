import { Redis } from "ioredis";
import { ResultAsync, err, ok } from "neverthrow";
import type { ChannelStorage, ChannelStorageConfig, RelayAsyncResult } from "@farcaster/relay-core";
import { RelayError, generateChannelToken } from "@farcaster/relay-core";

export interface RedisChannelStorageConfig extends ChannelStorageConfig {
  redisUrl: string;
}

export class RedisChannelStorage<T> implements ChannelStorage<T> {
  private redis: Redis;
  private ttl: number;

  constructor({ redisUrl, ttl }: RedisChannelStorageConfig) {
    this.redis = new Redis(redisUrl);
    this.ttl = ttl;
  }

  async open(state?: T): RelayAsyncResult<string> {
    const channelToken = generateChannelToken();
    return ResultAsync.fromPromise(
      this.redis.set(channelToken, JSON.stringify(state ?? {}), "EX", this.ttl),
      (error) => new RelayError("unavailable", error as Error),
    ).andThen(() => ok(channelToken));
  }

  async update(channelToken: string, state: T): RelayAsyncResult<T> {
    return ResultAsync.fromPromise(
      this.redis.set(channelToken, JSON.stringify(state), "KEEPTTL"),
      (error) => new RelayError("unavailable", error as Error),
    ).andThen(() => ok(state));
  }

  async read(channelToken: string): RelayAsyncResult<T> {
    return ResultAsync.fromPromise(
      this.redis.get(channelToken),
      (error) => new RelayError("unavailable", error as Error),
    ).andThen((channel) => {
      if (channel) {
        return ok(JSON.parse(channel) as T);
      }
      return err(new RelayError("not_found", "Channel not found"));
    });
  }

  async close(channelToken: string): RelayAsyncResult<number> {
    return ResultAsync.fromPromise(this.redis.del(channelToken), (error) => new RelayError("unknown", error as Error));
  }

  async clear(): Promise<void> {
    await this.redis.flushall();
  }

  async stop(): Promise<void> {
    await this.redis.quit();
  }
}
