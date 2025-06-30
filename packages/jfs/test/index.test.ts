import { describe, it, expect } from "vitest";
import { ed25519 } from "@noble/curves/ed25519";
import { generatePrivateKey, privateKeyToAccount, signMessage } from "viem/accounts";
import {
  toJsonFarcasterSignature,
  compact,
  uncompact,
  encodeHeader,
  encodePayload,
  encodeSignature,
  decodeHeader,
  decodePayload,
  decodeSignature,
  decode,
  verify,
  type JsonFarcasterSignature,
  type JsonFarcasterSignatureHeader,
} from "../src/index.js";
import { bytesToHex } from "viem";

const mockHeader: JsonFarcasterSignatureHeader = {
  fid: 123,
  type: "app_key",
  key: "0x0000",
};

const mockPayload = { message: "test message", timestamp: 1234567890 };
const mockSignature = new Uint8Array([1, 2, 3, 4, 5]);

const encodedHeader = encodeHeader(mockHeader);
const encodedPayload = encodePayload(mockPayload);
const encodedSignature = encodeSignature(mockSignature);

const mockJfs: JsonFarcasterSignature = {
  header: encodedHeader,
  payload: encodedPayload,
  signature: encodedSignature,
};

const compactedJfs = compact(mockJfs);

describe("toJsonFarcasterSignature", () => {
  it("default: with string", () => {
    const result = toJsonFarcasterSignature(compactedJfs);
    expect(result).toEqual(mockJfs);
  });

  it("default: with object", () => {
    const result = toJsonFarcasterSignature(mockJfs);
    expect(result).toEqual(mockJfs);
  });
});

describe("compact", () => {
  it("default", () => {
    const result = compact(mockJfs);
    expect(result).toBe(`${encodedHeader}.${encodedPayload}.${encodedSignature}`);
  });
});

describe("uncompact", () => {
  it("default", () => {
    const result = uncompact(compactedJfs);
    expect(result).toEqual(mockJfs);
  });

  it("error", () => {
    expect(() => uncompact("header.payload")).toThrow("Malformed string");
    expect(() => uncompact("header")).toThrow("Malformed string");
    expect(() => uncompact("")).toThrow("Malformed string");
    expect(() => uncompact("..")).toThrow("Malformed string");
    expect(() => uncompact("header..signature")).toThrow("Malformed string");
    expect(() => uncompact(".payload.signature")).toThrow("Malformed string");
    expect(() => uncompact("header.payload.")).toThrow("Malformed string");
  });
});

describe("encodeHeader", () => {
  it("default", () => {
    const result = encodeHeader(mockHeader);
    const decoded = JSON.parse(Buffer.from(result, "base64url").toString("utf-8"));
    expect(decoded).toEqual(mockHeader);
  });
});

describe("encodePayload", () => {
  it("default", () => {
    const result = encodePayload(mockPayload);
    const decoded = JSON.parse(Buffer.from(result, "base64url").toString("utf-8"));
    expect(decoded).toEqual(mockPayload);
  });
});

describe("encodeSignature", () => {
  it("default", () => {
    const result = encodeSignature(mockSignature);
    const decoded = new Uint8Array(Buffer.from(result, "base64url"));
    expect(decoded).toEqual(mockSignature);
  });
});

describe("decodeHeader", () => {
  it("default", () => {
    const result = decodeHeader(encodedHeader);
    expect(result).toEqual(mockHeader);
  });
});

describe("decodePayload", () => {
  it("default", () => {
    const result = decodePayload(encodedPayload);
    expect(result).toEqual(mockPayload);
  });
});

describe("decodeSignature", () => {
  it("default", () => {
    const result = decodeSignature(encodedSignature);
    expect(result).toEqual(mockSignature);
  });
});

describe("decode", () => {
  it("default: with object", () => {
    const result = decode<typeof mockPayload>(mockJfs);
    expect(result.header).toEqual(mockHeader);
    expect(result.payload).toEqual(mockPayload);
    expect(result.signature).toEqual(mockSignature);
  });

  it("default: with string", () => {
    const result = decode<typeof mockPayload>(compactedJfs);
    expect(result.header).toEqual(mockHeader);
    expect(result.payload).toEqual(mockPayload);
    expect(result.signature).toEqual(mockSignature);
  });
});

