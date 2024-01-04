import { useConnectKitContext } from "./useConnectKitContext";

export function useAppClient() {
  const { appClient } = useConnectKitContext();
  return appClient;
}

export default useAppClient;
