import { SiweMessage } from "siwe";
import { err, ok } from "neverthrow";
import { ConnectResult } from "../errors";
import { validate } from "./validate";
import { parseSignInURI } from "./parseSignInURI";
import { STATEMENT, CHAIN_ID } from "./constants";

export type FarcasterResourceParams = {
  fid: number;
};
export type SignInMessageParams = Partial<SiweMessage> & FarcasterResourceParams;
export interface BuildResponse {
  siweMessage: SiweMessage;
  message: string;
}

export const build = (params: SignInMessageParams): ConnectResult<BuildResponse> => {
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

export const buildFromSignInURI = (signInUri: string, fid: number): ConnectResult<BuildResponse> => {
  return parseSignInURI(signInUri).andThen(({ params }) => build({ ...params, fid }));
};

const buildFidResource = (fid: number): string => {
  return `farcaster://fid/${fid}`;
};
