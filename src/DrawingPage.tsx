import React, { useRef, useCallback } from 'react';
import BackgroundLayers from './components/BackgroundLayers';
import FloatingControls from './components/FloatingControls';
import Canvas, { type CanvasRef } from './components/Canvas';
import ColorPalette from './components/ColorPalette';
import ToolButtons from './components/ToolButtons';
import BrushSizeSlider from './components/BrushSizeSlider';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import DrawingControls from './components/DrawingControls';
import { useDrawingState } from './hooks/useDrawingState';
import './styles/DrawingPage.css';

const DrawingPage: React.FC = () => {
  // Canvas reference
  const canvasRef = useRef<CanvasRef>(null);
  
  // Drawing state
  const {
    selectedColor,
    setSelectedColor,
    brushSize,
    setBrushSize,
    selectedTool,
    setSelectedTool,
    colors,
    chatMessages,
    chatInput,
    setChatInput,
    sendMessage,
    players,
    isSmallScreen,
  } = useDrawingState();

  // Canvas save state callback
  const handleSaveState = useCallback(() => {
    // This function is called when the canvas state should be saved
    // The actual implementation is handled by the Canvas component
  }, []);

  // Canvas controls
  const handleUndo = () => canvasRef.current?.undo();
  const handleRedo = () => canvasRef.current?.redo();
  const handleClear = () => canvasRef.current?.clear();
  
  return (
    <BackgroundLayers>
      <FloatingControls />
      <div className="drawing-page">
        <div className="game-container">
          <div className="main-content">
            {/* Left Sidebar - Chat */}
            <div className="chat-sidebar">
              <ChatWindow messages={chatMessages} players={players} />
            </div>
            
            {/* Main Canvas Area */}
            <div className="canvas-container">
              <Canvas
                ref={canvasRef}
                selectedColor={selectedColor}
                brushSize={brushSize}
                selectedTool={selectedTool}
                onSaveState={handleSaveState}
              />
            </div>
            
            {/* Right Sidebar - Tools */}
            <div className="tools-sidebar">
              {/* Color selection palette */}
              <ColorPalette
                colors={colors}
                selectedColor={selectedColor}
                onColorSelect={setSelectedColor}
              />
              {/* Drawing tool buttons */}
              <ToolButtons
                selectedTool={selectedTool}
                onToolSelect={setSelectedTool}
              />
            </div>
            
            {/* Brush Size Slider */}
            <BrushSizeSlider
              brushSize={brushSize}
              onBrushSizeChange={setBrushSize}
              isSmallScreen={isSmallScreen}
            />
          </div>
          
          {/* Bottom Controls */}
          <div className="bottom-controls">
            {/* Chat message input */}
            <ChatInput
              value={chatInput}
              onChange={setChatInput}
              onSend={sendMessage}
            />
            {/* Canvas control buttons */}
            <DrawingControls
              onUndo={handleUndo}
              onRedo={handleRedo}
              onClear={handleClear}
            />
          </div>
        </div>
      </div>
    </BackgroundLayers>
  );
};

export default DrawingPage;