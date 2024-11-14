import { Provider, RpcRequest } from "ox";
import { frameHost } from "./frameHost";

const emitter = Provider.createEmitter();
const store = RpcRequest.createStore();

export const provider = Provider.from({
  ...emitter,
  async request(args) {
    return await frameHost.ethProviderRequest(
      // @ts-expect-error - from ox examples but our FetchFn needs better typing
      store.prepare(args),
    );
  },
});

export type ProviderType = typeof provider;

document.addEventListener("FarcasterFrameEvent", (event) => {
  if (event instanceof MessageEvent) {
    // TODO narrow to EventMap types and emit
    // emitter.emit(event.type as (keyof Provider.EventMap), event.data);
  }
});
