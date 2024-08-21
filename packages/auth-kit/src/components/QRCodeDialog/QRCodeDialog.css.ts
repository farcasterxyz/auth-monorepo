import { style } from "@vanilla-extract/css";

export const body = style({
  backgroundColor: "white",
  fontFamily: "Inter, sans-serif",
  letterSpacing: "-0.09px",
  borderRadius: 12,
  maxWidth: 405,
  position: "relative",
  padding: 16,
});

export const siwfHeading = style({
  lineHeight: "32px",
  fontSize: 24,
  fontWeight: 600,
  marginBottom: 8,
});

export const instructions = style({
  fontSize: 15,
  lineHeight: "20px",
  color: "rgba(0, 0, 0, 0.5)",
});

export const signUp = style({
  textDecoration: "none",
  color: "#7C65C1",
});

export const createAccount = style({
  marginTop: 8,
  fontSize: 15.5,
  color: "rgba(0, 0, 0, 0.5)",
});

export const qrCodeImage = style({
  display: "flex",
  justifyContent: "center",
  marginTop: 16,
  marginBottom: 16,
  borderColor: "rgba(229, 231, 235, 0.333)",
  padding: 16,
  backgroundColor: "white",
  borderWidth: 1,
  borderStyle: "solid",
  borderRadius: 12,
});
