import useUserData from "../../hooks/useUserData";
import { ConnectButton } from "../ConnectButton";
import { ConnectKitProvider } from "../ConnectKitProvider";

export function Demo() {
  const connectConfig = {
    relayURI: "http://localhost:8000",
  };

  return (
    <ConnectKitProvider config={connectConfig}>
      <ConnectButton siweUri="http://example.com" domain="example.com" debug />
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
