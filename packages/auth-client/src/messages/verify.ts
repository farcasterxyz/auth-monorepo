import { SiweMessage, SiweResponse, SiweError } from "siwe";
import { ResultAsync, err, ok } from "neverthrow";
import { AuthClientAsyncResult, AuthClientResult, AuthClientError } from "../errors";

import { validate, parseResources } from "./validate";
import { FarcasterResourceParams } from "./build";
import type { Provider } from "ethers";

type Hex = `0x${string}`;
type SignInOpts = {
  getFid: (custody: Hex) => Promise<BigInt>;
  provider?: Provider | undefined;
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
): AuthClientAsyncResult<VerifyResponse> => {
  const { getFid, provider } = options;
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

  const fid = await verifyFidOwner(siwe.value, getFid);
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
  fidVerifier: (custody: Hex) => Promise<BigInt>,
): AuthClientAsyncResult<SiweResponse & FarcasterResourceParams> => {
  const signer = response.data.address as Hex;
  return ResultAsync.fromPromise(fidVerifier(signer), (e) => {
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
};

const mergeResources = (response: SiweResponse): AuthClientResult<SiweResponse & FarcasterResourceParams> => {
  return parseResources(response.data).andThen((resources) => {
    return ok({ ...resources, ...response });
  });
};
