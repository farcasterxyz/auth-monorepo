import { Redis } from "ioredis";
import { ResultAsync, err, ok } from "neverthrow";
import { randomUUID } from "crypto";
import { RelayAsyncResult, RelayError } from "./errors";

interface ChannelStoreOpts {
  redisUrl: string;
  ttl?: number;
}

export class ChannelStore<T> {
  private redis: Redis;
  private ttl: number;

  constructor({ redisUrl, ttl }: ChannelStoreOpts) {
    this.redis = new Redis(redisUrl);
    this.ttl = ttl ?? 3600;
  }

  async open(state?: T): RelayAsyncResult<string> {
    const channelToken = randomUUID();
    return ResultAsync.fromPromise(
      this.redis.set(channelToken, JSON.stringify(state ?? {}), "EX", this.ttl),
      (err) => new RelayError("unavailable", err as Error),
    ).andThen(() => ok(channelToken));
  }

  async update(channelToken: string, state: T): RelayAsyncResult<T> {
    return ResultAsync.fromPromise(
      this.redis.set(channelToken, JSON.stringify(state), "KEEPTTL"),
      (err) => new RelayError("unavailable", err as Error),
    ).andThen(() => ok(state));
  }

  async read(channelToken: string): RelayAsyncResult<T> {
    return ResultAsync.fromPromise(
      this.redis.get(channelToken),
      (err) => new RelayError("unavailable", err as Error),
    ).andThen((channel) => {
      if (channel) {
        return ok(JSON.parse(channel));
      } else {
        return err(new RelayError("not_found", "Channel not found"));
      }
    });
  }

  async close(channelToken: string) {
    return ResultAsync.fromPromise(this.redis.del(channelToken), (err) => new RelayError("unknown", err as Error));
  }

  async clear() {
    return this.redis.flushall();
  }

  async stop() {
    return this.redis.quit();
  }
}
