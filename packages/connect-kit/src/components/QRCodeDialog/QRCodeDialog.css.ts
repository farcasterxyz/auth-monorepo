import { style } from "@vanilla-extract/css";

export const body = style({
  backgroundColor: "white",
  fontFamily: "sans-serif",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  padding: 16,
  borderRadius: 12,
  maxWidth: 360,
  "@media": {
    "(min-width: 640px)": {
      padding: 24,
    },
  },
});

export const siwfHeading = style({
  fontSize: 20,
  fontWeight: "bold",
  marginBottom: 9,
});

export const qrCodeImage = style({
  maxWidth: 480,
  width: "100%",
});
