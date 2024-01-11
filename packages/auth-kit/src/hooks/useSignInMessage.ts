import { useAuthKitContext } from "./useAuthKitContext";

export function useSignInMessage() {
  const { signInMessage } = useAuthKitContext();
  return signInMessage;
}

export default useSignInMessage;
