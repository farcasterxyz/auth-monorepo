import { SiweMessage } from "siwe";
import { ConnectResult } from "../errors";
import { validate } from "./validate";
import { parseSignInURI } from "./parseSignInURI";
import { STATEMENT, CHAIN_ID } from "./constants";

export type FarcasterResourceParams = {
  fid: number;
};
export type SignInMessageParams = Partial<SiweMessage> & FarcasterResourceParams;

export const build = (params: SignInMessageParams): ConnectResult<SiweMessage> => {
  const { fid, ...siweParams } = params;
  const resources = siweParams.resources ?? [];
  siweParams.statement = STATEMENT;
  siweParams.chainId = CHAIN_ID;
  siweParams.resources = [buildFidResource(fid), ...resources];
  return validate(siweParams);
};

export const buildFromSignInURI = (signInUri: string, fid: number): ConnectResult<SiweMessage> => {
  return parseSignInURI(signInUri).andThen(({ params }) => build({ ...params, fid }));
};

const buildFidResource = (fid: number): string => {
  return `farcaster://fid/${fid}`;
};
