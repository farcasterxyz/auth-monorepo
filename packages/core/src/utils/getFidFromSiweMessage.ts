import { SiweMessage } from "siwe";
import { AuthClientError } from "../errors.js";
import { FID_URI_REGEX } from "./constants.js";

export type GetFidFromSiweMessageParameters = { message: SiweMessage };
export const getFidFromSiweMessage = ({ message }: GetFidFromSiweMessageParameters): number => {
  const resource = (message.resources ?? []).find((resource) => {
    return FID_URI_REGEX.test(resource);
  });
  if (!resource) {
    throw new AuthClientError("bad_request.validation_failure", "No fid resource provided");
  }
  const fid = parseInt(resource.match(FID_URI_REGEX)?.[1] ?? "");
  if (Number.isNaN(fid)) {
    throw new AuthClientError("bad_request.validation_failure", "Invalid fid");
  }
  return fid;
};
