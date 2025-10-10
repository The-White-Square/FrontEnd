interface BrushSizeSliderProps {
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
  isSmallScreen: boolean;
}

const BrushSizeSlider = ({ 
  brushSize, 
  onBrushSizeChange, 
  isSmallScreen 
}: BrushSizeSliderProps) => {
  // Handle clicking on slider track
  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    let percentage: number;
    
    if (isSmallScreen) {
      const x = e.clientX - rect.left;
      percentage = Math.max(0, Math.min(1, x / rect.width));
    } else {
      const y = e.clientY - rect.top;
      percentage = Math.max(0, Math.min(1, y / rect.height));
    }
    
    const newSize = Math.round(1 + percentage * 59);
    onBrushSizeChange(newSize);
  };

  // Handle dragging slider thumb
  const handleThumbMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const track = e.currentTarget.parentElement as HTMLElement;
    if (!track) return;
    
    const trackRect = track.getBoundingClientRect();
    let animationId: number;
    
    const handleMouseMove = (event: MouseEvent) => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      
      animationId = requestAnimationFrame(() => {
        let percentage: number;
        
        if (isSmallScreen) {
          const x = event.clientX - trackRect.left;
          percentage = Math.max(0, Math.min(1, x / trackRect.width));
        } else {
          const y = event.clientY - trackRect.top;
          percentage = Math.max(0, Math.min(1, y / trackRect.height));
        }
        
        const newSize = Math.round(1 + percentage * 59);
        onBrushSizeChange(newSize);
      });
    };
    
    const handleMouseUp = () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
    
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'grabbing';
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Calculate thumb position based on brush size
  const thumbStyle = isSmallScreen ? {
    left: `${((brushSize - 1) / 59) * 100}%`,
    top: '50%'
  } : {
    top: `${((brushSize - 1) / 59) * 100}%`,
    left: '50%'
  };

  return (
    <div className="brush-size-container">
      <div 
        className="brush-size-track"
        onClick={handleTrackClick}
      >
        <div 
          className="brush-size-thumb"
          style={thumbStyle}
          onMouseDown={handleThumbMouseDown}
        />
      </div>
    </div>
  );
};

export default BrushSizeSlider;