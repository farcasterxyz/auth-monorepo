import { useConnectKitContext } from "./useConnectKitContext";

export function useUserData() {
  const { isAuthenticated, userData } = useConnectKitContext();
  return { isAuthenticated, userData };
}

export default useUserData;
