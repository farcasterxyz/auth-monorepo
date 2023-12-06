import { ChannelStore } from "./channels";
import { jest } from "@jest/globals";

interface TestSession {
  foo: string;
  baz?: string;
}

let channels: ChannelStore<TestSession>;

beforeAll(async () => {
  channels = new ChannelStore<TestSession>({
    redisUrl: "redis://localhost:6379",
  });
});

afterAll(async () => {
  await channels.stop();
});

afterEach(async () => {
  await channels.clear();
  jest.restoreAllMocks();
});

describe("channel store", () => {
  describe("open", () => {
    test("opens a channel and returns the token", async () => {
      const channel = await channels.open();
      expect(channel._unsafeUnwrap()).toMatch(/[a-f0-9]{8}-([a-f0-9]{4}-){3}[a-f0-9]{12}/);
    });
  });

  describe("update", () => {
    test("updates an existing channel", async () => {
      const channel = await channels.open();
      const channelToken = channel._unsafeUnwrap();
      const update = await channels.update(channelToken, { foo: "bar" });
      const returnedState = update._unsafeUnwrap();
      expect(returnedState).toStrictEqual({ foo: "bar" });

      const read = await channels.read(channelToken);
      const storedState = read._unsafeUnwrap();
      expect(storedState).toStrictEqual(returnedState);
    });

    test("multiple updates", async () => {
      const channel = await channels.open();
      const channelToken = channel._unsafeUnwrap();
      await channels.update(channelToken, { foo: "bar" });
      const update = await channels.update(channelToken, {
        foo: "bar",
        baz: "qux",
      });
      const returnedState = update._unsafeUnwrap();
      expect(returnedState).toStrictEqual({ foo: "bar", baz: "qux" });

      const read = await channels.read(channelToken);
      const storedState = read._unsafeUnwrap();
      expect(storedState).toStrictEqual(returnedState);
    });
  });

  describe("read", () => {
    test("reads value of an existing channel", async () => {
      const channel = await channels.open();
      const channelToken = channel._unsafeUnwrap();
      await channels.update(channelToken, { foo: "bar" });

      const read = await channels.read(channelToken);
      const storedState = read._unsafeUnwrap();
      expect(storedState).toStrictEqual({ foo: "bar" });
    });

    test("returns not_found error for missing key", async () => {
      const read = await channels.read("some-invalid-key");
      expect(read.isErr()).toBe(true);
      expect(read._unsafeUnwrapErr().errCode).toBe("not_found");
    });
  });

  describe("close", () => {
    test("closes a channel", async () => {
      const channel = await channels.open();
      const channelToken = channel._unsafeUnwrap();

      const close = await channels.close(channelToken);
      expect(close.isOk()).toBe(true);

      const read = await channels.read(channelToken);
      expect(read.isErr()).toBe(true);
      expect(read._unsafeUnwrapErr().errCode).toBe("not_found");
    });
  });
});
