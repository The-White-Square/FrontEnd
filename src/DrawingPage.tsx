import { useRef, useCallback, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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
import { useLobbyName } from './hooks/useLobbyName';
import { useAvatarCarousel } from './hooks/useAvatarCarousel';
import './styles/DrawingPage.css';

type NavState = {
  lobbyId?: string;
  name?: string;
  iconId?: number;
};

const DrawingPage = () => {
  const canvasRef = useRef<CanvasRef>(null);
  const location = useLocation();
  const state = (location as any)?.state ?? {} as NavState;

  const lobbyId = state.lobbyId || sessionStorage.getItem('lobbyId') || '';
  const { name: username } = useLobbyName('');

  const [iconId, setIconId] = useState(state.iconId ?? 1);
  useAvatarCarousel(setIconId, state.iconId ?? null);

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
  } = useDrawingState(lobbyId, username, iconId);

  const handleSaveState = useCallback(() => {
    // Canvas state save is handled by Canvas component
  }, []);

  const handleUndo = () => canvasRef.current?.undo();
  const handleRedo = () => canvasRef.current?.redo();
  const handleClear = () => canvasRef.current?.clear();
  
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