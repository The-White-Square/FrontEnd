import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import BackgroundLayers from './components/BackgroundLayers';
import FloatingControls from './components/FloatingControls';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import { useDrawingState } from './hooks/useDrawingState';
import * as api from './services/lobbyApi';
import lobbyHub from './services/lobbyHub';
import './styles/DrawingPage.css';

type NavState = {
  lobbyId?: string;
  name?: string;
  iconId?: number;
};

const API_URL = (import.meta.env.VITE_API_URL as string) ?? 'https://localhost:7179';
const FRAME_SIZE = 700;

export default function DescriberPage() {
  const location = useLocation();
  const { lobbyId } = (location.state as NavState) ?? {};

  const {
    chatMessages,
    chatInput,
    setChatInput,
    sendMessage,
    players,
  } = useDrawingState();

  const [imageUrl, setImageUrl] = useState<string | null>(null);

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
  }, [lobbyId, toAbsoluteUrl]);

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
            {/* Chat aligned with top of squares */}
            <div className="chat-sidebar">
              <ChatWindow messages={chatMessages} players={players} />
            </div>

            {/* Two frame stacks */}
            <div className="canvas-container" style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
              <div className="frame-stack" style={{ width: FRAME_SIZE }}>
                <div className="frame-label frame-label--abs">Live Preview</div>
                <div style={frameBoxStyle}>
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: '#f8f8f8',
                    }}
                  />
                </div>
              </div>

              <div className="frame-stack" style={{ width: FRAME_SIZE }}>
                <div className="frame-label frame-label--abs">Original</div>
                <div style={frameBoxStyle}>
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="Target"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#8B4513',
                        fontSize: 24,
                        background: '#fff',
                      }}
                    >
                      Waiting for image...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bottom-controls" style={{ justifyContent: 'flex-start' }}>
            <ChatInput
              value={chatInput}
              onChange={setChatInput}
              onSend={sendMessage}
            />
          </div>
        </div>
      </div>
    </BackgroundLayers>
  );
}