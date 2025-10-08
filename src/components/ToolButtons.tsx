import React from 'react';
import { FaEraser, FaPencilAlt, FaFill } from 'react-icons/fa';

interface ToolButtonsProps {
  selectedTool: 'brush' | 'eraser' | 'fill';
  onToolSelect: (tool: 'brush' | 'eraser' | 'fill') => void;
}

const ToolButtons: React.FC<ToolButtonsProps> = ({ selectedTool, onToolSelect }) => {
  return (
    <div className="tool-buttons">
      <button
        className={`tool-button ${selectedTool === 'eraser' ? 'selected' : ''}`}
        onClick={() => onToolSelect('eraser')}
      >
        <FaEraser />
      </button>
      <button
        className={`tool-button ${selectedTool === 'brush' ? 'selected' : ''}`}
        onClick={() => onToolSelect('brush')}
      >
        <FaPencilAlt />
      </button>
      <button
        className={`tool-button ${selectedTool === 'fill' ? 'selected' : ''}`}
        onClick={() => onToolSelect('fill')}
      >
        <FaFill />
      </button>
    </div>
  );
};

export default ToolButtons;