import { SiweMessage } from "siwe";
import { AuthClientError } from "../errors.js";
import { CHAIN_ID } from "./constants.js";

type ValidateSiweMessageChainIdParameters = { message: SiweMessage };
export const validateSiweMessageChainId = ({ message }: ValidateSiweMessageChainIdParameters): void => {
  if (message.chainId !== CHAIN_ID) {
    throw new AuthClientError("bad_request.validation_failure", `Chain ID must be ${CHAIN_ID}`);
  }
};
