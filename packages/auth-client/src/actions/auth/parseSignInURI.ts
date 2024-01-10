import { Unwrapped, unwrap } from "../../errors";
import { Client } from "../../clients/createClient";
import { parseSignInURI as parse, ParsedSignInURI } from "../../messages/parseSignInURI";

export interface ParseSignInURIArgs {
  uri: string;
}
export type ParseSignInURIResponse = Unwrapped<ParsedSignInURI>;

export const parseSignInURI = (_client: Client, { uri }: ParseSignInURIArgs): ParseSignInURIResponse => {
  return unwrap(parse(uri));
};
