import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BackgroundLayers from './components/BackgroundLayers';
import FloatingControls from './components/FloatingControls';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import { useDrawingState } from './hooks/useDrawingState';
import * as api from './services/lobbyApi';
import lobbyHub from './services/lobbyHub';
import type { DrawingEvent } from './services/lobbyHub';
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

type Stroke = { id: string; color: string; width: number; tool: string; points: number[] };

// Accept both camelCase and PascalCase from the server
function buildStrokesFromEvents(events: DrawingEvent[] | any[]): Stroke[] {
  const map = new Map<string, Stroke>();
  const order: string[] = [];

  for (const e of events ?? []) {
    const type = e.type ?? e.Type;
    switch (type) {
      case 'CanvasCleared': {
        map.clear();
        order.length = 0;
        break;
      }
      case 'StrokeStarted': {
        const strokeId = e.strokeId ?? e.StrokeId;
        const color = e.color ?? e.Color;
        const width = e.width ?? e.Width;
        const tool = e.tool ?? e.Tool;
        const s: Stroke = { id: strokeId, color, width, tool, points: [] };
        map.set(strokeId, s);
        order.push(strokeId);
        break;
      }
      case 'StrokePoints': {
        const strokeId = e.strokeId ?? e.StrokeId;
        const s = map.get(strokeId);
        if (!s) break;
        const pts = (e.points ?? e.Points) as Array<{ x?: number; y?: number; X?: number; Y?: number }>;
        const flat = pts.flatMap(p => {
          const x = (p.x ?? p.X) as number;
          const y = (p.y ?? p.Y) as number;
          return [x, y];
        });
        if (s.points.length === 0 && flat.length >= 2) {
          const [sx, sy] = flat;
          s.points.push(sx, sy, sx, sy);
        }
        s.points.push(...flat);
        break;
      }
      case 'StrokeEnded': {
        const strokeId = e.strokeId ?? e.StrokeId;
        const s = map.get(strokeId);
        if (!s) break;
        const pts = s.points;
        if (pts.length >= 2) {
          const endX = pts[pts.length - 2];
          const endY = pts[pts.length - 1];
          s.points.push(endX, endY);
        }
        break;
      }
      default:
        break;
    }
  }

  return order.map(id => map.get(id)!).filter(Boolean);
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
  const [strokes, setStrokes] = useState<Stroke[]>([]);

  const toAbsoluteUrl = useCallback((url: string) => {
    if (!url) return null;
    if (/^https?:\/\//i.test(url)) return url;
    return API_URL + url;
  }, []);

  // IMPORTANT: re-add the describer to the lobby after refresh to update connectionId and join the SignalR group
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await lobbyHub.start();
        if (lobbyId) {
          // force ensures we update even if client believes it already joined
          await lobbyHub.addPlayerToLobby(lobbyId, username, 0, { force: true });
        }
      } catch { /* ignore */ }
    })();
    return () => { mounted = false; };
  }, [lobbyId, username]);

  useEffect(() => {
    let mounted = true;

    const handleReceiveImage = (img: string) => {
      const abs = toAbsoluteUrl(img);
      if (mounted) setImageUrl(abs);
    };

    const init = async () => {
      try { await lobbyHub.start(); } catch { /* ignore */ }

      lobbyHub.onReceiveImageHandler(handleReceiveImage);
      lobbyHub.onGoToFinalHandler(() => { try { navigate('/final'); } catch { } });

      // live stream handlers
      lobbyHub.onStrokeStartedHandler((strokeId, color, width, tool) => {
        setStrokes(prev => prev.concat({ id: strokeId, color, width, tool, points: [] }));
      });
      lobbyHub.onStrokePointsHandler((strokeId, pts) => {
        setStrokes(prev => prev.map(s => {
          if (s.id !== strokeId) return s;
          const incoming = pts.flatMap(p => [p.x, p.y]);
          if (s.points.length === 0 && incoming.length >= 2) {
            const [sx, sy] = incoming;
            return { ...s, points: [sx, sy, sx, sy, ...incoming] };
          }
          return { ...s, points: s.points.concat(incoming) };
        }));
      });
      lobbyHub.onStrokeEndedHandler((strokeId) => {
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
      lobbyHub.onCanvasClearedHandler(() => { setStrokes([]); });

      // authoritative reset (Undo/Redo/Clear)
      lobbyHub.onCanvasResetHandler((events: DrawingEvent[]) => {
        const built = buildStrokesFromEvents(events);
        setStrokes(built);
      });

      // Bootstrap from server on refresh / late join
      if (lobbyId) {
        try {
          const events = await lobbyHub.getDrawingEvents(lobbyId);
          const built = buildStrokesFromEvents(events);
          if (mounted) setStrokes(built);
        } catch { /* ignore */ }

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

  const [secondsLeft, setSecondsLeft] = useState<number>(() => {
    const ts = ensureRoundEndTimestamp(lobbyId);
    return Math.max(0, Math.ceil((ts - Date.now()) / 1000));
  });

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
                <div className="frame-label frame-label--abs" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Live Preview</span>
                  <span style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={async () => { if (lobbyId) { try { await lobbyHub.undoLast(lobbyId); } catch {} } }}
                      title="Undo"
                      style={{ padding: '4px 10px', borderRadius: 8, border: '2px solid #8B4513', background: '#fff8f0', color: '#8B4513', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Undo
                    </button>
                    <button
                      onClick={async () => { if (lobbyId) { try { await lobbyHub.redoLast(lobbyId); } catch {} } }}
                      title="Redo"
                      style={{ padding: '4px 10px', borderRadius: 8, border: '2px solid #8B4513', background: '#fff8f0', color: '#8B4513', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Redo
                    </button>
                  </span>
                </div>
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
                <div className="frame-label frame-label--abs">
                  Original
                </div>
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