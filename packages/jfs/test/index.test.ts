import { describe, it, expect } from "vitest";
import { ed25519 } from "@noble/curves/ed25519.js";
import { generatePrivateKey, privateKeyToAccount, signMessage } from "viem/accounts";
import { createPublicClient, http } from "viem";
import { optimism } from "viem/chains";
import { toCoinbaseSmartAccount } from "viem/account-abstraction";
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
    const privateKey = ed25519.utils.randomSecretKey();
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

    it("error: malformed signature", async () => {
      const invalidJfs: JsonFarcasterSignature = {
        header: encodedAuthHeader,
        payload: encodedTestPayload,
        signature: encodeSignature(new Uint8Array(65)), // invalid signature
      };
      await expect(verify({ data: invalidJfs })).rejects.toThrow();
    });

    it("error: invalid signature", async () => {
      const invalidJfs = {
        header:
          "eyJmaWQiOjkxNTIsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHgwMmVmNzkwRGQ3OTkzQTM1ZkQ4NDdDMDUzRURkQUU5NDBEMDU1NTk2In0",
        payload: "eyJkb21haW4iOiJmYWtlLmNvbiJ9",
        signature:
          "MHgxMGQwZGU4ZGYwZDUwZTdmMGIxN2YxMTU2NDI1MjRmZTY0MTUyZGU4ZGU1MWU0MThiYjU4ZjVmZmQxYjRjNDBiNGVlZTRhNDcwNmVmNjhlMzQ0ZGQ5MDBkYmQyMmNlMmVlZGY5ZGQ0N2JlNWRmNzMwYzUxNjE4OWVjZDJjY2Y0MDFj",
      };
      await expect(verify({ data: invalidJfs, keyTypes: ["custody"] })).rejects.toThrow();
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

  describe("backward compatibility", () => {
    it("behavior: EOA signatures work without publicClient", async () => {
      const privateKey = generatePrivateKey();
      const account = privateKeyToAccount(privateKey);
      const ethAddress = account.address;

      const authHeader: JsonFarcasterSignatureHeader = {
        fid: 123,
        type: "auth",
        key: ethAddress,
      };

      const testPayload = { message: "test" };
      const encodedTestPayload = encodePayload(testPayload);
      const encodedAuthHeader = encodeHeader(authHeader);
      const signingInput = `${encodedAuthHeader}.${encodedTestPayload}`;
      const signature = await signMessage({ privateKey, message: signingInput });

      const validAuthJfs: JsonFarcasterSignature = {
        header: encodedAuthHeader,
        payload: encodedTestPayload,
        signature: encodeSignature(new Uint8Array(Buffer.from(signature.slice(2), "hex"))),
      };

      await expect(verify({ data: validAuthJfs })).resolves.not.toThrow();
    });
  });

  describe("smart contract signatures", () => {
    const publicClient = createPublicClient({
      chain: optimism,
      transport: http(),
    });

    describe("1271 signatures", () => {
      const smartContractAddress = "0xE8C088f750544b434573825769A5FC79D96cc83a" as const;
      const testPayload = { domain: "erc-1271-test.example.com" };
      const encodedTestPayload = encodePayload(testPayload);

      const authHeader: JsonFarcasterSignatureHeader = {
        fid: 9999,
        type: "custody",
        key: smartContractAddress,
      };

      const encodedAuthHeader = encodeHeader(authHeader);

      const hexSig =
        "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000120000000000000000000000000000000000000000000000000000000000000001700000000000000000000000000000000000000000000000000000000000000015752b05ca512759efd40b6287568ad611cf52b2bf1c091cbd1104571b8a1410b4a254a0c9aeb56932d6be8775a22867f37851e7234a0d8eaefbdee3e06198f760000000000000000000000000000000000000000000000000000000000000025f198086b2db17256731bc456673b96bcef23f51d1fbacdd7c4379ef65465572f1d00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008a7b2274797065223a22776562617574686e2e676574222c226368616c6c656e6765223a2266654842336f473648524c7a5a61683247736168527145717a424175536d6e724c5a527174656c4a755145222c226f726967696e223a2268747470733a2f2f6b6579732e636f696e626173652e636f6d222c2263726f73734f726967696e223a66616c73657d00000000000000000000000000000000000000000000";
      const smartContractSignatureBytes = Buffer.from(hexSig.slice(2), "hex");

      it("default: with smart contract signature", async () => {
        const validSmartContractJfs: JsonFarcasterSignature = {
          header: encodedAuthHeader,
          payload: encodedTestPayload,
          signature: encodeSignature(new Uint8Array(smartContractSignatureBytes)),
        };
        await expect(verify({ data: validSmartContractJfs, publicClient })).resolves.not.toThrow();
      });

      it("error: invalid smart contract signature", async () => {
        const invalidSignature =
          "0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
        const invalidSmartContractJfs: JsonFarcasterSignature = {
          header: encodedAuthHeader,
          payload: encodedTestPayload,
          signature: encodeSignature(new Uint8Array(Buffer.from(invalidSignature.slice(2), "hex"))),
        };
        await expect(verify({ data: invalidSmartContractJfs, publicClient })).rejects.toThrow("Invalid signature");
      });

      it("error: wrong payload with smart contract signature", async () => {
        const wrongPayload = { domain: "wrong-domain.com" };
        const encodedWrongPayload = encodePayload(wrongPayload);
        const wrongPayloadHeader: JsonFarcasterSignatureHeader = {
          fid: 6162,
          type: "auth",
          key: smartContractAddress,
        };
        const encodedWrongHeader = encodeHeader(wrongPayloadHeader);

        const invalidJfs: JsonFarcasterSignature = {
          header: encodedWrongHeader,
          payload: encodedWrongPayload,
          signature: encodeSignature(new Uint8Array(smartContractSignatureBytes)),
        };
        await expect(verify({ data: invalidJfs, publicClient })).rejects.toThrow("Invalid signature");
      });
    });

    describe("ERC-6492", () => {
      it("default: verify signature from undeployed Coinbase Smart Account", async () => {
        const ownerPrivateKey = generatePrivateKey();
        const owner = privateKeyToAccount(ownerPrivateKey);

        const smartAccount = await toCoinbaseSmartAccount({
          client: publicClient,
          owners: [owner],
          version: "1",
        });

        const testPayload = { domain: "erc6492-test.example.com" };
        const encodedTestPayload = encodePayload(testPayload);

        const authHeader: JsonFarcasterSignatureHeader = {
          fid: 9999,
          type: "auth",
          key: smartAccount.address,
        };

        const encodedAuthHeader = encodeHeader(authHeader);
        const signingInput = `${encodedAuthHeader}.${encodedTestPayload}`;

        const signature = await smartAccount.signMessage({
          message: signingInput,
        });

        const signatureBytes = Buffer.from(signature.slice(2), "hex");
        const validJfs: JsonFarcasterSignature = {
          header: encodedAuthHeader,
          payload: encodedTestPayload,
          signature: encodeSignature(new Uint8Array(signatureBytes)),
        };

        await expect(verify({ data: validJfs, publicClient })).resolves.not.toThrow();

        const invalidSignature =
          "0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
        const invalidJfs: JsonFarcasterSignature = {
          header: encodedAuthHeader,
          payload: encodedTestPayload,
          signature: encodeSignature(new Uint8Array(Buffer.from(invalidSignature.slice(2), "hex"))),
        };

        await expect(verify({ data: invalidJfs, publicClient })).rejects.toThrow("Invalid signature");
      });
    });
  });
});
