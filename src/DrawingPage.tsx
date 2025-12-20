import { useRef, useCallback, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();

  // Get navigation state including players
  const state = location.state as {
    lobbyId?: string;
    name?: string;
    iconId?: number;
    players?: Array<{ id?: string; displayName: string; iconId?: number }>;
  };

  const lobbyId = state?.lobbyId || sessionStorage.getItem('lobbyId') || '';
  const { name: username } = useLobbyName('');

  // Log the players received from navigation
  useEffect(() => {
    console.log('[DrawingPage] Navigation state:', state);
    console.log('[DrawingPage] Players from navigation:', state?.players);
  }, [state]);

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
  } = useDrawingState(lobbyId, username, state?.players);

  // Log players after initialization
  useEffect(() => {
    console.log('[DrawingPage] Players in state:', players);
  }, [players]);

  // IMPORTANT: listen for GoToFinal and ensure we join the lobby group after refresh
  useEffect(() => {
    let mounted = true;

    // Navigate when server broadcasts GoToFinal
    lobbyHub.onGoToFinalHandler(() => {
      if (!mounted) return;
      try { navigate('/final'); } catch { /* ignore */ }
    });

    (async () => {
      try {
        await lobbyHub.start();
        if (lobbyId) {
          const iconId = state?.iconId || parseInt(sessionStorage.getItem('avatarId') || '1', 10);
          // Force re-join updates connectionId after reload so this client is in the SignalR group
          await lobbyHub.addPlayerToLobby(lobbyId, username, iconId, { force: true });
        }
      } catch (err) {
        console.warn('[drawing] hub start/join failed', err);
      }
    })();

    return () => { mounted = false; };
  }, [navigate, lobbyId, username, state?.iconId]);

  const handleSaveState = useCallback(() => { /* no-op */ }, []);

  // STREAM undo/redo via server (so both clients update)
  const handleUndo = async () => {
    if (!lobbyId) return;
    try { await lobbyHub.undoLast(lobbyId); } catch { /* ignore */ }
  };
  const handleRedo = async () => {
    if (!lobbyId) return;
    try { await lobbyHub.redoLast(lobbyId); } catch { /* ignore */ }
  };

  // Clear can stay as is (Canvas.clear() already calls hub ClearCanvas)
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
        <FloatingControls />
        <div className="drawing-page">
          <div className="game-container" style={scaledStyle}>
            <div className="main-content">
              <div className="chat-sidebar">
                <ChatWindow messages={chatMessages} players={players} />
              </div>

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