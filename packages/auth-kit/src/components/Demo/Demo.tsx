import useProfile from "../../hooks/useProfile.js";
import { SignInButton } from "../SignInButton/index.js";
import { AuthKitProvider, createConfig } from "../AuthKitProvider/index.js";

export function Demo() {
  const config = createConfig({
    rpcUrl: "https://mainnet.optimism.io",
  });

  return (
    <AuthKitProvider config={config}>
      <div style={{ position: "fixed", top: 12, right: 12, zIndex: 1000 }}>
        <SignInButton
          nonce="abcd1234"
          requestId="some-unique-request-id"
          timeout={20000}
          onSignInError={(error) => console.error("error callback:", error)}
          onSignIn={(data) => console.log("success callback:", data)}
          onSignOut={() => console.log("sign out callback")}
        />
      </div>
      <UserProfile />
    </AuthKitProvider>
  );
}

function UserProfile() {
  const profile = useProfile();

  return (
    <div style={{ fontFamily: "sans-serif" }}>
      {profile?.isAuthenticated && (
        <div>
          {profile.fid && (
            <p>
              <strong>FID:</strong> {profile.fid}
            </p>
          )}
          {profile.displayName && (
            <p>
              <strong>Display name:</strong> {profile.displayName}
            </p>
          )}
          {profile.bio && (
            <p>
              <strong>Bio:</strong> {profile.bio}
            </p>
          )}
          {profile.custody && (
            <p>
              <strong>Custody address:</strong> {profile.custody}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
