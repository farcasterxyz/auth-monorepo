import { style } from "@vanilla-extract/css";

export const signOutButtonContainer = style({
  marginTop: "12px",
  fontWeight: "400",
  boxShadow: "0px 6px 12px 0 rgba(0,0,0,0.12)",
});

export const profileButtonContainer = style({
  display: "flex",
  alignItems: "flex-start",
});

export const profileImage = style({
  objectFit: "cover",
  width: 28,
  height: 28,
  borderRadius: 28,
});

export const profileName = style({
  marginLeft: 9,
  marginRight: 12,
});
