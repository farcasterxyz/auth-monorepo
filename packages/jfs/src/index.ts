import { type Hex, isAddress, verifyMessage, isHex, hexToBytes } from "viem";
import { ed25519 } from "@noble/curves/ed25519";

const jsonFarcasterSignatureTypes = ["app_key", "auth", "custody"] as const;

type JsonFarcasterSignatureType = typeof jsonFarcasterSignatureTypes[number];

export type JsonFarcasterSignatureHeader = {
  fid: number;
  type: JsonFarcasterSignatureType;
  key: Hex;
};

export type JsonFarcasterSignature = {
  header: string;
  payload: string;
  signature: string;
};

export type DecodedJsonFarcasterSignature<TPayload = unknown> = {
  header: JsonFarcasterSignatureHeader;
  payload: TPayload;
  signature: Uint8Array;
};

export function toJsonFarcasterSignature(data: JsonFarcasterSignature | string): JsonFarcasterSignature {
  if (typeof data === "string") {
    return uncompact(data);
  }

  return data;
}

export function compact(data: JsonFarcasterSignature): string {
  return `${data.header}.${data.payload}.${data.signature}`;
}

export function uncompact(value: string): JsonFarcasterSignature {
  const [header, payload, signature] = value.split(".");

  if (!header || !payload || !signature) {
    throw new Error("Malformed string");
  }

  return { header, payload, signature };
}

export function encodeHeader(header: JsonFarcasterSignatureHeader): string {
  return Buffer.from(JSON.stringify(header), "utf-8").toString("base64url");
}

export function encodePayload<TPayload>(payload: TPayload): string {
  return Buffer.from(JSON.stringify(payload), "utf-8").toString("base64url");
}

export function encodeSignature(signature: Uint8Array): string {
  return Buffer.from(signature).toString("base64url");
}

export function decodeHeader(header: string): JsonFarcasterSignatureHeader {
  return JSON.parse(Buffer.from(header, "base64url").toString("utf-8"));
}

export function decodePayload<TPayload>(payload: string): TPayload {
  return JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));
}

export function decodeSignature(signature: string): Uint8Array {
  return new Uint8Array(Buffer.from(signature, "base64url"));
}

export function decode<TPayload>(input: JsonFarcasterSignature | string): DecodedJsonFarcasterSignature<TPayload> {
  const data = (() => {
    if (typeof input === "string") {
      return uncompact(input);
    }

    return input;
  })();

  const header = JSON.parse(Buffer.from(data.header, "base64url").toString("utf-8"));
  const payload = data.payload ? JSON.parse(Buffer.from(data.payload, "base64url").toString("utf-8")) : undefined;
  const signature = new Uint8Array(Buffer.from(data.signature, "base64url"));

  return {
    header,
    payload,
    signature,
  };
}

/**
 * Verifies a Json Farcaster Signature. This does not check if the
 * corresponding key is active and associated with a Farcaster account.
 * Applications MUST perform these checks themselves.
 */
export async function verify({
  data,
  keyTypes,
  strict = false,
}: {
  data: JsonFarcasterSignature | string;

  /**
   * Key types to accept
   */
  keyTypes?: JsonFarcasterSignatureType[];

  /**
   * In an early implementation of JFS custody signatures were incorrectly
   * serialized. If strict is not enabled these signatures will be accpeted.
   *
   * @default false
   */
  strict?: boolean;
}): Promise<void> {
  const jfs = toJsonFarcasterSignature(data);
  const decoded = decode(jfs);

  if (keyTypes && !keyTypes.includes(decoded.header.type)) {
    throw new Error(`Key type ${decoded.header.type} not allowed`);
  }

  const signingInput = `${jfs.header}.${jfs.payload}`;

  if (decoded.header.type === "auth" || decoded.header.type === "custody") {
    if (!isAddress(decoded.header.key)) {
      throw new Error("Key is not an address");
    }

    try {
      await verifyMessage({
        address: decoded.header.key,
        signature: decoded.signature,
        message: signingInput,
      });
      return;
    } catch (error) {
      if (!strict) {
        const utf8EncodedHexSignature = Buffer.from(decoded.signature).toString("utf-8");

        if (isHex(utf8EncodedHexSignature)) {
          await verifyMessage({
            address: decoded.header.key,
            signature: utf8EncodedHexSignature,
            message: signingInput,
          });

          return;
        }
      }

      throw error;
    }
  }

  if (decoded.header.type === "app_key") {
    const verifyResult = ed25519.verify(
      decoded.signature,
      new Uint8Array(Buffer.from(signingInput, "utf-8")),
      hexToBytes(decoded.header.key),
    );
    if (!verifyResult) {
      throw new Error("Invalid signature");
    }
    return;
  }

  throw new Error(`Unknown key type ${decoded.header.type}`);
}
