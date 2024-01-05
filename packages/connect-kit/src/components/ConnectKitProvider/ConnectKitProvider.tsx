import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
import { AppClient, createAppClient, viem } from "@farcaster/connect";
import { UseSignInData } from "../../hooks/useSignIn";

export interface ConnectKitConfig {
  relay: string;
  domain?: string;
  siweUri?: string;
  rpcUrl?: string;
  version?: string;
}

export interface UserData {
  fid?: number;
  pfpUrl?: string;
  username?: string;
  displayName?: string;
  bio?: string;
}

export interface SignInMessage {
  message?: string;
  signature?: string;
}

export interface ConnectKitContextValues {
  isAuthenticated: boolean;
  config: ConnectKitConfig;
  userData: UserData;
  signInMessage: SignInMessage;
  appClient?: AppClient;
  onSignIn: (signInData: UseSignInData) => void;
}

const configDefaults = {
  relay: "https://relay.farcaster.xyz",
  version: "v1",
};

export const ConnectKitContext = createContext<ConnectKitContextValues>({
  isAuthenticated: false,
  config: configDefaults,
  userData: {},
  signInMessage: {},
  onSignIn: () => {},
});

export function ConnectKitProvider({
  config,
  children,
}: {
  config: ConnectKitConfig;
  children: ReactNode;
}) {
  const [appClient, setAppClient] = useState<AppClient>();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserData>({});
  const [signInMessage, setSignInMessage] = useState<SignInMessage>({});

  const connectConfig = {
    ...configDefaults,
    ...config,
  };
  const { relay, rpcUrl, version } = connectConfig;

  useEffect(() => {
    const ethereum = rpcUrl ? viem({ rpcUrl }) : viem();
    const client = createAppClient({
      relay,
      ethereum,
      version,
    });
    setAppClient(client);
  }, [relay, rpcUrl, version]);

  const onSignIn = useCallback((signInData: UseSignInData) => {
    const { message, signature, fid, username, bio, displayName, pfpUrl } =
      signInData;
    setIsAuthenticated(true);
    setUserData({ fid, username, bio, displayName, pfpUrl });
    setSignInMessage({ message, signature });
  }, []);

  return (
    <ConnectKitContext.Provider
      value={{
        appClient,
        isAuthenticated,
        userData,
        signInMessage,
        config: connectConfig,
        onSignIn,
      }}
    >
      {children}
    </ConnectKitContext.Provider>
  );
}
