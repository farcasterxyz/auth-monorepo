import { SiweMessage } from "siwe";
import { parseSiweMessage } from "./validate";
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

export const build = (params: SignInMessageParams): BuildResponse => {
  const { fid, ...siweParams } = params;
  const resources = siweParams.resources ?? [];
  siweParams.version = "1";
  siweParams.statement = STATEMENT;
  siweParams.chainId = CHAIN_ID;
  siweParams.resources = [buildFidResource(fid), ...resources];
  const valid = parseSiweMessage(siweParams);
  const siweMessage = valid;
  return { siweMessage, message: siweMessage.toMessage() };
};

export const buildFromSignInURI = (signInUri: string, fid: number): BuildResponse => {
  const parsedSignInURI = parseSignInURI(signInUri);
  return build({ ...parsedSignInURI.params, fid });
};

const buildFidResource = (fid: number): string => {
  return `farcaster://fid/${fid}`;
};
