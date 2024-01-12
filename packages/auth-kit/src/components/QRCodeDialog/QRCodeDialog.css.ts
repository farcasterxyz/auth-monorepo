import { style } from "@vanilla-extract/css";

export const body = style({
  backgroundColor: "white",
  fontFamily: "sans-serif",
  borderRadius: 12,
  maxWidth: 360,
  position: "relative",
  paddingTop: 32,
  paddingLeft: 32,
  paddingRight: 32,
  paddingBottom: 20,
});

export const siwfHeading = style({
  fontSize: 22,
  fontWeight: 600,
  marginBottom: 6,
});

export const instructions = style({
  fontSize: 15.5,
  color: "rgba(0, 0, 0, 0.5)",
});

export const qrCodeImage = style({
  maxWidth: 480,
  width: "100%",
});
