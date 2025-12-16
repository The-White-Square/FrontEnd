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
import FinalLeftDrawing from './components/FinalLeftDrawing';

const API_URL = (import.meta.env.VITE_API_URL as string) ?? 'https://localhost:7179';
const FRAME_SIZE = 700;

type ComparisonResult = {
  score?: number | null;
  message?: string | null;
  diffImageUrl?: string | null;
  raw?: any;
};

const wait = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

export default function FinalPage() {
  const lobbyId = sessionStorage.getItem('lobbyId') || '';
  const { name: username } = useLobbyName(''); 
  const navigate = useNavigate();

  useDrawingState(lobbyId, username);

  // absolute URL used for display
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  // server-relative path (e.g. "/images/xxx.png") used for comparison
  const [imagePathRaw, setImagePathRaw] = useState<string | null>(null);

  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [compLoading, setCompLoading] = useState(false);
  const [compError, setCompError] = useState<string | null>(null);

  // drawing raw path returned from upload or latest (server-relative), and absolute for display if needed
  const [drawingPathRaw, setDrawingPathRaw] = useState<string | null>(null);
  const [drawingUrl, setDrawingUrl] = useState<string | null>(null);

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
      // hub likely sends server-relative path; preserve raw and set absolute for display
      if (mounted) {
        setImagePathRaw(img ?? null);
        const abs = toAbsoluteUrl(img);
        setImageUrl(abs);
      }
    };

    const init = async () => {
      try { await lobbyHub.start(); } catch { /* ignore */ }
      lobbyHub.onReceiveImageHandler(handleReceiveImage);
      lobbyHub.onGoToFinalHandler(() => { try { navigate('/final'); } catch { } });

      lobbyHub.onStrokeStartedHandler((strokeId, color, width, tool) => {
        setStrokes(prev => prev.concat({ id: strokeId, color, width, tool, points: [] }));
      });
      lobbyHub.onStrokePointsHandler((strokeId, pts) => {
        setStrokes(prev => prev.map(s => s.id === strokeId ? { ...s, points: s.points.concat(pts.flatMap(p => [p.x, p.y])) } : s));
      });
      lobbyHub.onStrokeEndedHandler((_strokeId) => { });
      lobbyHub.onCanvasClearedHandler(() => { setStrokes([]); });

      if (lobbyId) {
        try {
          const dto = await api.getLobbyImage(lobbyId);
          if (dto?.url) {
            // preserve raw path for comparison, absolute for display
            if (mounted) {
              setImagePathRaw(dto.url);
              const abs = toAbsoluteUrl(dto.url);
              setImageUrl(abs);
            }
          }
        } catch { }
      }
    };

    init();
    return () => { mounted = false; };
  }, [lobbyId, toAbsoluteUrl, navigate]);

  const fetchLatestDrawingUrl = async (): Promise<string | null> => {
    try {
      const resp = await fetch(`${API_URL}/api/drawings/latest`);
      if (!resp.ok) return null;
      const body = await resp.json();
      // return server-relative path (raw) — do not convert to absolute here
      if (body?.url) return body.url;
      return null;
    } catch {
      return null;
    }
  };

  // helper: get canvas blob from left-square (Konva renders canvas inside .left-square)
  const getLeftCanvasBlob = async (): Promise<Blob | null> => {
    try {
      const canvas = document.querySelector('.left-square canvas') as HTMLCanvasElement | null;
      if (!canvas) return null;
      return await new Promise<Blob | null>((resolve) => {
        if (canvas.toBlob) {
          canvas.toBlob((b) => resolve(b), 'image/png');
        } else {
          const dataUrl = canvas.toDataURL('image/png');
          const byteString = atob(dataUrl.split(',')[1]);
          const ia = new Uint8Array(byteString.length);
          for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
          resolve(new Blob([ia], { type: 'image/png' }));
        }
      });
    } catch {
      return null;
    }
  };

  // upload a blob to POST /api/drawings; returns server-relative url (raw) or null
  const uploadDrawingBlob = async (blob: Blob): Promise<string | null> => {
    try {
      const form = new FormData();
      const file = new File([blob], 'drawing.png', { type: 'image/png' });
      form.append('file', file);

      const resp = await fetch(`${API_URL}/api/drawings`, {
        method: 'POST',
        body: form
      });

      if (!resp.ok) return null;
      const body = await resp.json();
      // return server-relative path (body.url), caller will convert to absolute only for display
      if (body?.url) return body.url;
      return null;
    } catch {
      return null;
    }
  };

  // request comparison when we have both the original and the final drawing
  useEffect(() => {
    let mounted = true;
    const runComparison = async () => {
      if (!imageUrl && !imagePathRaw) return;
      setCompError(null);
      setComparison(null);
      setCompLoading(true);

      try {
        // export left drawing canvas
        const blob = await getLeftCanvasBlob();

        if (blob) {
          // fetch original image as blob (use absolute for display)
          let originalBlob: Blob | null = null;
          if (imageUrl) {
            try {
              const r = await fetch(imageUrl);
              if (r.ok) originalBlob = await r.blob();
            } catch { /* ignore */ }
          }

          if (!originalBlob) {
            // fallback: try server-relative path if available
            if (imagePathRaw) {
              try {
                const r = await fetch(API_URL + imagePathRaw);
                if (r.ok) originalBlob = await r.blob();
              } catch { /* ignore */ }
            }
          }

          if (!originalBlob) {
            // couldn't fetch original; fall back to previous URL-based flow
            // continue with old behavior below
          } else {
            // send both blobs in a single multipart request to avoid races
            const form = new FormData();
            form.append('fileA', originalBlob, 'original.png');
            form.append('fileB', blob, 'drawing.png');

            const resp = await fetch(`${API_URL}/comparison/upload`, {
              method: 'POST',
              body: form
            });

            if (!resp.ok) {
              const text = await resp.text();
              throw new Error(`${resp.status}: ${text}`);
            }

            const json = await resp.json();
            if (mounted) setComparison(json);
            return; // done
          }
        }

        // --- fallback path (no local blob or couldn't fetch original) ---
        // existing URL-based request (unchanged)
        // Determine drawing path (uploaded or latest) as before...
        let drawingRaw: string | null = null;
        let drawingAbs: string | null = null;

        // attempt to upload blob if we had one (we handled blob case above), else get latest
        const latestRaw = await fetchLatestDrawingUrl();
        if (latestRaw) {
          drawingRaw = latestRaw;
          drawingAbs = toAbsoluteUrl(latestRaw);
          if (mounted) {
            setDrawingPathRaw(latestRaw);
            setDrawingUrl(drawingAbs);
          }
        }

        if (!drawingRaw) {
          setCompError('No drawing available to compare.');
          return;
        }

        const sendA = imagePathRaw ?? (imageUrl ? imageUrl : null);
        const sendB = drawingPathRaw ?? drawingRaw ?? (drawingUrl ? drawingUrl : null);

        const resp2 = await fetch(`${API_URL}/comparison`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ImagePathA: sendA, ImagePathB: sendB })
        });

        if (!resp2.ok) {
          const text = await resp2.text();
          throw new Error(`${resp2.status}: ${text}`);
        }

        const json2 = await resp2.json();
        if (mounted) setComparison(json2);
      } catch (err: any) {
        if (mounted) setCompError(err?.message ?? 'Comparison failed');
      } finally {
        if (mounted) setCompLoading(false);
      }
    };

    runComparison();
    return () => { mounted = false; };
  }, [imageUrl, imagePathRaw, drawingPathRaw, toAbsoluteUrl]);

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

  return (
    <BackgroundLayers>
      <FloatingControls />
      <div className="drawing-page">
        <div className="game-container" style={scaledStyle}>
          <div className="main-content" style={{ alignItems: 'flex-start' }}>
            <div className="canvas-container" style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
              <div className="frame-stack" style={{ width: FRAME_SIZE }}>
                <div className="frame-label frame-label--abs">Drawing</div>
                <div style={frameBoxStyle}>
                    <aside className="left-square">
                        <FinalLeftDrawing />
                    </aside>
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

          {/* comparison result inserted between squares and Home button */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
            <div style={{ maxWidth: 720, textAlign: 'center', color: '#333' }}>
              {compLoading && <div>Comparing...</div>}
              {compError && <div style={{ color: 'crimson' }}>{compError}</div>}
              {comparison && (
                <>
                  {comparison.score != null && (
                    <div style={{ fontSize: 40, fontWeight: 600 }}>Similarity: {(comparison.score * 100).toFixed(1)}%</div>
                  )}
                  {comparison.message && <div style={{ marginTop: 8 }}>{comparison.message}</div>}
                  {comparison.diffImageUrl && (
                    <div style={{ marginTop: 8 }}>
                      <img src={comparison.diffImageUrl.startsWith('http') ? comparison.diffImageUrl : (API_URL + comparison.diffImageUrl)} alt="diff" style={{ maxWidth: '100%', height: 'auto' }} />
                    </div>
                  )}
                  {!comparison.score && !comparison.message && !comparison.diffImageUrl && (
                    <pre style={{ textAlign: 'left', marginTop: 8, whiteSpace: 'pre-wrap' }}>{JSON.stringify(comparison.raw || comparison, null, 2)}</pre>
                  )}
                </>
              )}
            </div>
          </div>

          <div
            className="bottom-controls"
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '6.5vw',
              marginTop: '2vw',
            }}
          >
            <ExpandButton
              style={mainActionButtonStyle}
              onClick={() => navigate('/')}
            >
              HOME
            </ExpandButton>
          </div>
        </div>
      </div>
    </BackgroundLayers>
  );
}