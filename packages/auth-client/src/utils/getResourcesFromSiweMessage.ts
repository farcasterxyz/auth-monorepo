import { SiweMessage } from "siwe";
import { type FarcasterResourceParameters } from "./createSiweMessage.js";
import { getFidFromSiweMessage } from "./getFidFromSiweMessage.js";

export type GetResourcesFromSiweMessageParameters = { message: SiweMessage };
export const getResourcesFromSiweMessage = ({
  message,
}: GetResourcesFromSiweMessageParameters): FarcasterResourceParameters => {
  return { fid: getFidFromSiweMessage({ message }) };
};
