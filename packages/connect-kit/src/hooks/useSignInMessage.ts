import { useConnectKitContext } from "./useConnectKitContext";

export function useSignInMessage() {
  const { signInMessage } = useConnectKitContext();
  return signInMessage;
}

export default useSignInMessage;
