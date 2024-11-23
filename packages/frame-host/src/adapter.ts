import * as Comlink from "comlink";
import { RefObject, useCallback, useEffect, useRef } from "react";
import WebView, { WebViewMessageEvent, WebViewProps } from "react-native-webview";
import { WebViewEndpoint, createWebViewRpcEndpoint } from "./endpoint";
import type { FrameHost } from "@farcaster/frame-core";

/**
 * Returns a handler of RPC message from WebView.
 */
export function useWebViewRpcAdapter(webViewRef: RefObject<WebView>, sdk: FrameHost) {
  const endpointRef = useRef<
    WebViewEndpoint & {
      emit: (data: any) => void;
    }
  >();

  const onMessage: WebViewProps["onMessage"] = useCallback(
    (e: WebViewMessageEvent) => {
      endpointRef.current?.onMessage(e);
    },
    [endpointRef],
  );

  useEffect(() => {
    const endpoint = createWebViewRpcEndpoint(webViewRef);
    endpointRef.current = endpoint;

    Comlink.expose(sdk, endpoint);

    return () => {
      endpointRef.current = undefined;
    };
  }, [webViewRef, sdk]);

  return {
    onMessage,
    emit: endpointRef.current?.emit,
  };
}
