import { ConnectButton } from "../ConnectButton";

export function Demo() {
  const connectConfig = {
    siweUri: "http://example.com",
    domain: "example.com",
    relayURI: "http://localhost:8000",
  };

  return <ConnectButton config={connectConfig} debug />;
}
