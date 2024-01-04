import { useSignIn } from "../..";
import useSignInMessage from "../../hooks/useSignInMessage";
import useUserData from "../../hooks/useUserData";
import { ConnectButton } from "../ConnectButton";
import { ConnectKitProvider } from "../ConnectKitProvider";

export function Demo() {
  const connectConfig = {
    relay: "http://localhost:8000",
    rpcUrl: "https://mainnet.optimism.io",
  };

  return (
    <ConnectKitProvider config={connectConfig}>
      <ConnectButton
        siweUri="http://example.com"
        domain="example.com"
        nonce="abcd1234"
        requestId="some-unique-request-id"
        debug
      />
      <UserProfile />
    </ConnectKitProvider>
  );
}

function UserProfile() {
  const {
    isAuthenticated,
    userData: { fid, bio, displayName },
  } = useUserData();
  const { message, signature } = useSignInMessage();

  return (
    <div style={{ fontFamily: "sans-serif" }}>
      {isAuthenticated && (
        <div>
          {fid && (
            <p>
              <strong>FID:</strong> {fid}
            </p>
          )}
          {displayName && (
            <p>
              <strong>Display name:</strong> {displayName}
            </p>
          )}
          {bio && (
            <p>
              <strong>Bio:</strong> {bio}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
