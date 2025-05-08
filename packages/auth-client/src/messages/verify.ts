import type { Address } from "viem";
import type { Provider } from "ethers";
import { SiweMessage, SiweResponse, SiweError } from "siwe";
import { ResultAsync, err, ok } from "neverthrow";

import { AuthClientAsyncResult, AuthClientResult, AuthClientError } from "../errors";
import { validate, parseResources } from "./validate";
import type { FarcasterResourceParams, AuthMethod } from "../types";

export type VerifyResponse = Omit<SiweResponse, "error"> & FarcasterResourceParams & { authMethod: AuthMethod };

type VerifyOpts = {
  acceptAuthAddress: boolean;
  getFid: (custody: Address) => Promise<bigint>;
  isValidAuthAddress: (authAddress: Address, fid: bigint) => Promise<boolean>;
  provider?: Provider | undefined;
};

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
  options: VerifyOpts = {
    acceptAuthAddress: false,
    getFid: voidGetFid,
    isValidAuthAddress: voidIsValidAuthAddress,
  },
): AuthClientAsyncResult<VerifyResponse> => {
  const valid = validate(message)
    .andThen((message) => validateNonce(message, nonce))
    .andThen((message) => validateDomain(message, domain));
  if (valid.isErr()) return err(valid.error);

  const siwe = (await verifySiweMessage(valid.value, signature, options.provider)).andThen(mergeResources);
  if (siwe.isErr()) return err(siwe.error);
  if (!siwe.value.success) {
    const errMessage = siwe.value.error?.type ?? "Failed to verify SIWE message";
    return err(new AuthClientError("unauthorized", errMessage));
  }

  const auth = await verifyAuthorizedSigner(siwe.value, options);
  if (auth.isErr()) return err(auth.error);
  if (!auth.value.success) {
    const errMessage = siwe.value.error?.type ?? "Failed to verify signer";
    return err(new AuthClientError("unauthorized", errMessage));
  }
  const { error, ...response } = auth.value;
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

const verifyAuthorizedSigner = async (
  response: SiweResponse & FarcasterResourceParams,
  options: VerifyOpts,
): AuthClientAsyncResult<SiweResponse & FarcasterResourceParams & { authMethod: AuthMethod }> => {
  const { getFid, isValidAuthAddress, acceptAuthAddress } = options;
  const signer = response.data.address as Address;

  if (acceptAuthAddress) {
    // First try auth address verification
    const authAddressResult = await ResultAsync.fromPromise(
      isValidAuthAddress(signer, BigInt(response.fid)),
      (e) => new AuthClientError("unavailable", e as Error),
    );

    if (authAddressResult.isErr()) {
      return err(authAddressResult.error);
    }
    if (authAddressResult.isOk() && authAddressResult.value === true) {
      return ok({ ...response, authMethod: "authAddress" });
    }

    // ...then try custody verification
    const fidResult = await ResultAsync.fromPromise(
      getFid(signer),
      (e) => new AuthClientError("unavailable", e as Error),
    );

    if (fidResult.isErr()) {
      return err(fidResult.error);
    }

    if (fidResult.isOk() && fidResult.value !== BigInt(response.fid)) {
      // Return error if custody verification also failed
      response.success = false;
      response.error = new SiweError(
        `Invalid resource: signer ${signer} is not an auth address or owner of fid ${response.fid}.`,
        response.fid.toString(),
        fidResult.value.toString(),
      );
    }

    return ok({ ...response, authMethod: "custody" });
  } else {
    // Custody only verification
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
      return ok({ ...response, authMethod: "custody" as AuthMethod });
    });
  }
};

const mergeResources = (response: SiweResponse): AuthClientResult<SiweResponse & FarcasterResourceParams> => {
  return parseResources(response.data).andThen((resources) => {
    return ok({ ...resources, ...response });
  });
};
