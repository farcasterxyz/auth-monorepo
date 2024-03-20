import { AuthClientError } from "../errors.js";
import { type CreateSiweMessageParameters } from "./createSiweMessage.js";

export type GetSiweMessageFromSignInURIParameters = { uri: string };

export type GetSiweMessageFromSignInURIReturnType = {
  channelToken: string;
  params: Partial<CreateSiweMessageParameters>;
};

export const getSiweMessageFromSignInURI = ({
  uri,
}: GetSiweMessageFromSignInURIParameters): GetSiweMessageFromSignInURIReturnType => {
  const url = new URL(uri);
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
  const { siweUri, ...siweParameters } = params;
  return { channelToken, params: { uri: siweUri, ...siweParameters } };
};

const validationFail = (message: string): AuthClientError => {
  return new AuthClientError("bad_request.validation_failure", message);
};
