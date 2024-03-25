import { SiweMessage } from "siwe";
import { AuthClientError } from "../errors.js";
import { STATEMENT } from "./constants.js";

export type ValidateSiweMessageStatementParameters = { message: SiweMessage };

export const validateSiweMessageStatement = ({ message }: ValidateSiweMessageStatementParameters): void => {
  const validStatement = message.statement === STATEMENT || message.statement === "Farcaster Connect";
  if (!validStatement) {
    throw new AuthClientError("bad_request.validation_failure", `Statement must be '${STATEMENT}'`);
  }
};
