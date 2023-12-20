import { SiweMessage, SiweResponse, SiweError } from "siwe";
import { ResultAsync, err, ok } from "neverthrow";
import { Provider } from "ethers";
import { ConnectAsyncResult, ConnectResult, ConnectError } from "../errors";

import { validate, parseResources } from "./validate";
import { FarcasterResourceParams } from "./build";

type Hex = `0x${string}`;
type SignInOpts = {
  verifyFid: (custody: Hex) => Promise<BigInt>;
  provider?: Provider;
};
export type SignInResponse = SiweResponse & FarcasterResourceParams;

const voidVerifyFid = (_custody: Hex) => Promise.reject(new Error("Not implemented: Must provide an fid verifier"));

/**
 * Verify signature of a Farcaster Connect message. Returns an error if the
 * message is invalid or the signature is invalid.
 */
export const verify = async (
  message: string | Partial<SiweMessage>,
  signature: string,
  options: SignInOpts = {
    verifyFid: voidVerifyFid,
  },
): ConnectAsyncResult<SignInResponse> => {
  const { verifyFid, provider } = options;
  const valid = validate(message);
  if (valid.isErr()) return err(valid.error);

  const siwe = (await verifySiweMessage(valid.value, signature, provider)).andThen(mergeResources);
  if (siwe.isErr()) return err(siwe.error);
  if (!siwe.value.success) {
    const errMessage = siwe.value.error?.type ?? "Unknown error";
    return err(new ConnectError("unauthorized", errMessage));
  }

  const fid = await verifyFidOwner(siwe.value, verifyFid);
  if (fid.isErr()) return err(fid.error);
  if (!fid.value.success) {
    const errMessage = siwe.value.error?.type ?? "Unknown error";
    return err(new ConnectError("unauthorized", errMessage));
  }
  return ok(fid.value);
};

const verifySiweMessage = async (
  message: SiweMessage,
  signature: string,
  provider?: Provider,
): ConnectAsyncResult<SiweResponse> => {
  return ResultAsync.fromPromise(message.verify({ signature }, { provider, suppressExceptions: true }), (e) => {
    return new ConnectError("unauthorized", e as Error);
  });
};

const verifyFidOwner = async (
  response: SignInResponse,
  fidVerifier: (custody: Hex) => Promise<BigInt>,
): ConnectAsyncResult<SignInResponse> => {
  const signer = response.data.address as Hex;
  return ResultAsync.fromPromise(fidVerifier(signer), (e) => {
    return new ConnectError("unavailable", e as Error);
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

const mergeResources = (response: SiweResponse): ConnectResult<SignInResponse> => {
  return parseResources(response.data).andThen((resources) => {
    return ok({ ...resources, ...response });
  });
};
