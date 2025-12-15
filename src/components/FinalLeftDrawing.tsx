import React, { useEffect, useRef, useState } from 'react';
import lobbyHub from '../services/lobbyHub';

const API_URL = (import.meta.env.VITE_API_URL as string) ?? 'https://localhost:7179';

const STAGE_SIZE = 700;
const POLL_INTERVAL_MS = 25;
const POLL_TIMEOUT_MS = 500;

async function fetchLatestDrawingUrl(): Promise<string | null> {
  const resp = await fetch(`${API_URL}/api/drawings/latest`, { credentials: 'include' });
  if (resp.status === 204) return null;
  if (!resp.ok) return null;
  const json = await resp.json();
  return `${API_URL}${json.url}`;
}

export default function FinalLeftDrawing() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // track last announced URL to avoid overwriting a freshly announced drawing with an older GET result
  const lastAnnouncedUrlRef = useRef<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    // Register hub handler first so any immediate DrawingSaved broadcast is handled before the initial GET.
    const handler = (relativeUrl: string) => {
      if (!relativeUrl) return;
      const absolute = `${API_URL}${relativeUrl}`;
      lastAnnouncedUrlRef.current = absolute;
      setImageUrl(absolute);
    };
    lobbyHub.registerRawHandler('DrawingSaved', handler);

    (async () => {
      try {
        // initial fetch
        const initial = await fetchLatestDrawingUrl();
        if (!mountedRef.current) return;

        // If there was an announced url that arrived during navigation, prefer it.
        if (lastAnnouncedUrlRef.current) {
          setImageUrl(lastAnnouncedUrlRef.current);
          return;
        }

        // If initial is null, still start polling — upload/announce may be in-flight.
        setImageUrl(initial);

        // Poll for a short window so other clients who are racing the upload/announce will converge.
        const start = Date.now();
        let current = initial;
        while (mountedRef.current && Date.now() - start < POLL_TIMEOUT_MS) {
          // if an announcement arrives during polling, prefer it immediately
          if (lastAnnouncedUrlRef.current) {
            setImageUrl(lastAnnouncedUrlRef.current);
            return;
          }

          const latest = await fetchLatestDrawingUrl();
          if (!mountedRef.current) return;

          // if latest changed (new file created), use it and stop polling
          if (latest && latest !== current) {
            setImageUrl(latest);
            return;
          }

          // nothing new yet — wait a bit and retry
          await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
        }
      } catch (err) {
        console.warn('Error fetching latest drawing', err);
        if (!lastAnnouncedUrlRef.current) setImageUrl(null);
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    })();

    return () => {
      mountedRef.current = false;
      // registerRawHandler persists handlers across reconnects by design
    };
  }, []);

  if (loading) {
    return <div className="final-left-square">Loading…</div>;
  }

  if (!imageUrl) {
    return <div className="final-left-square">No drawing available</div>;
  }

  return (
    <div
      className="final-left-square"
      style={{
        width: STAGE_SIZE,
        height: STAGE_SIZE,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <img
        src={imageUrl}
        alt="Last drawing"
        style={{
          width: `${STAGE_SIZE}px`,
          height: `${STAGE_SIZE}px`,
          objectFit: 'contain',
          display: 'block'
        }}
      />
    </div>
  );
}