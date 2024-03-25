"use client";

import { create } from "zustand";

type SignInMessageStore = {
  message: string | undefined;
  signature: `0x${string}` | undefined;
  set: ({ message, signature }: { message: string; signature: `0x${string}` }) => void;
  reset: () => void;
};

export const useSignInMessageStore = create<SignInMessageStore>((set) => ({
  message: undefined,
  signature: undefined,
  set: ({ message, signature }) => set({ message, signature }),
  reset: () => set({ message: undefined }),
}));

export function useSignInMessage() {
  return useSignInMessageStore(({ message, signature }) => ({ message, signature }));
}

export default useSignInMessage;
