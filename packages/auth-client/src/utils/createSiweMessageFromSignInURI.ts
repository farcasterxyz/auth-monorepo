import { SiweMessage } from "siwe";
import { createSiweMessage } from "./createSiweMessage.js";
import { getSiweMessageFromSignInURI } from "./getSiweMessageFromSignInURI.js";

export type CreateSiweMessageFromSignInURIParameters = { uri: string; fid: number };

export const createSiweMessageFromSignInURI = ({ uri, fid }: CreateSiweMessageFromSignInURIParameters): SiweMessage => {
  const parsedSignInURI = getSiweMessageFromSignInURI({ uri });
  return createSiweMessage({ ...parsedSignInURI.params, fid });
};
