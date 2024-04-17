import { err, ok } from "neverthrow";
import { AuthClientError, AuthClientResult } from "../errors";
import { SignInMessageParams } from "./build";

export interface ParsedSignInURI {
  channelToken: string;
  params: Partial<SignInMessageParams> & { redirectUrl?: string };
}

export const parseSignInURI = (signInUri: string): AuthClientResult<ParsedSignInURI> => {
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
  const { siweUri, ...siweParams } = params;
  return ok({ channelToken, params: { uri: siweUri, ...siweParams } });
};

const validationFail = (message: string): AuthClientError => {
  return new AuthClientError("bad_request.validation_failure", message);
};
