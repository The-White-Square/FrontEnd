import type { CSSProperties } from 'react';

// Shared styles for floating icon buttons
export const floatingIconButtonStyle: CSSProperties = {
  width: "4vw",
  height: "4vw",
  minWidth: "38px",
  minHeight: "38px",
  maxWidth: "56px",
  maxHeight: "56px",
  borderRadius: "20px",
  background: "#bb4010ff",
  border: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 2px 16px #0000005e",
  cursor: "pointer",
  outline: "none",
  padding: 0,
};

// Shared styles for main action buttons
export const mainActionButtonStyle: CSSProperties = {
  background: "linear-gradient(180deg, #FF4242B3, #FF8800B3)",
  color: "#790000",
  fontFamily: "'Jersey 25', sans-serif",
  fontWeight: 500,
  fontSize: "2vw",
  height: "3.5vw",
  minHeight: "48px",
  maxHeight: "70px",
  border: "4px solid #F85F5F",
  borderRadius: "16px",
  boxShadow: "0 4px 24px 0 #E6000077",
  cursor: "pointer",
  transition: "transform 0.1s, box-shadow 0.1s",
  minWidth: "180px",
  maxWidth: "320px",
  width: "28vw",
  whiteSpace: "nowrap" as const,
};

// Style for the wide "Choose Your Avatar" button
export const chooseAvatarButtonStyle: CSSProperties = {
  ...mainActionButtonStyle,
  background: "linear-gradient(360deg, #FF4242B3, #FF8800B3)",
  minWidth: "240px",
  maxWidth: "675px",
  width: "60vw",
  marginTop: "0.5vw",
};