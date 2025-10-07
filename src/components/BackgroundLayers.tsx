import patternBg from '../assets/pattern.png';

interface BackgroundLayersProps {
  children: React.ReactNode;
}

export default function BackgroundLayers({ children }: BackgroundLayersProps) {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        minHeight: "100vh",
        minWidth: "100vw",
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(180deg, #E60000 0%, #FD7600 30%, #FD7600 70%, #E60000 100%)",
      }}
    >
      {/* Black overlay for darkening the gradient */}
      <div
        style={{
          position: "absolute",
          width: "100vw",
          height: "100vh",
          background: "#000000ab",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      {/* Patterned background container */}
      <div
        className="pattern-bg-container"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "95vw",
          maxWidth: "1850px",
          height: "90vh",
          maxHeight: "920px",
          transform: "translate(-50%, -50%)",
          borderRadius: "48px",
          overflow: "hidden",
          zIndex: 1,
          background: "transparent",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 8px 48px 0 #00000055",
        }}
      >
        {/* Pattern background using pattern.png */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            borderRadius: "48px",
            pointerEvents: "none",
            zIndex: 1,
            backgroundImage: `url(${patternBg})`,
            backgroundRepeat: "repeat",
            backgroundSize: "auto"
          }}
        />
        
        {children}
      </div>
    </div>
  );
}