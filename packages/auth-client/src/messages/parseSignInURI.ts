import { AuthClientError } from "../errors";
import { SignInMessageParams } from "./build";

export interface ParsedSignInURI {
  channelToken: string;
  params: Partial<SignInMessageParams>;
}

export const parseSignInURI = (signInUri: string): ParsedSignInURI => {
  const url = new URL(signInUri);
  const searchParams = Object.fromEntries(url.searchParams.entries());
  const { channelToken, ...params } = searchParams;
  if (!channelToken) {
    throw validationFail("No channel token provided");
  }
  if (!params["nonce"]) {
    throw validationFail("No nonce provided");
  }
  if (!params["siweUri"]) {
    throw validationFail("No SIWE URI provided");
  }
  if (!params["domain"]) {
    throw validationFail("No domain provided");
  }
  const { siweUri, ...siweParams } = params;
  return { channelToken, params: { uri: siweUri, ...siweParams } };
};

const validationFail = (message: string): AuthClientError => {
  return new AuthClientError("bad_request.validation_failure", message);
};
