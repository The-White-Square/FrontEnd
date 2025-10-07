import React, { useState } from "react"; 

// Define the ExpandButton component with style and children props
function ExpandButton({ 
  style, 
  children, 
  onClick,
  className 
}: { 
  style: React.CSSProperties, 
  children: React.ReactNode,
  onClick?: () => void,
  className?: string
}) {
  const [hover, setHover] = useState(false); 
  const [active, setActive] = useState(false);

  return (
    <button
      className={className}
      style={{
        ...style, 
        // Apply transform based on hover/active state for animation
        transform: active
          ? "scale(0.97) translateY(2px)" // Slightly shrink and move down when pressed
          : hover
          ? "scale(1.05)" // Slightly enlarge when hovered
          : "scale(1)", // Default size when not hovered or pressed
        transition: "transform 0.1s", // Smooth transition for transform changes
      }}
      onMouseEnter={() => setHover(true)} 
      onMouseLeave={() => {
        setHover(false);
        setActive(false);
      }}
      onMouseDown={() => setActive(true)} 
      onMouseUp={() => setActive(false)}
      onMouseOut={() => setActive(false)}
      onClick={onClick}
    >
      {children} {/* Render any child elements inside the button */}
    </button>
  );
}

export default ExpandButton; // Export the ExpandButton component for use in other files