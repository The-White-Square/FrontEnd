import { useRef, useCallback } from 'react';
import BackgroundLayers from './components/BackgroundLayers';
import FloatingControls from './components/FloatingControls';
import ColorPalette from './components/ColorPalette';
import ToolButtons from './components/ToolButtons';
import BrushSizeSlider from './components/BrushSizeSlider';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import { useDrawingState } from './hooks/useDrawingState';
import { useLobbyName } from './hooks/useLobbyName';
import DrawingCanvas from './components/DrawingCanvas';
import './styles/DrawingPage.css';

const DrawingPage = () => {
  const lobbyId = sessionStorage.getItem('lobbyId') || '';
  const { name: username } = useLobbyName('');

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
  } = useDrawingState(lobbyId, username);

  // Keep placeholder callback to satisfy previous hook expectations
  const handleSaveState = useCallback(() => {}, []);

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
            <div className="canvas-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* Streamable drawing canvas for Artist */}
              <DrawingCanvas
                lobbyId={lobbyId}
                role="Artist"
                width={700}
                height={700}
                strokeColor={selectedColor}
                strokeWidth={brushSize}
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
            {/* Removed DrawingControls since undo/redo not available on stream canvas */}
          </div>
        </div>
      </div>
    </BackgroundLayers>
  );
};

export default DrawingPage;