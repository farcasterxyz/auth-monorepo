import { createContext, type ReactNode, useCallback, useEffect, useState } from "react";
import { type AppClient, createAppClient, viemConnector } from "@farcaster/auth-client";
import type { UseSignInData } from "../../hooks/useSignIn";

export interface AuthKitConfig {
  relay?: string;
  domain?: string;
  siweUri?: string;
  rpcUrl?: string;
  /**
   * Ensure you provide a stable array reference here to prevent unnecessary re-renders.
   */
  rpcUrls?: string[];
  redirectUrl?: string;
  version?: string;
}

export interface Profile {
  fid?: number;
  pfpUrl?: string;
  username?: string;
  displayName?: string;
  bio?: string;
  custody?: `0x${string}`;
  verifications?: string[];
}

export interface SignInMessage {
  message?: string;
  signature?: string;
}

export interface AuthKitContextValues {
  isAuthenticated: boolean;
  config: AuthKitConfig;
  profile: Profile;
  signInMessage: SignInMessage;
  appClient?: AppClient;
  onSignIn: (signInData: UseSignInData) => void;
  onSignOut: () => void;
}

const domainDefaults =
  typeof window !== "undefined" && window?.location
    ? {
        domain: window.location.host,
        siweUri: window.location.href,
      }
    : {};

const configDefaults = {
  relay: "https://relay.farcaster.xyz",
  version: "v1",
  ...domainDefaults,
};

export const AuthKitContext = createContext<AuthKitContextValues>({
  isAuthenticated: false,
  config: configDefaults,
  profile: {},
  signInMessage: {},
  onSignIn: () => {},
  onSignOut: () => {},
});

export function AuthKitProvider({ config, children }: { config: AuthKitConfig; children: ReactNode }) {
  const [appClient, setAppClient] = useState<AppClient>();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [profile, setProfile] = useState<Profile>({});
  const [signInMessage, setSignInMessage] = useState<SignInMessage>({});

  const authKitConfig = {
    ...configDefaults,
    ...config,
  };
  const { relay, rpcUrl, rpcUrls, version } = authKitConfig;

  useEffect(() => {
    const ethereum = viemConnector({ rpcUrl, rpcUrls });
    const client = createAppClient({
      relay,
      ethereum,
      version,
    });
    setAppClient(client);
  }, [relay, rpcUrl, rpcUrls, version]);

  const onSignIn = useCallback((signInData: UseSignInData) => {
    const { message, signature, fid, username, bio, displayName, pfpUrl, custody, verifications } = signInData;
    setIsAuthenticated(true);
    setProfile({ fid, username, bio, displayName, pfpUrl, custody, verifications });
    setSignInMessage({ message, signature });
  }, []);

  const onSignOut = () => {
    setIsAuthenticated(false);
    setProfile({});
    setSignInMessage({});
  };

  return (
    <AuthKitContext.Provider
      value={{
        appClient,
        isAuthenticated,
        profile,
        signInMessage,
        config: authKitConfig,
        onSignIn,
        onSignOut,
      }}
    >
      {children}
    </AuthKitContext.Provider>
  );
}
