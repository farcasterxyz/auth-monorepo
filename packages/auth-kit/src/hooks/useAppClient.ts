import { useAuthKitContext } from "./useAuthKitContext";

export function useAppClient() {
  const { appClient } = useAuthKitContext();
  return appClient;
}

export default useAppClient;