describe("verify", () => {
  const testPayload = { message: "test" };
  const encodedTestPayload = encodePayload(testPayload);

  describe("app_key", () => {
    const privateKey = ed25519.utils.randomPrivateKey();
    const publicKey = ed25519.getPublicKey(privateKey);
    const publicKeyHex = bytesToHex(publicKey);

    const appKeyHeader: JsonFarcasterSignatureHeader = {
      fid: 123,
      type: "app_key",
      key: publicKeyHex,
    };

    const encodedAppKeyHeader = encodeHeader(appKeyHeader);
    const signingInput = `${encodedAppKeyHeader}.${encodedTestPayload}`;
    const validSignature = ed25519.sign(new Uint8Array(Buffer.from(signingInput, "utf-8")), privateKey);

    const validAppKeyJfs: JsonFarcasterSignature = {
      header: encodedAppKeyHeader,
      payload: encodedTestPayload,
      signature: encodeSignature(validSignature),
    };

    it("default", async () => {
      await expect(verify({ data: validAppKeyJfs })).resolves.not.toThrow();
    });

    it("default: with string", async () => {
      const compacted = compact(validAppKeyJfs);
      await expect(verify({ data: compacted })).resolves.not.toThrow();
    });

    it("behavior: key types", async () => {
      await expect(verify({ data: validAppKeyJfs, keyTypes: ["app_key"] })).resolves.not.toThrow();
    });

    it("error: invalid signature", async () => {
      const invalidJfs: JsonFarcasterSignature = {
        ...validAppKeyJfs,
        signature: encodeSignature(new Uint8Array(64)), // invalid signature
      };
      await expect(verify({ data: invalidJfs })).rejects.toThrow("Invalid signature");
    });

    it("error: disallowed key type", async () => {
      await expect(verify({ data: validAppKeyJfs, keyTypes: ["auth", "custody"] })).rejects.toThrow(
        "Key type app_key not allowed",
      );
    });

    it("error: unknown key type", async () => {
      const unknownTypeHeader = {
        ...appKeyHeader,
        type: "unknown" as "custody",
      };
      const unknownTypeJfs: JsonFarcasterSignature = {
        header: encodeHeader(unknownTypeHeader),
        payload: encodedTestPayload,
        signature: encodeSignature(validSignature),
      };
      await expect(verify({ data: unknownTypeJfs })).rejects.toThrow("Unknown key type unknown");
    });
  });

  describe("auth", () => {
    const privateKey = generatePrivateKey();
    const account = privateKeyToAccount(privateKey);
    const ethAddress = account.address;

    const authHeader: JsonFarcasterSignatureHeader = {
      fid: 123,
      type: "auth",
      key: ethAddress,
    };

    const encodedAuthHeader = encodeHeader(authHeader);
    const signingInput = `${encodedAuthHeader}.${encodedTestPayload}`;

    it("default: with object", async () => {
      const signature = await signMessage({ privateKey, message: signingInput });
      const validAuthJfs: JsonFarcasterSignature = {
        header: encodedAuthHeader,
        payload: encodedTestPayload,
        signature: encodeSignature(new Uint8Array(Buffer.from(signature.slice(2), "hex"))),
      };
      await expect(verify({ data: validAuthJfs })).resolves.not.toThrow();
    });

    it("default: with string", async () => {
      const signature = await signMessage({ privateKey, message: signingInput });
      const validAuthJfs: JsonFarcasterSignature = {
        header: encodedAuthHeader,
        payload: encodedTestPayload,
        signature: encodeSignature(new Uint8Array(Buffer.from(signature.slice(2), "hex"))),
      };
      const compacted = compact(validAuthJfs);
      await expect(verify({ data: compacted })).resolves.not.toThrow();
    });

    it("behavior: key types", async () => {
      const signature = await signMessage({ privateKey, message: signingInput });
      const validAuthJfs: JsonFarcasterSignature = {
        header: encodedAuthHeader,
        payload: encodedTestPayload,
        signature: encodeSignature(new Uint8Array(Buffer.from(signature.slice(2), "hex"))),
      };
      await expect(verify({ data: validAuthJfs, keyTypes: ["auth"] })).resolves.not.toThrow();
    });

    it("error: invalid signature", async () => {
      const invalidJfs: JsonFarcasterSignature = {
        header: encodedAuthHeader,
        payload: encodedTestPayload,
        signature: encodeSignature(new Uint8Array(65)), // invalid signature
      };
      await expect(verify({ data: invalidJfs })).rejects.toThrow();
    });

    it("error: disallowed key type", async () => {
      const signature = await signMessage({ privateKey, message: signingInput });
      const validAuthJfs: JsonFarcasterSignature = {
        header: encodedAuthHeader,
        payload: encodedTestPayload,
        signature: encodeSignature(new Uint8Array(Buffer.from(signature.slice(2), "hex"))),
      };
      await expect(verify({ data: validAuthJfs, keyTypes: ["app_key", "custody"] })).rejects.toThrow(
        "Key type auth not allowed",
      );
    });

    it("error: invalid address", async () => {
      const invalidAuthHeader = {
        ...authHeader,
        key: "0x0000" as const,
      };
      const invalidAuthJfs: JsonFarcasterSignature = {
        header: encodeHeader(invalidAuthHeader),
        payload: encodedTestPayload,
        signature: encodeSignature(new Uint8Array(65)),
      };
      await expect(verify({ data: invalidAuthJfs })).rejects.toThrow("Key is not an address");
    });
  });

  describe("custody", () => {
    const privateKey = generatePrivateKey();
    const account = privateKeyToAccount(privateKey);
    const ethAddress = account.address;

    const custodyHeader: JsonFarcasterSignatureHeader = {
      fid: 123,
      type: "custody",
      key: ethAddress,
    };

    const encodedCustodyHeader = encodeHeader(custodyHeader);
    const signingInput = `${encodedCustodyHeader}.${encodedTestPayload}`;

    it("default: with object", async () => {
      const signature = await signMessage({ privateKey, message: signingInput });
      const validCustodyJfs: JsonFarcasterSignature = {
        header: encodedCustodyHeader,
        payload: encodedTestPayload,
        signature: encodeSignature(new Uint8Array(Buffer.from(signature.slice(2), "hex"))),
      };
      await expect(verify({ data: validCustodyJfs })).resolves.not.toThrow();
    });

    it("default: with string", async () => {
      const signature = await signMessage({ privateKey, message: signingInput });
      const validCustodyJfs: JsonFarcasterSignature = {
        header: encodedCustodyHeader,
        payload: encodedTestPayload,
        signature: encodeSignature(new Uint8Array(Buffer.from(signature.slice(2), "hex"))),
      };
      const compacted = compact(validCustodyJfs);
      await expect(verify({ data: compacted })).resolves.not.toThrow();
    });

    it("behavior: key types", async () => {
      const signature = await signMessage({ privateKey, message: signingInput });
      const validCustodyJfs: JsonFarcasterSignature = {
        header: encodedCustodyHeader,
        payload: encodedTestPayload,
        signature: encodeSignature(new Uint8Array(Buffer.from(signature.slice(2), "hex"))),
      };
      await expect(verify({ data: validCustodyJfs, keyTypes: ["custody"] })).resolves.not.toThrow();
    });

    it("behavior: legacy encoding with strict false", async () => {
      const signature = await signMessage({ privateKey, message: signingInput });
      const validCustodyJfs: JsonFarcasterSignature = {
        header: encodedCustodyHeader,
        payload: encodedTestPayload,
        signature: encodeSignature(new Uint8Array(Buffer.from(signature, "utf-8"))),
      };
      await expect(verify({ data: validCustodyJfs, keyTypes: ["custody"] })).resolves.not.toThrow();
    });

    it("error: legacy encoding with strict true", async () => {
      const signature = await signMessage({ privateKey, message: signingInput });
      const validCustodyJfs: JsonFarcasterSignature = {
        header: encodedCustodyHeader,
        payload: encodedTestPayload,
        signature: encodeSignature(new Uint8Array(Buffer.from(signature, "utf-8"))),
      };
      await expect(verify({ data: validCustodyJfs, keyTypes: ["custody"], strict: true })).rejects.toThrow();
    });

    it("error: invalid signature", async () => {
      const invalidJfs: JsonFarcasterSignature = {
        header: encodedCustodyHeader,
        payload: encodedTestPayload,
        signature: encodeSignature(new Uint8Array(65)), // invalid signature
      };
      await expect(verify({ data: invalidJfs })).rejects.toThrow();
    });

    it("error: disallowed key type", async () => {
      const signature = await signMessage({ privateKey, message: signingInput });
      const validCustodyJfs: JsonFarcasterSignature = {
        header: encodedCustodyHeader,
        payload: encodedTestPayload,
        signature: encodeSignature(new Uint8Array(Buffer.from(signature.slice(2), "hex"))),
      };
      await expect(verify({ data: validCustodyJfs, keyTypes: ["app_key", "auth"] })).rejects.toThrow(
        "Key type custody not allowed",
      );
    });

    it("error: invalid address", async () => {
      const invalidCustodyHeader = {
        ...custodyHeader,
        key: "0x0000" as const,
      };
      const invalidCustodyJfs: JsonFarcasterSignature = {
        header: encodeHeader(invalidCustodyHeader),
        payload: encodedTestPayload,
        signature: encodeSignature(new Uint8Array(65)),
      };
      await expect(verify({ data: invalidCustodyJfs })).rejects.toThrow("Key is not an address");
    });
  });
});
