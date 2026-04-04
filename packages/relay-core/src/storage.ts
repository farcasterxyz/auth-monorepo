import type { RelayAsyncResult } from "./errors";

export interface ChannelStorage<T> {
  open(state?: T): RelayAsyncResult<string>;
  update(token: string, state: T): RelayAsyncResult<T>;
  read(token: string): RelayAsyncResult<T>;
  close(token: string): RelayAsyncResult<number>;
  clear?(): Promise<void>;
  stop?(): Promise<void>;
}

export interface ChannelStorageConfig {
  ttl: number;
}
