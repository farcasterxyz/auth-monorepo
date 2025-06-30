import crypto from "node:crypto";

const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

export function generateChannelToken(length = 8): string {
  const bytes = crypto.randomBytes(length);
  let id = "";
  for (let i = 0; i < length; i++) {
    const byte = bytes[i];
    if (byte === undefined) {
      throw new Error("Error generating channel token");
    }
    id += ALPHABET[byte % ALPHABET.length];
  }
  if (id.length < length) {
    throw new Error("Error generating channel token");
  }
  return id;
}
