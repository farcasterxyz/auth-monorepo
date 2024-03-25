import { style } from "@vanilla-extract/css";

export const debugPanel = style({
  zIndex: 10,
  position: "fixed",
  backgroundColor: "white",
  padding: 24,
  left: 9,
  bottom: 9,
  boxShadow: "0 0 6px rgba(0, 0, 0, 0.3)",
  width: 600,
  overflow: "scroll",
});
