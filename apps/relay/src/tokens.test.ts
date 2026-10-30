import { generateChannelToken } from "./tokens";

const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

describe("generateChannelToken", () => {
  test("generates an 8 character token by default", () => {
    expect(generateChannelToken()).toMatch(/^[2-9A-HJ-NP-Z]{8}$/);
  });

  test("generates a token of the requested length", () => {
    expect(generateChannelToken(32)).toMatch(/^[2-9A-HJ-NP-Z]{32}$/);
  });

  test("draws characters uniformly from the alphabet", () => {
    const samples = 64_000;
    const counts = new Map<string, number>();
    for (const char of generateChannelToken(samples)) {
      counts.set(char, (counts.get(char) ?? 0) + 1);
    }

    expect([...counts.keys()].sort()).toEqual([...ALPHABET].sort());

    // Chi-square with 31 degrees of freedom; p = 0.0001 critical value is ~66.6
    const expected = samples / ALPHABET.length;
    let chiSquare = 0;
    for (const count of counts.values()) {
      chiSquare += (count - expected) ** 2 / expected;
    }
    expect(chiSquare).toBeLessThan(66.6);
  });
});
