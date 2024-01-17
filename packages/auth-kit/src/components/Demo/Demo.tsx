import useProfile from "../../hooks/useProfile";
import { SignInButton } from "../SignInButton";
import { AuthKitProvider } from "../AuthKitProvider";

export function Demo() {
  const config = {
    rpcUrl: "https://mainnet.optimism.io",
    siweUri: "https://example.com",
    domain: "example.com",
  };

  return (
    <AuthKitProvider config={config}>
      <div style={{ position: "fixed", top: 12, right: 12, zIndex: 1000 }}>
        <SignInButton
          nonce="abcd1234"
          requestId="some-unique-request-id"
          onError={(error) => console.error("error callback:", error)}
          onSuccess={(data) => console.log("success callback:", data)}
          onStatusResponse={(res) => console.log("status callback:", res)}
          debug
        />
      </div>
      <UserProfile />
    </AuthKitProvider>
  );
}

function UserProfile() {
  const {
    isAuthenticated,
    profile: { fid, bio, displayName },
  } = useProfile();

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
