import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BackgroundLayers from './components/BackgroundLayers';
import FloatingControls from './components/FloatingControls';
import ExpandButton from './components/ExpandButton';
import { mainActionButtonStyle } from './styles/buttonStyles';
import { useDrawingState } from './hooks/useDrawingState';
import * as api from './services/lobbyApi';
import lobbyHub from './services/lobbyHub';
import './styles/DrawingPage.css';
import { useLobbyName } from './hooks/useLobbyName';
import { Stage, Layer, Line, Rect } from 'react-konva';

const API_URL = (import.meta.env.VITE_API_URL as string) ?? 'https://localhost:7179';
const FRAME_SIZE = 700;

export default function FinalPage() {
  const lobbyId = sessionStorage.getItem('lobbyId') || '';
  const { name: username } = useLobbyName('');
  const navigate = useNavigate();

  // keep hook for any drawing-related handlers/state the page relies on
  useDrawingState(lobbyId, username);

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

      // Keep GoToFinal handler so this page can respond to server navigation broadcasts
      lobbyHub.onGoToFinalHandler(() => { try { navigate('/final'); } catch { } });

      // drawing preview handlers
      lobbyHub.onStrokeStartedHandler((strokeId, color, width, tool) => {
        setStrokes(prev => prev.concat({ id: strokeId, color, width, tool, points: [] }));
      });
      lobbyHub.onStrokePointsHandler((strokeId, pts) => {
        setStrokes(prev => prev.map(s => s.id === strokeId ? { ...s, points: s.points.concat(pts.flatMap(p => [p.x, p.y])) } : s));
      });
      lobbyHub.onStrokeEndedHandler((_strokeId) => {
        // no-op for now; strokes are already complete
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

  return (
    <BackgroundLayers>
      <FloatingControls />
      <div className="drawing-page">
        <div className="game-container" style={scaledStyle}>
          <div className="main-content" style={{ alignItems: 'flex-start' }}>
            {/* No chat sidebar on final page */}
            <div className="canvas-container" style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
              <div className="frame-stack" style={{ width: FRAME_SIZE }}>
                <div className="frame-label frame-label--abs">Drawing</div>
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
                          tension={0.5}
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

          <div
            className="bottom-controls"
            style={{
              display: 'flex',
              justifyContent: 'center',   // center horizontally under the squares
              alignItems: 'center',       // vertical centering inside this band
              minHeight: '6.5vw',         // provide vertical space so the button sits visually centered
              marginTop: '2vw',
            }}
          >
            {/* Use the same visual component & style as Home -> JOIN ROOM button */}
            <ExpandButton
              style={mainActionButtonStyle}
              onClick={() => navigate('/')}
            >
              HOME
            </ExpandButton>

            {/* Chat input and Finish button intentionally removed for final page */}
          </div>
        </div>
      </div>
    </BackgroundLayers>
  );
}