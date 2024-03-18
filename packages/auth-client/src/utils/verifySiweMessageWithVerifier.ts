import { SiweMessage, type SiweResponse, SiweError } from "siwe";
import { AuthClientError } from "../errors.js";

import { type FarcasterResourceParameters } from "./createSiweMessage.js";
import type { Provider } from "ethers";
import { getSiweMessage } from "./getSiweMessage.js";
import { getResourcesFromSiweMessage } from "./getResourcesFromSiweMessage.js";
import type { Address } from "../types/address.js";

export type VerifySiweMessageWithVerifierParameters = {
  nonce: string;
  domain: string;
  message: string | Partial<SiweMessage>;
  signature: string;
  verifier: {
    getFid: (custody: Address) => Promise<bigint>;
    provider?: Provider;
  };
};
export type VerifySiweMessageWithVerifierReturnType = Omit<SiweResponse, "error"> & FarcasterResourceParameters;

const voidVerifyFid = (_custody: Address) => Promise.reject(new Error("Not implemented: Must provide an fid verifier"));

/**
 * Verify signature of a Sign In With Farcaster message. Returns an error if the
 * message is invalid or the signature is invalid.
 */
export const verifySiweMessageWithVerifier = async (
  parameters: VerifySiweMessageWithVerifierParameters,
): Promise<VerifySiweMessageWithVerifierReturnType> => {
  const {
    nonce,
    domain,
    message,
    signature,
    verifier = {
      getFid: voidVerifyFid,
    },
  } = parameters;

  const { getFid, provider } = verifier;
  const validatedMessage = getSiweMessage({ message });
  verifyNonce(validatedMessage, nonce);
  verifyDomain(validatedMessage, domain);

  const siweResponse = await verifySignature(validatedMessage, signature, provider);
  const siweResponseWithResources = mergeResources(siweResponse);

  if (!siweResponseWithResources.success) {
    const errMessage = siweResponseWithResources.error?.type ?? "Failed to verify SIWE message";
    throw new AuthClientError("unauthorized", errMessage);
  }

  const siweResponseWithResourcesAndValidatedFid = await verifyFidOwner(siweResponseWithResources, getFid);
  if (!siweResponseWithResourcesAndValidatedFid.success) {
    const errMessage = siweResponseWithResourcesAndValidatedFid.error?.type ?? "Failed to validate fid owner";
    throw new AuthClientError("unauthorized", errMessage);
  }
  const { error, ...response } = siweResponseWithResourcesAndValidatedFid;
  return response;
};

const verifySignature = async (message: SiweMessage, signature: string, provider?: Provider): Promise<SiweResponse> => {
  try {
    return await message.verify({ signature }, { provider, suppressExceptions: true });
  } catch (e) {
    throw new AuthClientError("unauthorized", e as Error);
  }
};

const verifyFidOwner = async (
  response: SiweResponse & FarcasterResourceParameters,
  fidVerifier: (custody: Address) => Promise<bigint>,
): Promise<SiweResponse & FarcasterResourceParameters> => {
  const signer = response.data.address as Address;
  try {
    const fid = await fidVerifier(signer);
    if (fid !== BigInt(response.fid)) {
      response.success = false;
      response.error = new SiweError(
        `Invalid resource: signer ${signer} does not own fid ${response.fid}.`,
        response.fid.toString(),
        fid.toString(),
      );
    }
    return response;
  } catch (e) {
    throw new AuthClientError("unavailable", e as Error);
  }
};

const mergeResources = (response: SiweResponse): SiweResponse & FarcasterResourceParameters => {
  const resources = getResourcesFromSiweMessage({ message: response.data });
  return { ...response, ...resources };
};

export const verifyNonce = (message: SiweMessage, nonce: string): void => {
  if (message.nonce !== nonce) {
    throw new AuthClientError("unauthorized", "Invalid nonce");
  }
};

export const verifyDomain = (message: SiweMessage, domain: string): void => {
  if (message.domain !== domain) {
    throw new AuthClientError("unauthorized", "Invalid domain");
  }
};
