import { createSiweMessage, type SiweMessage } from "viem/siwe";
import { err, ok } from "neverthrow";
import type { AuthClientResult } from "../errors";
import { validate } from "./validate";
import { STATEMENT, CHAIN_ID } from "./constants";

export type FarcasterResourceParams = {
  fid: number;
};
export type SignInMessageParams = Omit<SiweMessage, "chainId" | "version"> & FarcasterResourceParams;
export interface BuildResponse {
  siweMessage: SiweMessage;
  message: string;
}

export const build = (params: SignInMessageParams): AuthClientResult<BuildResponse> => {
  const { fid, ...siweParams } = params;
  const valid = validate({
    ...siweParams,
    version: "1",
    statement: STATEMENT,
    chainId: CHAIN_ID,
    resources: [buildFidResource(fid), ...(siweParams.resources ?? [])],
  });
  if (valid.isErr()) return err(valid.error);
  else {
    const siweMessage = valid.value;
    return ok({ siweMessage, message: createSiweMessage(siweMessage) });
  }
};

const buildFidResource = (fid: number): string => {
  return `farcaster://fid/${fid}`;
};
