import { SiweMessage, SiweResponse, SiweError } from "siwe";
import { AuthClientError } from "../errors";

import { parseSiweMessage, parseResources } from "./validate";
import { FarcasterResourceParams } from "./build";
import type { Provider } from "ethers";

type Hex = `0x${string}`;
type SignInOpts = {
  getFid: (custody: Hex) => Promise<bigint>;
  provider?: Provider;
};
export type VerifyResponse = Omit<SiweResponse, "error"> & FarcasterResourceParams;

const voidVerifyFid = (_custody: Hex) => Promise.reject(new Error("Not implemented: Must provide an fid verifier"));

/**
 * Verify signature of a Sign In With Farcaster message. Returns an error if the
 * message is invalid or the signature is invalid.
 */
export const verify = async (
  nonce: string,
  domain: string,
  message: string | Partial<SiweMessage>,
  signature: string,
  options: SignInOpts = {
    getFid: voidVerifyFid,
  },
): Promise<VerifyResponse> => {
  const { getFid, provider } = options;
  const validatedMessage = parseSiweMessage(message);
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
  response: SiweResponse & FarcasterResourceParams,
  fidVerifier: (custody: Hex) => Promise<bigint>,
): Promise<SiweResponse & FarcasterResourceParams> => {
  const signer = response.data.address as Hex;
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

const mergeResources = (response: SiweResponse): SiweResponse & FarcasterResourceParams => {
  const resources = parseResources(response.data);
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
