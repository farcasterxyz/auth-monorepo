import { useContext } from "react";
import { ConnectKitContext } from "../components/ConnectKitProvider/ConnectKitProvider";

export function useConnectKitContext() {
  return useContext(ConnectKitContext);
}

export default useConnectKitContext;
