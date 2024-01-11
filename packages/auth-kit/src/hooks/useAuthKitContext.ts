import { useContext } from "react";

import { AuthKitContext } from "../components/AuthKitProvider/AuthKitProvider";

export function useAuthKitContext() {
  return useContext(AuthKitContext);
}

export default useAuthKitContext;
