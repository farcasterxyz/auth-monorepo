import { type Address, type Client, createPublicClient, http, type Hex } from "viem";
import { type SiweMessage, verifySiweMessage as verifySiweMessageViem } from "viem/siwe";
import { ResultAsync, err, ok } from "neverthrow";

import { type AuthClientAsyncResult, type AuthClientResult, AuthClientError } from "../errors";
import { validate, parseResources } from "./validate";
import type { FarcasterResourceParams, AuthMethod } from "../types";
import { optimism } from "viem/chains";

export interface SiweResponse {
  success: boolean;
  data: SiweMessage;
}

export type VerifyResponse = SiweResponse &
  FarcasterResourceParams & { authMethod: AuthMethod } & {
    data: SiweMessage;
  };

type VerifyOpts = {
  acceptAuthAddress: boolean;
  getFid: (custody: Address) => Promise<bigint>;
  isValidAuthAddress: (authAddress: Address, fid: bigint) => Promise<boolean>;
  publicClient?: Client | undefined;
};

const defaultPublicClient = createPublicClient({
  chain: optimism,
  transport: http(),
});

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
  message: string,
  signature: string,
  options: VerifyOpts = {
    acceptAuthAddress: false,
    getFid: voidGetFid,
    isValidAuthAddress: voidIsValidAuthAddress,
  },
): AuthClientAsyncResult<VerifyResponse> => {
  const { publicClient = defaultPublicClient } = options;

  const valid = validate(message)
    .andThen((message) => validateNonce(message, nonce))
    .andThen((message) => validateDomain(message, domain));
  if (valid.isErr()) return err(valid.error);

  const siwe = (await verifySiweMessage(message, signature, publicClient)).andThen(() => mergeResources(valid.value));
  if (siwe.isErr()) return err(siwe.error);

  const auth = await verifyAuthorizedSigner(siwe.value, options);
  if (auth.isErr()) return err(auth.error);
  return ok(auth.value);
};

const validateNonce = (message: SiweMessage, nonce: string): AuthClientResult<SiweMessage> => {
  if (message.nonce !== nonce) {
    return err(new AuthClientError("unauthorized", "Invalid nonce"));
  }

  return ok(message);
};

const validateDomain = (message: SiweMessage, domain: string): AuthClientResult<SiweMessage> => {
  if (message.domain !== domain) {
    return err(new AuthClientError("unauthorized", "Invalid domain"));
  }

  return ok(message);
};

const verifySiweMessage = async (message: string, signature: string, client: Client): AuthClientAsyncResult<void> => {
  try {
    const verified = await verifySiweMessageViem(client, { message, signature: signature as Hex });
    if (verified) {
      return ok(undefined);
    }

    return err(new AuthClientError("unauthorized", "Failed to verify message"));
  } catch (e) {
    return err(new AuthClientError("unknown", e as Error));
  }
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
      return err(
        new AuthClientError(
          "unauthorized",
          `Invalid resource: signer ${signer} is not an auth address or owner of fid ${response.fid}.`,
        ),
      );
    }

    return ok({ ...response, authMethod: "custody" });
  }

  // Custody only verification
  return ResultAsync.fromPromise(getFid(signer), (e) => {
    return new AuthClientError("unavailable", e as Error);
  }).andThen((fid) => {
    if (fid !== BigInt(response.fid)) {
      return err(
        new AuthClientError("unauthorized", `Invalid resource: signer ${signer} does not own fid ${response.fid}.`),
      );
    }
    return ok({ ...response, authMethod: "custody" as AuthMethod });
  });
};

const mergeResources = (message: SiweMessage): AuthClientResult<SiweResponse & FarcasterResourceParams> => {
  return parseResources(message).andThen((resources) => {
    return ok({ ...resources, data: message, success: true });
  });
};
