import { SiweMessage } from "siwe";
import { AuthClientError } from "../errors.js";
import { STATEMENT, CHAIN_ID } from "./constants.js";
import { getSiweMessage } from "./getSiweMessage.js";

export type FarcasterResourceParameters = { fid: number };
export type CreateSiweMessageParameters = Partial<SiweMessage> & FarcasterResourceParameters;

export const createSiweMessage = (parameters: CreateSiweMessageParameters): SiweMessage => {
  try {
    const { fid, ...siweParameters } = parameters;
    const resources = siweParameters.resources ?? [];
    siweParameters.version = "1";
    siweParameters.statement = STATEMENT;
    siweParameters.chainId = CHAIN_ID;
    siweParameters.resources = [createFidResource(fid), ...resources];
    return getSiweMessage({ message: siweParameters });
  } catch (e) {
    throw new AuthClientError("bad_request.validation_failure", e as Error);
  }
};

const createFidResource = (fid: number): string => {
  return `farcaster://fid/${fid}`;
};
