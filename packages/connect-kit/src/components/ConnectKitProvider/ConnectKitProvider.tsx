import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
import { AppClient, createAppClient, viem } from "@farcaster/connect";
import { StatusAPIResponse } from "../../hooks/useWatchStatus";

export interface ConnectKitConfig {
  relayURI: string;
}

export interface UserData {
  fid?: number;
  pfpUrl?: string;
  username?: string;
  displayName?: string;
  bio?: string;
}

export interface ConnectKitContextValues {
  isAuthenticated: boolean;
  config: ConnectKitConfig;
  userData: UserData;
  appClient?: AppClient;
  onSignIn: (signInData: StatusAPIResponse) => void;
}

const configDefaults = {
  relayURI: "https://connect.farcaster.xyz",
};

export const ConnectKitContext = createContext<ConnectKitContextValues>({
  isAuthenticated: false,
  config: configDefaults,
  userData: {},
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

  const connectConfig = {
    ...configDefaults,
    ...config,
  };
  const { relayURI } = connectConfig;

  useEffect(() => {
    const client = createAppClient({
      relayURI,
      ethereum: viem(),
    });
    setAppClient(client);
  }, [relayURI]);

  const onSignIn = useCallback((signInData: StatusAPIResponse) => {
    const { fid, username, bio, displayName, pfpUrl } = signInData;
    setIsAuthenticated(true);
    setUserData({ fid, username, bio, displayName, pfpUrl });
  }, []);

  return (
    <ConnectKitContext.Provider
      value={{
        appClient,
        isAuthenticated,
        userData,
        config: connectConfig,
        onSignIn,
      }}
    >
      {children}
    </ConnectKitContext.Provider>
  );
}
