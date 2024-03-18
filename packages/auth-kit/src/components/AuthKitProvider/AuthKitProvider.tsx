import { createContext, ReactNode } from "react";
import { Config } from "../../types/config";

export interface AuthKitConfigContextValues {
  config: Config;
}

export const AuthKitContext = createContext<AuthKitConfigContextValues | null>(null);

export function AuthKitProvider({
  config,
  children,
}: {
  config: Config;
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
