import { create } from "zustand";
import type { SessionToken } from "@/types/domain";

export type AuthStatus = "anonymous" | "authenticating" | "authenticated";

export type AuthState = {
  accessToken: string | null;
  tokenType: string;
  status: AuthStatus;
  setAuthenticating: () => void;
  setSession: (session: SessionToken) => void;
  clearSession: () => void;
};

const initialState = {
  accessToken: null,
  tokenType: "Bearer",
  status: "anonymous" as const,
};

export const useAuthStore = create<AuthState>((set) => ({
  ...initialState,
  setAuthenticating: () => set({ status: "authenticating" }),
  setSession: ({ accessToken, tokenType }) =>
    set({ accessToken, tokenType, status: "authenticated" }),
  clearSession: () => set(initialState),
}));
