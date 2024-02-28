import "@farcaster/auth-kit/styles.css";
import { AuthKitProvider, createConfig, SignInButton, useProfile } from "@farcaster/auth-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const config = createConfig({
  // For a production app, replace this with an Optimism Mainnet
  // RPC URL from a provider like Alchemy or Infura.
  relay: "https://relay.farcaster.xyz",
  rpcUrl: "https://mainnet.optimism.io",
  domain: "example.com",
  siweUri: "https://example.com/login",
});

function App() {
  return (
    <main style={{ fontFamily: 'Inter, "Inter Placeholder", sans-serif' }}>
      <QueryClientProvider client={queryClient}>
        <AuthKitProvider config={config}>
          <div style={{ position: "fixed", top: "12px", right: "12px" }}>
            <SignInButton />
          </div>
          <div style={{ paddingTop: "33vh", textAlign: "center" }}>
            <h1>@farcaster/auth-kit + Vite</h1>
            <p>
              This example app shows how to use{" "}
              <a href="https://docs.farcaster.xyz/auth-kit/introduction" target="_blank" rel="noreferrer">
                Farcaster AuthKit
              </a>{" "}
              and{" "}
              <a href="https://vitejs.dev/" target="_blank" rel="noreferrer">
                Vite
              </a>
              .
            </p>
            <Profile />
            <div>
              <h2>Run this demo:</h2>
              <div
                style={{
                  margin: "0 auto",
                  padding: "24px",
                  textAlign: "left",
                  maxWidth: "640px",
                  backgroundColor: "#fafafa",
                  fontFamily: "monospace",
                  fontSize: "1.25em",
                  border: "1px solid #eaeaea",
                }}
              >
                git clone https://github.com/farcasterxyz/auth-monorepo.git &&
                <br />
                cd auth-monorepo/examples/frontend-only &&
                <br />
                pnpm install &&
                <br />
                pnpm dev
              </div>
            </div>
          </div>
        </AuthKitProvider>
      </QueryClientProvider>
    </main>
  );
}

function Profile() {
  const profile = useProfile();

  return (
    <>
      {profile?.isAuthenticated ? (
        <div>
          <p>
            Hello, {profile.displayName}! Your FID is {profile.fid}.
          </p>
          <p>
            Your custody address is: <pre>{profile.custody}</pre>
          </p>
        </div>
      ) : (
        <p>Click the "Sign in with Farcaster" button above, then scan the QR code to sign in.</p>
      )}
    </>
  );
}

export default App;
