import { SiweMessage } from "siwe";
import { AuthClientError } from "../errors";
import { STATEMENT, CHAIN_ID } from "./constants";
import { FarcasterResourceParams } from "./build";

const FID_URI_REGEX = /^farcaster:\/\/fid\/([1-9]\d*)\/?$/;

export const parseSiweMessage = (params: string | Partial<SiweMessage>): SiweMessage => {
  try {
    const message = new SiweMessage(params);
    validateStatement(message);
    validateChainId(message);
    validateResources(message);
    return message;
  } catch (e) {
    throw new AuthClientError("bad_request.validation_failure", e as Error);
  }
};

export const parseResources = (message: SiweMessage): FarcasterResourceParams => {
  const fid = parseFid(message);
  return { fid };
};

const parseFid = (message: SiweMessage): number => {
  const resource = (message.resources ?? []).find((resource) => {
    return FID_URI_REGEX.test(resource);
  });
  if (!resource) {
    throw new AuthClientError("bad_request.validation_failure", "No fid resource provided");
  }
  const fid = parseInt(resource.match(FID_URI_REGEX)?.[1] ?? "");
  if (Number.isNaN(fid)) {
    throw new AuthClientError("bad_request.validation_failure", "Invalid fid");
  }
  return fid;
};

const validateStatement = (message: SiweMessage): void => {
  const validStatement = message.statement === STATEMENT || message.statement === "Farcaster Connect";
  if (!validStatement) {
    throw new AuthClientError("bad_request.validation_failure", `Statement must be '${STATEMENT}'`);
  }
};

const validateChainId = (message: SiweMessage): void => {
  if (message.chainId !== CHAIN_ID) {
    throw new AuthClientError("bad_request.validation_failure", `Chain ID must be ${CHAIN_ID}`);
  }
};

const validateResources = (message: SiweMessage): void => {
  const fidResources = (message.resources ?? []).filter((resource) => {
    return FID_URI_REGEX.test(resource);
  });
  if (fidResources.length === 0) {
    throw new AuthClientError("bad_request.validation_failure", "No fid resource provided");
  }
  if (fidResources.length > 1) {
    throw new AuthClientError("bad_request.validation_failure", "Multiple fid resources provided");
  }
};
