// Stub - not used in this app
import type React from "react";
import { createContext, useContext } from "react";

const ctx = createContext<{
  identity: null;
  isInitializing: false;
  loginStatus: string;
  login: () => void;
  clear: () => void;
}>({
  identity: null,
  isInitializing: false,
  loginStatus: "idle",
  login: () => {},
  clear: () => {},
});

export function InternetIdentityProvider({
  children,
}: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function useInternetIdentity() {
  return useContext(ctx);
}
