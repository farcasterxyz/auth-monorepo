import { parseSiweMessage, validateSiweMessage, type SiweMessage } from "viem/siwe";

export function parseNonPartialSiweMessage(message: string) {
  const parsedSiweMessage = parseSiweMessage(message);
  // if (!validateSiweMessage({ message: parsedSiweMessage })) throw new Error("Invalid SIWE message");
  return parsedSiweMessage as SiweMessage;
}
