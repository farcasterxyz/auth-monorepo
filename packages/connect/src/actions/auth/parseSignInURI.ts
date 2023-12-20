import { Client } from "../../clients/createClient";
import { parseSignInURI as parse, ParsedSignInURI } from "../../messages/parseSignInURI";

export interface ParseSignInURIArgs {
  uri: string;
}
export type ParseSignInURIResponse = ParsedSignInURI;

export const parseSignInURI = (_client: Client, { uri }: ParseSignInURIArgs): ParseSignInURIResponse => {
  const result = parse(uri);
  if (result.isErr()) {
    throw result.error;
  } else {
    return result.value;
  }
};
