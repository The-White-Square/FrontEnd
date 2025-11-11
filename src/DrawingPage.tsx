/**
 * Drawing Page Component
 * 
 * The main game interface where players draw and interact.
 * Features a canvas for drawing, chat system, tool selection,
 * and responsive layout that adapts to different screen sizes.
 */

import { useRef, useCallback } from 'react';
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

/**
 * Main drawing game interface
 * 
 * Provides a complete drawing environment with:
 * - Interactive canvas using Konva for drawing
 * - Chat system for player communication
 * - Tool selection (brush, eraser, fill)
 * - Color palette and brush size controls
 * - Undo/redo/clear functionality
 * - Responsive layout for different screen sizes
 */
const DrawingPage = () => {
  // Reference to canvas component for direct method calls
  const canvasRef = useRef<CanvasRef>(null);
  
  // All drawing game state from custom hook
  const {
    selectedColor,     // Current drawing color
    setSelectedColor,  // Function to change color
    brushSize,         // Current brush size
    setBrushSize,      // Function to change brush size
    selectedTool,      // Current tool (brush/eraser/fill)
    setSelectedTool,   // Function to change tool
    colors,            // Available color palette
    chatMessages,      // Chat message history
    chatInput,         // Current chat input text
    setChatInput,      // Function to update chat input
    sendMessage,       // Function to send chat message
    players,           // List of game players
    isSmallScreen,     // Responsive layout flag
  } = useDrawingState();

  /**
   * Canvas save state callback
   * 
   * Called when the canvas state should be saved for undo/redo.
   * The actual implementation is handled inside the Canvas component.
   */
  const handleSaveState = useCallback(() => {
    // This function is called when the canvas state should be saved
    // The actual implementation is handled by the Canvas component
  }, []);

  // Canvas control functions that call methods on the canvas component
  const handleUndo = () => canvasRef.current?.undo();   // Undo last action
  const handleRedo = () => canvasRef.current?.redo();   // Redo last undone action
  const handleClear = () => canvasRef.current?.clear(); // Clear entire canvas
  
  // Scale factor: 0.8 = 20% smaller
  const scale = 0.7;
  const scaledStyle: React.CSSProperties = {
    transform: `scale(${scale})`,
    transformOrigin: 'top center',
    // Prevent scaled element from collapsing in height/width layout:
    width: `${100 / scale}%`,
    // push the scaled layout down so it sits below the floating controls
    marginTop: '260px',
  };

  return (
    <BackgroundLayers>
      {/* Floating controls in top-left corner - NOT SCALED */}
      <FloatingControls />
      
      <div className="drawing-page">
        {/* Apply visual scale only to the game container so FloatingControls stays unchanged */}
        <div className="game-container" style={scaledStyle}>
          {/* Main content area with 3-column layout */}
          <div className="main-content">
            {/* Left Sidebar - Chat System */}
            <div className="chat-sidebar">
              <ChatWindow 
                messages={chatMessages} 
                players={players} 
              />
            </div>
            
            {/* Center - Main Canvas Area */}
            <div className="canvas-container">
              <Canvas
                ref={canvasRef}
                selectedColor={selectedColor}
                brushSize={brushSize}
                selectedTool={selectedTool}
                onSaveState={handleSaveState}
              />
            </div>
            
            {/* Right Sidebar - Drawing Tools */}
            <div className="tools-sidebar">
              {/* Color selection palette */}
              <ColorPalette
                colors={colors}
                selectedColor={selectedColor}
                onColorSelect={setSelectedColor}
              />
              
              {/* Drawing tool buttons (brush, eraser, fill) */}
              <ToolButtons
                selectedTool={selectedTool}
                onToolSelect={setSelectedTool}
              />
            </div>
            
            {/* Brush Size Control - Position varies by screen size */}
            <BrushSizeSlider
              brushSize={brushSize}
              onBrushSizeChange={setBrushSize}
              isSmallScreen={isSmallScreen}
            />
          </div>
          
          {/* Bottom Controls Row */}
          <div className="bottom-controls">
            {/* Chat message input */}
            <ChatInput
              value={chatInput}
              onChange={setChatInput}
              onSend={sendMessage}
            />
            
            {/* Canvas control buttons (undo, redo, clear) */}
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