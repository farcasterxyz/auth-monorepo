import { AuthClientError } from "@farcaster/auth-client";

export function ErrorMessage({ error }: { error?: AuthClientError }) {
  return <div>{error?.message}</div>;
}
