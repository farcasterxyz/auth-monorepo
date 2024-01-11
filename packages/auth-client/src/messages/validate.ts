import { SiweMessage } from "siwe";
import { Result, err, ok } from "neverthrow";
import { AuthClientResult, AuthClientError } from "../errors";
import { STATEMENT, CHAIN_ID } from "./constants";
import { FarcasterResourceParams } from "./build";

const FID_URI_REGEX = /^farcaster:\/\/fid\/([1-9]\d*)\/?$/;

export const validate = (params: string | Partial<SiweMessage>): AuthClientResult<SiweMessage> => {
  return Result.fromThrowable(
    // SiweMessage validates itself when constructed
    () => new SiweMessage(params),
    // If construction time validation fails, propagate the error
    (e) => new AuthClientError("bad_request.validation_failure", e as Error),
  )()
    .andThen(validateStatement)
    .andThen(validateChainId)
    .andThen(validateResources);
};

export const parseResources = (message: SiweMessage): AuthClientResult<FarcasterResourceParams> => {
  const fid = parseFid(message);
  if (fid.isErr()) return err(fid.error);
  return ok({ fid: fid.value });
};

export const parseFid = (message: SiweMessage): AuthClientResult<number> => {
  const resource = (message.resources ?? []).find((resource) => {
    return FID_URI_REGEX.test(resource);
  });
  if (!resource) {
    return err(new AuthClientError("bad_request.validation_failure", "No fid resource provided"));
  }
  const fid = parseInt(resource.match(FID_URI_REGEX)?.[1] ?? "");
  if (isNaN(fid)) {
    return err(new AuthClientError("bad_request.validation_failure", "Invalid fid"));
  }
  return ok(fid);
};

export const validateStatement = (message: SiweMessage): AuthClientResult<SiweMessage> => {
  const validStatement = message.statement === STATEMENT || message.statement === "Farcaster Connect";
  if (!validStatement) {
    return err(new AuthClientError("bad_request.validation_failure", `Statement must be '${STATEMENT}'`));
  }
  return ok(message);
};

export const validateChainId = (message: SiweMessage): AuthClientResult<SiweMessage> => {
  if (message.chainId !== CHAIN_ID) {
    return err(new AuthClientError("bad_request.validation_failure", `Chain ID must be ${CHAIN_ID}`));
  }
  return ok(message);
};

export const validateResources = (message: SiweMessage): AuthClientResult<SiweMessage> => {
  const fidResources = (message.resources ?? []).filter((resource) => {
    return FID_URI_REGEX.test(resource);
  });
  if (fidResources.length === 0) {
    return err(new AuthClientError("bad_request.validation_failure", "No fid resource provided"));
  } else if (fidResources.length > 1) {
    return err(new AuthClientError("bad_request.validation_failure", "Multiple fid resources provided"));
  } else {
    return ok(message);
  }
};
