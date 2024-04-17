import { createContext, ReactNode, useCallback, useEffect, useState } from "react";
import { AppClient, createAppClient, viemConnector, Provider } from "@farcaster/auth-client";
import { UseSignInData } from "../../hooks/useSignIn";

export interface AuthKitConfig {
  relay?: string;
  domain?: string;
  siweUri?: string;
  rpcUrl?: string;
  redirectUrl?: string;
  version?: string;
  provider?: Provider;
}

export interface Profile {
  fid?: number;
  pfpUrl?: string;
  username?: string;
  displayName?: string;
  bio?: string;
  custody?: `0x${string}`;
  verifications?: `0x${string}`[];
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

const domainDefaults = (typeof window !== 'undefined' && window?.location) ? {
  domain: window.location.host,
  siweUri: window.location.href
} : {};

const configDefaults = {
  relay: "https://relay.farcaster.xyz",
  version: "v1",
  ...domainDefaults
};

export const AuthKitContext = createContext<AuthKitContextValues>({
  isAuthenticated: false,
  config: configDefaults,
  profile: {},
  signInMessage: {},
  onSignIn: () => { },
  onSignOut: () => { },
});

export function AuthKitProvider({
  config,
  children,
}: {
  config: AuthKitConfig;
  children: ReactNode;
}) {
  const [appClient, setAppClient] = useState<AppClient>();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [profile, setProfile] = useState<Profile>({});
  const [signInMessage, setSignInMessage] = useState<SignInMessage>({});

  const authKitConfig = {
    ...configDefaults,
    ...config,
  };
  const { relay, rpcUrl, version, provider } = authKitConfig;

  useEffect(() => {
    const ethereum = rpcUrl ? viemConnector({ rpcUrl }) : viemConnector();
    const client = createAppClient({
      relay,
      ethereum,
      version,
    }, provider);
    setAppClient(client);
  }, [relay, rpcUrl, version, provider]);

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
  }

  return (
    <AuthKitContext.Provider
      value={{
        appClient,
        isAuthenticated,
        profile,
        signInMessage,
        config: authKitConfig,
        onSignIn,
        onSignOut
      }}
    >
      {children}
    </AuthKitContext.Provider>
  );
}
