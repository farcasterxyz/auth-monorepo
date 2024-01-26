import useProfile from "../../hooks/useProfile";
import { SignInButton } from "../SignInButton";
import { AuthKitProvider } from "../AuthKitProvider";

export function Demo() {
  const config = {
    rpcUrl: "https://mainnet.optimism.io",
  };

  return (
    <AuthKitProvider config={config}>
      <div style={{ position: "fixed", top: 12, right: 12, zIndex: 1000 }}>
        <SignInButton
          nonce="abcd1234"
          requestId="some-unique-request-id"
          timeout={20000}
          onError={(error) => console.error("error callback:", error)}
          onSuccess={(data) => console.log("success callback:", data)}
          onStatusResponse={(res) => console.log("status callback:", res)}
          onSignOut={() => console.log("sign out callback")}
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
    profile: { fid, bio, displayName, custody },
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
          {custody && (
            <p>
              <strong>Custody address:</strong> {custody}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
