import { SiweMessage } from "siwe";
import { AuthClientError } from "../errors.js";
import { FID_URI_REGEX } from "./constants.js";

type ValidateSiweMessageResourcesParameters = { message: SiweMessage };
export const validateSiweMessageResources = ({ message }: ValidateSiweMessageResourcesParameters): void => {
  const fidResources = (message.resources ?? []).filter((resource) => {
    return FID_URI_REGEX.test(resource);
  });
  if (fidResources.length === 0) {
    throw new AuthClientError("bad_request.validation_failure", "No fid resource provided");
  }
  if (fidResources.length > 1) {
    throw new AuthClientError("bad_request.validation_failure", "Multiple fid resources provided");
  }
};
