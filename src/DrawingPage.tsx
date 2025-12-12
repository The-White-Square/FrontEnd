import { useRef, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import lobbyHub from './services/lobbyHub';

const ROUND_SECONDS = 300; // 5 minutes
const roundKeyFor = (lobbyId: string) => `roundEnd:${lobbyId || 'global'}`;

function ensureRoundEndTimestamp(lobbyId: string): number {
  const key = roundKeyFor(lobbyId);
  const now = Date.now();
  const existing = localStorage.getItem(key);
  if (existing) {
    const ts = parseInt(existing, 10);
    if (!isNaN(ts) && ts > now) return ts;
  }
  const newTs = now + ROUND_SECONDS * 1000;
  localStorage.setItem(key, newTs.toString());
  return newTs;
}

const DrawingPage = () => {
  // Reference to canvas component for direct method calls
  const canvasRef = useRef<CanvasRef>(null);
  const navigate = useNavigate();

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
  useEffect(() => {
    // Ensure this client listens for the server "GoToFinal" broadcast and
    // also ensure the connection is started and the client is added to the lobby group.
    let mounted = true;

    (async () => {
      try {
        // Register explicit handler (preferred) so hub will call this when server broadcasts.
        lobbyHub.onGoToFinalHandler(() => {
          if (!mounted) return;
          try { navigate('/final'); } catch { /* ignore */ }
        });

        // Start connection and ensure we join the lobby so server will include us in group messages.
        await lobbyHub.start();
        if (lobbyId) {
          try {
            await lobbyHub.addPlayerToLobby(lobbyId, username);
          } catch (err) {
            console.warn('[drawing] addPlayerToLobby failed', err);
          }
        }
      } catch (err) {
        console.warn('[drawing] lobbyHub start/register failed', err);
      }
    })();

    return () => { mounted = false; };
  }, [navigate, lobbyId, username]);

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

  const scale = 0.7;
  const scaledStyle: React.CSSProperties = {
    transform: `scale(${scale})`,
    transformOrigin: 'top center',
    // Prevent scaled element from collapsing in height/width layout:
    width: `${100 / scale}%`,
    // push the scaled layout down so it sits below the floating controls
    marginTop: '260px',
  };

  // Shared timer using localStorage round end timestamp
  const [secondsLeft, setSecondsLeft] = useState<number>(() => {
    const ts = ensureRoundEndTimestamp(lobbyId);
    return Math.max(0, Math.ceil((ts - Date.now()) / 1000));
  });

  useEffect(() => {
    // When lobby changes ensure there's an end timestamp (and update displayed value)
    const ts = ensureRoundEndTimestamp(lobbyId);
    setSecondsLeft(Math.max(0, Math.ceil((ts - Date.now()) / 1000)));

    const key = roundKeyFor(lobbyId);

    const tick = () => {
      const stored = localStorage.getItem(key);
      const end = stored ? parseInt(stored, 10) : ensureRoundEndTimestamp(lobbyId);
      const left = Math.max(0, Math.ceil((end - Date.now()) / 1000));
      setSecondsLeft(left);
    };

    const intervalId = window.setInterval(() => {
      tick();
      const stored = localStorage.getItem(key);
      const end = stored ? parseInt(stored, 10) : 0;
      if (end <= Date.now()) window.clearInterval(intervalId);
    }, 250);

    // React to changes made in other tabs/windows
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) tick();
    };
    window.addEventListener('storage', onStorage);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('storage', onStorage);
    };
  }, [lobbyId]);

  const formatTime = (s: number) => {
    const minutes = Math.floor(s / 60).toString().padStart(2, '0');
    const seconds = (s % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
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
            <div
              className="round-timer"
              aria-live="polite"
              style={{
                fontFamily: 'monospace',
                background: '#fff8f0',
                border: '2px solid #8B4513',
                borderRadius: 10,
                padding: '8px 14px',
                marginRight: 12,
                minWidth: 110,
                textAlign: 'center',
                color: '#8B4513',
                fontWeight: 700,
                fontSize: 28,
                lineHeight: 1,
              }}
            >
              {formatTime(secondsLeft)}
            </div>

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