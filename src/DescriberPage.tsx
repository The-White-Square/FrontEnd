import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BackgroundLayers from './components/BackgroundLayers';
import FloatingControls from './components/FloatingControls';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import { useDrawingState } from './hooks/useDrawingState';
import * as api from './services/lobbyApi';
import lobbyHub from './services/lobbyHub';
import './styles/DrawingPage.css';
import {useLobbyName} from "./hooks/useLobbyName";
import { Stage, Layer, Line, Rect } from 'react-konva';

const API_URL = (import.meta.env.VITE_API_URL as string) ?? 'https://localhost:7179';
const FRAME_SIZE = 700;
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

export default function DescriberPage() {
  const lobbyId = sessionStorage.getItem('lobbyId') || '';
  const { name: username } = useLobbyName('');
  const navigate = useNavigate();

  const {
    chatMessages,
    chatInput,
    setChatInput,
    sendMessage,
    players,
  } = useDrawingState(lobbyId, username);

  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // live preview state
  const [strokes, setStrokes] = useState<Array<{ id: string; color: string; width: number; tool: string; points: number[] }>>([]);

  const toAbsoluteUrl = useCallback((url: string) => {
    if (!url) return null;
    if (/^https?:\/\//i.test(url)) return url;
    return API_URL + url;
  }, []);

  useEffect(() => {
    let mounted = true;

    const handleReceiveImage = (img: string) => {
      const abs = toAbsoluteUrl(img);
      if (mounted) setImageUrl(abs);
    };

    const init = async () => {
      try { await lobbyHub.start(); } catch { /* ignore */ }
      lobbyHub.onReceiveImageHandler(handleReceiveImage);

      // GoToFinal navigation
      lobbyHub.onGoToFinalHandler(() => { try { navigate('/final'); } catch { } });

      // drawing preview handlers
      lobbyHub.onStrokeStartedHandler((strokeId, color, width, tool) => {
        setStrokes(prev => prev.concat({ id: strokeId, color, width, tool, points: [] }));
      });
      lobbyHub.onStrokePointsHandler((strokeId, pts) => {
        setStrokes(prev => prev.map(s => {
          if (s.id !== strokeId) return s;
          const incoming = pts.flatMap(p => [p.x, p.y]);
          // duplicate first point for round start cap if this is the first batch
          if (s.points.length === 0 && incoming.length >= 2) {
            const startX = incoming[0];
            const startY = incoming[1];
            return { ...s, points: [startX, startY, startX, startY, ...incoming] };
          }
          return { ...s, points: s.points.concat(incoming) };
        }));
      });
      lobbyHub.onStrokeEndedHandler((strokeId) => {
        // duplicate end point to preserve round end cap
        setStrokes(prev => prev.map(s => {
          if (s.id !== strokeId) return s;
          const pts = s.points;
          if (pts.length >= 2) {
            const endX = pts[pts.length - 2];
            const endY = pts[pts.length - 1];
            return { ...s, points: pts.concat([endX, endY]) };
          }
          return s;
        }));
      });
      lobbyHub.onCanvasClearedHandler(() => {
        setStrokes([]);
      });

      if (lobbyId) {
        try {
          const dto = await api.getLobbyImage(lobbyId);
          if (dto?.url) {
            const abs = toAbsoluteUrl(dto.url);
            if (mounted) setImageUrl(abs);
          }
        } catch { }
      }
    };

    init();
    return () => { mounted = false; };
  }, [lobbyId, toAbsoluteUrl, navigate]);

  const scale = 0.7;
  const scaledStyle: React.CSSProperties = useMemo(() => ({
    transform: `scale(${scale})`,
    transformOrigin: 'top center',
    width: `${100 / scale}%`,
    marginTop: '260px',
  }), [scale]);

  // Square frame style (restore full border and full rounding)
  const frameBoxStyle: React.CSSProperties = {
    background: 'white',
    borderRadius: 20,
    border: '4px solid #8B4513',
    boxShadow: '0 8px 25px rgba(139, 69, 19, 0.3)',
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    overflow: 'hidden',
    position: 'relative',
  };

  // Shared timer using localStorage round end timestamp
  const [secondsLeft, setSecondsLeft] = useState<number>(() => {
    const ts = ensureRoundEndTimestamp(lobbyId);
    return Math.max(0, Math.ceil((ts - Date.now()) / 1000));
  });

  // Ensure we only trigger finish once when timer hits zero
  const finishTriggeredRef = useRef<boolean>(false);

  useEffect(() => {
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

    const onStorage = (e: StorageEvent) => {
      if (e.key === key) tick();
    };
    window.addEventListener('storage', onStorage);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('storage', onStorage);
    };
  }, [lobbyId]);

  // When the timer reaches zero, trigger server broadcast to move everyone to final page.
  useEffect(() => {
    if (secondsLeft !== 0 || finishTriggeredRef.current) return;
    finishTriggeredRef.current = true;
    if (!lobbyId) {
      try { navigate('/final'); } catch { }
      return;
    }
    (async () => {
      try {
        await lobbyHub.start();
        await lobbyHub.goToFinal(lobbyId);
      } catch (err) {
        try { navigate('/final'); } catch { }
      }
    })();
  }, [secondsLeft, lobbyId, navigate]);

  const formatTime = (s: number) => {
    const minutes = Math.floor(s / 60).toString().padStart(2, '0');
    const seconds = (s % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const handleFinishClick = async () => {
    if (!lobbyId) {
      try { navigate('/final'); } catch { }
      return;
    }

    try {
      await lobbyHub.start();
      await lobbyHub.goToFinal(lobbyId);
    } catch {
      navigate('/final');
    }
  };

  return (
    <BackgroundLayers>
      <FloatingControls />
      <div className="drawing-page">
        <div className="game-container" style={scaledStyle}>
          <div className="main-content" style={{ alignItems: 'flex-start' }}>
            <div className="chat-sidebar">
              <ChatWindow messages={chatMessages} players={players} />
            </div>

            <div className="canvas-container" style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
              <div className="frame-stack" style={{ width: FRAME_SIZE }}>
                <div className="frame-label frame-label--abs">Live Preview</div>
                <div style={frameBoxStyle}>
                  <Stage width={FRAME_SIZE} height={FRAME_SIZE}>
                    <Layer>
                      <Rect x={0} y={0} width={FRAME_SIZE} height={FRAME_SIZE} fill={'#FFFFFF'} />
                      {strokes.map(s => (
                        <Line
                          key={s.id}
                          points={s.points}
                          stroke={s.tool === 'eraser' ? '#FFFFFF' : s.color}
                          strokeWidth={s.width}
                          tension={0}
                          lineCap={'round'}
                          lineJoin={'round'}
                          globalCompositeOperation={s.tool === 'eraser' ? 'destination-out' : 'source-over'}
                        />
                      ))}
                    </Layer>
                  </Stage>
                </div>
              </div>

              <div className="frame-stack" style={{ width: FRAME_SIZE }}>
                <div className="frame-label frame-label--abs">Original</div>
                <div style={frameBoxStyle}>
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="Target"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  ) : (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B4513', fontSize: 24, background: '#fff' }}>
                      Waiting for image...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bottom-controls" style={{ justifyContent: 'flex-start', alignItems: 'center' }}>
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

            <ChatInput
              value={chatInput}
              onChange={setChatInput}
              onSend={sendMessage}
            />

            <button
              id="finish-button"
              onClick={handleFinishClick}
              style={{
                marginLeft: 12,
                background: '#FF6B2B',
                color: '#fff8f0',
                border: '3px solid #8B4513',
                borderRadius: 12,
                padding: '10px 18px',
                fontWeight: 700,
                fontSize: 18,
                cursor: 'pointer'
              }}
            >
              Finish
            </button>
          </div>
        </div>
      </div>
    </BackgroundLayers>
  );
}