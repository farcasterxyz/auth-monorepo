import "@farcaster/auth-kit/styles.css";
import { AuthKitProvider, SignInButton } from "@farcaster/auth-kit";

const config = {
  // For a production app, replace this with an Optimism Mainnet
  // RPC URL from a provider like Alchemy or Infura.
  relay: "https://relay.farcaster.xyz",
  rpcUrl: "https://mainnet.optimism.io",
  domain: "example.com",
  siweUri: "https://example.com/login",
};

export default function App() {
  // In a production app with a backend, this should be provided
  // by the server.
  const nonce = "12345678";

  return (
    <main>
      <AuthKitProvider config={config}>
        <SignInButton nonce={nonce} />
      </AuthKitProvider>
    </main>
  );
}
