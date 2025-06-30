import { describe, it, expect } from "vitest";
import { toBase64Url, fromBase64Url } from "../src/utils.js";

describe("toBase64Url", () => {
  it("default: converts base64 to base64url", () => {
    // Test string that produces all special characters in base64
    const testString = "Sure. Base64 encoding test!?>";
    const base64 = Buffer.from(testString).toString("base64");
    const expected = Buffer.from(testString).toString("base64url");

    const result = toBase64Url(base64);
    expect(result).toEqual(expected);
  });

  it("default: handles strings with + and /", () => {
    const base64 = "SGVsbG8+Pz8/";
    const expected = "SGVsbG8-Pz8_";

    const result = toBase64Url(base64);
    expect(result).toEqual(expected);
  });

  it("default: removes padding", () => {
    const base64 = "SGVsbG8=";
    const expected = "SGVsbG8";

    const result = toBase64Url(base64);
    expect(result).toEqual(expected);
  });

  it("default: removes multiple padding characters", () => {
    const base64 = "SGVsbA==";
    const expected = "SGVsbA";

    const result = toBase64Url(base64);
    expect(result).toEqual(expected);
  });

  it("default: handles empty string", () => {
    const result = toBase64Url("");
    expect(result).toEqual("");
  });
});

describe("fromBase64Url", () => {
  it("default: converts base64url to base64", () => {
    // Test string that produces all special characters in base64
    const testString = "Sure. Base64 encoding test!?>";
    const base64url = Buffer.from(testString).toString("base64url");
    const expected = Buffer.from(testString).toString("base64");

    const result = fromBase64Url(base64url);
    expect(result).toEqual(expected);
  });

  it("default: handles strings with - and _", () => {
    const base64url = "SGVsbG8-Pz8_";
    const expected = "SGVsbG8+Pz8/";

    const result = fromBase64Url(base64url);
    expect(result).toEqual(expected);
  });

  it("default: adds single padding", () => {
    const base64url = "SGVsbG8";
    const expected = "SGVsbG8=";

    const result = fromBase64Url(base64url);
    expect(result).toEqual(expected);
  });

  it("default: adds double padding", () => {
    const base64url = "SGVsbA";
    const expected = "SGVsbA==";

    const result = fromBase64Url(base64url);
    expect(result).toEqual(expected);
  });

  it("default: no padding needed when length is multiple of 4", () => {
    const base64url = "SGVsbG8gV29ybGQ";
    const expected = "SGVsbG8gV29ybGQ=";

    const result = fromBase64Url(base64url);
    expect(result).toEqual(expected);
  });

  it("default: handles empty string", () => {
    const result = fromBase64Url("");
    expect(result).toEqual("");
  });
});

describe("toBase64Url and fromBase64Url roundtrip", () => {
  it("default: roundtrip with various test strings", () => {
    const testStrings = [
      "Hello, World!",
      "The quick brown fox jumps over the lazy dog",
      "1234567890",
      "!@#$%^&*()_+-=[]{}|;':\",./<>?",
      "🚀 Unicode test 你好世界",
      "",
      "a",
      "ab",
      "abc",
      "abcd",
    ];

    testStrings.forEach((testString) => {
      const base64 = Buffer.from(testString).toString("base64");
      const base64url = toBase64Url(base64);
      const backToBase64 = fromBase64Url(base64url);

      expect(backToBase64).toEqual(base64);

      // Also verify it matches Node.js implementation
      const nodeBase64url = Buffer.from(testString).toString("base64url");
      expect(base64url).toEqual(nodeBase64url);
    });
  });

  it("default: roundtrip with binary data", () => {
    const binaryData = new Uint8Array([0, 1, 2, 3, 255, 254, 253, 252]);
    const base64 = Buffer.from(binaryData).toString("base64");
    const base64url = toBase64Url(base64);
    const backToBase64 = fromBase64Url(base64url);

    expect(backToBase64).toEqual(base64);

    // Verify it matches Node.js implementation
    const nodeBase64url = Buffer.from(binaryData).toString("base64url");
    expect(base64url).toEqual(nodeBase64url);
  });
});
