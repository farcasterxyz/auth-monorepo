import { ConnectError } from "@farcaster/connect";

export function ErrorMessage({ error }: { error?: ConnectError }) {
  return <div>{error?.message}</div>;
}
