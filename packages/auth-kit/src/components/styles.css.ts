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

export const button = {
  ...reset.button,
  paddingLeft: 21,
  paddingRight: 21,
  paddingTop: 13,
  paddingBottom: 13,
  borderRadius: 8,
  fontSize: 18,
  fontWeight: 600,
  display: "flex",
  alignItems: "center",
};

export const resetButton = style({
  ...button,
  backgroundColor: "transparent",
});

export const primaryButton = style({
  ...button,
  backgroundColor: "#7C65C1",
  color: "white",
});

export const secondaryButton = style({
  ...button,
  backgroundColor: "rgba(0, 0, 0, 0.03)",
  borderColor: "rgba(210, 210, 210, 1)",
  borderWidth: "1px solid",
  color: "black",
});

export const tertiaryButton = style({
  ...button,
  backgroundColor: "transparent",
  color: "#7C65C1",
});

export const qrCodeContainer = style({
  borderColor: "rgba(229, 231, 235, 0.333)",
  padding: 24,
  backgroundColor: "white",
  borderWidth: 1,
  borderStyle: "solid",
  borderRadius: 12,
});

export const qrCodeWrapper = style({
  userSelect: "none",
});

export const qrCode = style({
  position: "relative",
  display: "flex",
  height: 0,
  justifyContent: "center",
});
