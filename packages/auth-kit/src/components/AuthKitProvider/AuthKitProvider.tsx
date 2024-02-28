import { createContext, ReactNode } from "react";
import { AppClient } from "@farcaster/auth-client";

export interface AuthKitConfig {
  relay?: string;
  domain?: string;
  siweUri?: string;
  rpcUrl?: string;
  version?: string;
  appClient: AppClient;
}

export interface AuthKitConfigContextValues {
  config: AuthKitConfig;
}

export const AuthKitContext = createContext<AuthKitConfigContextValues | null>(null);

export function AuthKitProvider({
  config,
  children,
}: {
  config: AuthKitConfig;
  children: ReactNode;
}) {
  return (
    <AuthKitContext.Provider
      value={{
        config,
      }}
    >
      {children}
    </AuthKitContext.Provider>
  );
}
