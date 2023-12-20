import { err, ok } from "neverthrow";
import { ConnectError, ConnectResult } from "../errors";
import { SignInMessageParams } from "./build";

export interface ParsedSignInURI {
  channelToken: string;
  params: Partial<SignInMessageParams>;
}

export const parseSignInURI = (signInUri: string): ConnectResult<ParsedSignInURI> => {
  const url = new URL(signInUri);
  const searchParams = Object.fromEntries(url.searchParams.entries());
  const { channelToken, ...params } = searchParams;
  if (!channelToken) {
    return err(validationFail("No channel token provided"));
  }
  if (!params["nonce"]) {
    return err(validationFail("No nonce provided"));
  }
  if (!params["siweUri"]) {
    return err(validationFail("No SIWE URI provided"));
  }
  if (!params["domain"]) {
    return err(validationFail("No domain provided"));
  }
  return ok({ channelToken, params });
};

const validationFail = (message: string): ConnectError => {
  return new ConnectError("bad_request.validation_failure", message);
};
