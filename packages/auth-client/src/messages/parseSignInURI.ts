import { err, ok } from "neverthrow";
import { AuthClientError, AuthClientResult } from "../errors";

export interface ParsedSignInURI {
  channelToken: string;
}

export const parseSignInURI = (signInUri: string): AuthClientResult<ParsedSignInURI> => {
  const url = new URL(signInUri);
  const searchParams = Object.fromEntries(url.searchParams.entries());
  const { channelToken } = searchParams;
  if (!channelToken) {
    return err(validationFail("No channel token provided"));
  }
  return ok({ channelToken });
};

const validationFail = (message: string): AuthClientError => {
  return new AuthClientError("bad_request.validation_failure", message);
};
