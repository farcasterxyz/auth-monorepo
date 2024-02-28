import { Client } from "../../clients/createClient";
import { parseSignInURI as parse, ParsedSignInURI } from "../../messages/parseSignInURI";

export interface ParseSignInURIArgs {
  uri: string;
}
export type ParseSignInURIResponse = ParsedSignInURI;

export const parseSignInURI = (_client: Client, { uri }: ParseSignInURIArgs): ParseSignInURIResponse => {
  return parse(uri);
};
