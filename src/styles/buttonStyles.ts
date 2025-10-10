/**
 * Button Styles
 * 
 * Reusable button styles for consistent appearance across the application.
 * These styles use viewport units for responsive design and maintain
 * the game's orange/red color theme.
 */

import type { CSSProperties } from 'react';

/**
 * Floating icon buttons (settings, sound controls)
 * 
 * Small circular buttons that appear in the top-left corner.
 * Uses viewport units for responsive sizing with min/max constraints.
 */
export const floatingIconButtonStyle: CSSProperties = {
  // Responsive sizing based on viewport width
  width: "4vw",
  height: "4vw",
  
  // Constraints to ensure usability on all screen sizes
  minWidth: "38px",    // Minimum size for touch targets
  minHeight: "38px",
  maxWidth: "56px",    // Maximum size to prevent oversizing on large screens
  maxHeight: "56px",
  
  // Appearance
  borderRadius: "20px",           // Rounded corners
  background: "#bb4010ff",        // Dark orange background
  border: "none",                 // No border
  
  // Layout
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  
  // Effects
  boxShadow: "0 2px 16px #0000005e",  // Subtle shadow for depth
  cursor: "pointer",                   // Hand cursor on hover
  outline: "none",                     // Remove focus outline
  padding: 0,                          // No internal padding
};

/**
 * Main action buttons (Create Room, Join Room)
 * 
 * Large prominent buttons for primary actions on the home page.
 * Features gradient background and responsive sizing.
 */
export const mainActionButtonStyle: CSSProperties = {
  // Gradient background from red to orange
  background: "linear-gradient(180deg, #FF4242B3, #FF8800B3)",
  color: "#790000",                    // Dark red text
  
  // Typography
  fontFamily: "'Jersey 25', sans-serif",  // Game font
  fontWeight: 500,                        // Medium weight
  fontSize: "2vw",                        // Responsive font size
  
  // Responsive height
  height: "3.5vw",
  minHeight: "48px",        // Minimum for accessibility
  maxHeight: "70px",        // Maximum to prevent oversizing
  
  // Border and shape
  border: "4px solid #F85F5F",  // Light red border
  borderRadius: "16px",         // Rounded corners
  
  // Effects
  boxShadow: "0 4px 24px 0 #E6000077",         // Red shadow glow
  cursor: "pointer",                           // Hand cursor
  transition: "transform 0.1s, box-shadow 0.1s", // Smooth hover animations
  
  // Responsive width
  minWidth: "180px",        // Minimum readable width
  maxWidth: "320px",        // Maximum width
  width: "28vw",           // Responsive width
  whiteSpace: "nowrap" as const, // Prevent text wrapping
};

/**
 * Choose Avatar button style
 * 
 * Wider variant of the main action button for the avatar selection.
 * Uses inverted gradient and larger dimensions.
 */
export const chooseAvatarButtonStyle: CSSProperties = {
  ...mainActionButtonStyle,  // Inherit base button styles
  
  // Inverted gradient for visual distinction
  background: "linear-gradient(360deg, #FF4242B3, #FF8800B3)",
  
  // Wider dimensions for prominence
  minWidth: "240px",
  maxWidth: "675px",
  width: "60vw",          // Wider than main buttons
  
  // Additional spacing
  marginTop: "0.5vw",
};