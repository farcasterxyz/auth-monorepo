import type { Hex, Address } from "viem";
import { SiweMessage, SiweResponse, SiweError } from "siwe";
import { ResultAsync, err, ok } from "neverthrow";
import { AuthClientAsyncResult, AuthClientResult, AuthClientError } from "../errors";

import { validate, parseResources } from "./validate";
import { FarcasterResourceParams } from "./build";
import type { Provider } from "ethers";

type SignInOpts = {
  getFid: (custody: Address) => Promise<bigint>;
  isValidAuthAddress: (authAddress: Address, fid: bigint) => Promise<boolean>;
  provider?: Provider | undefined;
};
export type VerifyResponse = Omit<SiweResponse, "error"> & FarcasterResourceParams;

const voidGetFid = (_custody: Address) => Promise.reject(new Error("Not implemented: Must provide an fid verifier"));

const voidIsValidAuthAddress = (_custody: Address) =>
  Promise.reject(new Error("Not implemented: Must provide an auth address verifier"));

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
    getFid: voidGetFid,
    isValidAuthAddress: voidIsValidAuthAddress,
  },
): AuthClientAsyncResult<VerifyResponse> => {
  const { getFid, isValidAuthAddress, provider } = options;
  const valid = validate(message)
    .andThen((message) => validateNonce(message, nonce))
    .andThen((message) => validateDomain(message, domain));
  if (valid.isErr()) return err(valid.error);

  const siwe = (await verifySiweMessage(valid.value, signature, provider)).andThen(mergeResources);
  if (siwe.isErr()) return err(siwe.error);
  if (!siwe.value.success) {
    const errMessage = siwe.value.error?.type ?? "Failed to verify SIWE message";
    return err(new AuthClientError("unauthorized", errMessage));
  }

  const fid = await verifyFidOwner(siwe.value, getFid, isValidAuthAddress);
  if (fid.isErr()) return err(fid.error);
  if (!fid.value.success) {
    const errMessage = siwe.value.error?.type ?? "Failed to validate fid owner";
    return err(new AuthClientError("unauthorized", errMessage));
  }
  const { error, ...response } = fid.value;
  return ok(response);
};

const validateNonce = (message: SiweMessage, nonce: string): AuthClientResult<SiweMessage> => {
  if (message.nonce !== nonce) {
    return err(new AuthClientError("unauthorized", "Invalid nonce"));
  } else {
    return ok(message);
  }
};

const validateDomain = (message: SiweMessage, domain: string): AuthClientResult<SiweMessage> => {
  if (message.domain !== domain) {
    return err(new AuthClientError("unauthorized", "Invalid domain"));
  } else {
    return ok(message);
  }
};

const verifySiweMessage = async (
  message: SiweMessage,
  signature: string,
  provider?: Provider,
): AuthClientAsyncResult<SiweResponse> => {
  return ResultAsync.fromPromise(message.verify({ signature }, { provider, suppressExceptions: true }), (e) => {
    return new AuthClientError("unauthorized", e as Error);
  });
};

const verifyFidOwner = async (
  response: SiweResponse & FarcasterResourceParams,
  getFid: (custody: Address) => Promise<bigint>,
  isValidAuthAddress: (authAddress: Address, fid: bigint) => Promise<boolean>,
): AuthClientAsyncResult<SiweResponse & FarcasterResourceParams> => {
  const signer = response.data.address as Address;
  if (response.method === "authAddress") {
    return ResultAsync.fromPromise(isValidAuthAddress(signer, BigInt(response.fid)), (e) => {
      return new AuthClientError("unavailable", e as Error);
    }).andThen((isValid) => {
      if (isValid !== true) {
        response.success = false;
        response.error = new SiweError(
          `Invalid resource: signer ${signer} is not an auth address for fid ${response.fid}.`,
        );
      }
      return ok(response);
    });
  } else {
    return ResultAsync.fromPromise(getFid(signer), (e) => {
      return new AuthClientError("unavailable", e as Error);
    }).andThen((fid) => {
      if (fid !== BigInt(response.fid)) {
        response.success = false;
        response.error = new SiweError(
          `Invalid resource: signer ${signer} does not own fid ${response.fid}.`,
          response.fid.toString(),
          fid.toString(),
        );
      }
      return ok(response);
    });
  }
};

const mergeResources = (response: SiweResponse): AuthClientResult<SiweResponse & FarcasterResourceParams> => {
  return parseResources(response.data).andThen((resources) => {
    return ok({ ...resources, ...response });
  });
};
