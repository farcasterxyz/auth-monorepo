import { wrap } from "comlink";
import { endpoint } from "./endpoint";
import { FrameHost } from "@farcaster/frame-core";

export const frameHost = wrap<FrameHost>(endpoint);
