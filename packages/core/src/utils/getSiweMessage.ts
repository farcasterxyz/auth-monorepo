import { SiweMessage } from "siwe";
import { AuthClientError } from "../errors.js";
import { validateSiweMessageChainId } from "./validateSiweMessageChainId.js";
import { validateSiweMessageResources } from "./validateSiweMessageResources.js";
import { validateSiweMessageStatement } from "./validateSiweMessageStatement.js";

export type GetSiweMessageParameters = { message: string | Partial<SiweMessage> };
export const getSiweMessage = (parameters: GetSiweMessageParameters): SiweMessage => {
  try {
    const message = new SiweMessage(parameters.message);
    validateSiweMessageStatement({ message });
    validateSiweMessageChainId({ message });
    validateSiweMessageResources({ message });
    return message;
  } catch (e) {
    throw new AuthClientError("bad_request.validation_failure", e as Error);
  }
};
