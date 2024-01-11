import { useAuthKitContext } from "./useAuthKitContext";

export function useUserData() {
  const { isAuthenticated, userData } = useAuthKitContext();
  return { isAuthenticated, userData };
}

export default useUserData;
