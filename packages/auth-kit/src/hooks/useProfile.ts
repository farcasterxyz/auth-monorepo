import { useAuthKitContext } from "./useAuthKitContext";

export function useProfile() {
  const { isAuthenticated, profile } = useAuthKitContext();
  return { isAuthenticated, profile };
}

export default useProfile;
