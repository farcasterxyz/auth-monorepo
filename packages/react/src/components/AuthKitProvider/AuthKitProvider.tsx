"use client";

import { createContext, type ReactNode } from "react";
import { type Config } from "../../types/config.js";

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
