/**
 * Background Layers Component
 * 
 * Creates the visual background for the Co-opy game interface.
 * Features multiple layers including gradient background, dark overlay,
 * and patterned container that frames the main content.
 */

// Path to the repeating pattern image
const patternBg = '/pattern.png';

interface BackgroundLayersProps {
  children: React.ReactNode; // Content to be rendered inside the background
}

/**
 * Multi-layer background component
 * 
 * Creates a visually appealing background with:
 * - Full viewport gradient background (red to orange)
 * - Dark overlay to reduce brightness
 * - Centered container with pattern texture
 * - Responsive sizing with maximum dimensions
 * 
 * @param children - React nodes to render within the patterned container
 */
export default function BackgroundLayers({ children }: BackgroundLayersProps) {
  return (
    // Main background container - full viewport
    <div
      style={{
        width: "100vw",
        height: "100vh",
        minHeight: "100vh",
        minWidth: "100vw",
        position: "relative",
        overflow: "hidden",
        // Red to orange gradient background
        background: "linear-gradient(180deg, #E60000 0%, #FD7600 30%, #FD7600 70%, #E60000 100%)",
      }}
    >
      {/* Semi-transparent dark overlay to soften the gradient */}
      <div
        style={{
          position: "absolute",
          width: "100vw",
          height: "100vh",
          background: "#000000ab",  // Semi-transparent black
          zIndex: 0,
          pointerEvents: "none",   // Don't block interactions
        }}
      />

      {/* Main content container with pattern background */}
      <div
        className="pattern-bg-container"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          
          // Responsive dimensions - 95% of viewport with max limits
          width: "95vw",
          maxWidth: "1850px",
          height: "90vh",
          maxHeight: "920px",
          
          // Center the container
          transform: "translate(-50%, -50%)",
          
          // Rounded corners and styling
          borderRadius: "48px",
          overflow: "hidden",
          zIndex: 1,
          background: "transparent",
          
          // Flexbox for centering content
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          
          // Subtle shadow for depth
          boxShadow: "0 8px 48px 0 #00000055",
        }}
      >
        {/* Pattern texture overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            borderRadius: "48px",
            pointerEvents: "none",        // Don't block interactions
            zIndex: 1,
            backgroundImage: `url(${patternBg})`, // Repeating pattern
            backgroundRepeat: "repeat",
            backgroundSize: "auto"
          }}
        />
        
        {/* Render child content above the pattern */}
        {children}
      </div>
    </div>
  );
}