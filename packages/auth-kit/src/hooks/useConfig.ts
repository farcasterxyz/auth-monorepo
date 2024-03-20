"use client";

import { useContext } from "react";
import { AuthKitContext } from "../components/AuthKitProvider/AuthKitProvider.js";

export function useConfig() {
  const context = useContext(AuthKitContext);
  if (!context) throw new Error("`useConfig` must be used within `AuthKitProvider`");
  return context.config;
}
