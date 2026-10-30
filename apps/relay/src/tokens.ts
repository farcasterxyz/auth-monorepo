import crypto from "node:crypto";

const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

export function generateChannelToken(length = 8): string {
  let id = "";
  for (let i = 0; i < length; i++) {
    id += ALPHABET[crypto.randomInt(ALPHABET.length)];
  }
  if (id.length < length) {
    throw new Error("Error generating channel token");
  }
  return id;
}
