"use client";

import { type PollSessionTillCompletedReturnType } from "@farcaster/auth-client";
import { create } from "zustand";

export type Profile = Pick<
  PollSessionTillCompletedReturnType,
  "fid" | "pfpUrl" | "username" | "displayName" | "bio" | "custody" | "verifications"
> & { isAuthenticated: boolean };

type ProfileStore = { profile: Profile | undefined; set: (profile: Profile) => void; reset: () => void };

export const useProfileStore = create<ProfileStore>((set) => ({
  profile: undefined,
  set: (profile) => set({ profile }),
  reset: () => set({ profile: undefined }),
}));

export function useProfile() {
  return useProfileStore(({ profile }) => profile);
}

export default useProfile;
