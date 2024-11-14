import { type Endpoint, windowEndpoint } from "comlink";

const webViewEndpoint: Endpoint = {
  postMessage: (data: unknown) => {
    console.debug("[webview:req]", data);
    window.ReactNativeWebView.postMessage(JSON.stringify(data));
  },
  addEventListener: (_, listener, ...args) => {
    document.addEventListener("FarcasterFrameCallback", listener, ...args);
  },
  removeEventListener: (_, listener) => {
    document.removeEventListener("FarcasterFrameCallback", listener);
  },
};

export const endpoint = window?.ReactNativeWebView
  ? webViewEndpoint
  : // TODO fallback cleanly when not in iFrame or webview
    windowEndpoint(window?.parent ?? window);
