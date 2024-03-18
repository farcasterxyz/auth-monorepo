import { type Client } from "../../clients/createClient.js";
import {
  type VerifySiweMessageReturnType as util_VerifySiweMessageReturnType,
  type VerifySiweMessageParameters as util_VerifySiweMessageParameters,
  verifySiweMessage as util_verifySiweMessage,
} from "../../utils/verifySiweMessage.js";
import type { Omit } from "../../types/utils.js";

export type VerifySiweMessageParameters = Omit<util_VerifySiweMessageParameters, "verifier">;

export type VerifySiweMessageReturnType = util_VerifySiweMessageReturnType;

export const verifySiweMessage = (
  client: Client,
  { nonce, domain, message, signature }: VerifySiweMessageParameters,
): Promise<VerifySiweMessageReturnType> => {
  return util_verifySiweMessage({
    nonce,
    domain,
    message,
    signature,
    verifier: {
      getFid: client.ethereum.getFid,
      provider: client.ethereum.provider,
    },
  });
};
