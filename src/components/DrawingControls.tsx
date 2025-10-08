import React from 'react';
import { FaUndo, FaRedo } from 'react-icons/fa';

interface DrawingControlsProps {
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
}

const DrawingControls: React.FC<DrawingControlsProps> = ({ onUndo, onRedo, onClear }) => {
  return (
    <>
      {/* Undo/Redo controls */}
      <div className="drawing-controls">
        <button className="control-button" onClick={onUndo}>
          <FaUndo />
        </button>
        <button className="control-button" onClick={onRedo}>
          <FaRedo />
        </button>
      </div>
      
      {/* Clear canvas control */}
      <div className="canvas-controls">
        <button className="clear-button" onClick={onClear}>
          Clear
        </button>
      </div>
    </>
  );
};

export default DrawingControls;