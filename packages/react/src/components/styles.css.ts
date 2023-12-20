import { style } from "@vanilla-extract/css";

const resetBase = {
  border: 0,
  borderColor: "#f1f1f1",
  borderStyle: "solid",
  borderWidth: 0,
  boxSizing: "border-box",
  fontSize: "100%",
  margin: 0,
  padding: 0,
  verticalAlign: "baseline",
  WebkitFontSmoothing: "antialiased",
  WebkitTapHighlightColor: "transparent",
} as const;

const reset = {
  button: {
    ...resetBase,
    appearance: "none",
    background: "none",
    border: "none",
    cursor: "pointer",
    textAlign: "left",
  },
} as const;

export const button = style({
  ...reset.button,
  paddingLeft: 12,
  paddingRight: 12,
  paddingTop: 9,
  paddingBottom: 9,
  backgroundColor: "#855DCD",
  color: "white",
  display: "flex",
  alignItems: "center",
});
