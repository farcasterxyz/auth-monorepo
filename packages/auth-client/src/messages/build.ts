import type { SiweMessage } from "siwe";
import { err, ok } from "neverthrow";
import { AuthClientResult } from "../errors";
import { validate } from "./validate";
import { STATEMENT, CHAIN_ID } from "./constants";
import type { SignInMessageParams } from "../types";

export interface BuildResponse {
  siweMessage: SiweMessage;
  message: string;
}

export const build = (params: SignInMessageParams): AuthClientResult<BuildResponse> => {
  const { fid, ...siweParams } = params;
  const resources = siweParams.resources ?? [];
  siweParams.version = "1";
  siweParams.statement = STATEMENT;
  siweParams.chainId = CHAIN_ID;
  siweParams.resources = [buildFidResource(fid), ...resources];
  const valid = validate(siweParams);
  if (valid.isErr()) return err(valid.error);
  else {
    const siweMessage = valid.value;
    return ok({ siweMessage, message: siweMessage.toMessage() });
  }
};

const buildFidResource = (fid: number): string => {
  return `farcaster://fid/${fid}`;
};
