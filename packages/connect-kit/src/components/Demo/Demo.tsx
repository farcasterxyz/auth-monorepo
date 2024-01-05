import useUserData from "../../hooks/useUserData";
import { ConnectButton } from "../ConnectButton";
import { ConnectKitProvider } from "../ConnectKitProvider";

export function Demo() {
  const connectConfig = {
    relay: "http://localhost:8000",
    rpcUrl: "https://mainnet.optimism.io",
    siweUri: "https://example.com",
    domain: "example.com"
  };

  return (
    <ConnectKitProvider config={connectConfig}>
      <ConnectButton
        nonce="abcd1234"
        requestId="some-unique-request-id"
        onError={(error) => console.error("error callback:", error)}
        onSuccess={(data) => console.log("success callback:", data)}
        onStatusResponse={(res) => console.log("status callback:", res)}
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
