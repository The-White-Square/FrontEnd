import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import lobbyHub from '../services/lobbyHub';

interface DrawingCanvasProps {
  lobbyId: string;
  role: 'Artist' | 'Explainer' | 'None';
  width?: number;
  height?: number;
  strokeColor?: string;
  strokeWidth?: number;
}

interface Stroke {
  id: string;
  points: number[];
  color: string;
  width: number;
  tool: string;
  finished?: boolean;
}

const DEFAULT_WIDTH = 700;
const DEFAULT_HEIGHT = 700;

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  lobbyId,
  role,
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  strokeColor = '#000000',
  strokeWidth = 4
}) => {
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const currentStrokeRef = useRef<Stroke | null>(null);
  const batchRef = useRef<{ x: number; y: number }[]>([]);
  const flushTimerRef = useRef<number | null>(null);

  // Describer listeners
  useEffect(() => {
    if (role !== 'Explainer') return;

    const started = (strokeId: string, color: string, width: number, tool: string) => {
      setStrokes(prev => [...prev, { id: strokeId, points: [], color, width, tool }]);
    };
    const points = (strokeId: string, pts: { x: number; y: number }[]) => {
      setStrokes(prev =>
        prev.map(s =>
          s.id === strokeId
            ? { ...s, points: [...s.points, ...pts.flatMap(p => [p.x, p.y])] }
            : s
        )
      );
    };
    const ended = (strokeId: string) => {
      setStrokes(prev => prev.map(s => (s.id === strokeId ? { ...s, finished: true } : s)));
    };
    const cleared = () => setStrokes([]);

    lobbyHub.onStrokeStartedHandler(started);
    lobbyHub.onStrokePointsHandler(points);
    lobbyHub.onStrokeEndedHandler(ended);
    lobbyHub.onCanvasClearedHandler(cleared);

    return () => {
      // detach by assigning no-op handlers to avoid stale updates
      lobbyHub.onStrokeStartedHandler(() => {});
      lobbyHub.onStrokePointsHandler(() => {});
      lobbyHub.onStrokeEndedHandler(() => {});
      lobbyHub.onCanvasClearedHandler(() => {});
    };
  }, [role]);

  // Drawer interaction
  const beginStroke = (x: number, y: number) => {
    const genId = () =>
      (typeof crypto !== 'undefined' && 'randomUUID' in crypto) ? crypto.randomUUID() : Math.random().toString(36).slice(2);
    const strokeId = genId();
    const stroke: Stroke = {
      id: strokeId,
      points: [x, y],
      color: strokeColor,
      width: strokeWidth,
      tool: 'pen'
    };
    currentStrokeRef.current = stroke;
    setStrokes(prev => [...prev, stroke]);

    // enqueue the initial point so the describer receives short clicks
    batchRef.current.push({ x, y });
    scheduleFlush();

    const conn = lobbyHub.getConnection();
    if (conn) {
      conn.invoke('BeginStroke', lobbyId, strokeId, stroke.color, stroke.width, stroke.tool).catch(() => {});
    }
  };

  const flushBatchNow = (strokeId: string) => {
    const conn = lobbyHub.getConnection();
    if (!conn) return;
    if (batchRef.current.length === 0) return;
    const payload = batchRef.current.slice();
    batchRef.current = [];
    try {
      conn.invoke('AddStrokePoints', lobbyId, strokeId, payload).catch(() => {});
    } catch {
      // ignore
    }
  };

  const scheduleFlush = () => {
    if (flushTimerRef.current != null) return;
    flushTimerRef.current = window.setTimeout(() => {
      flushTimerRef.current = null;
      if (batchRef.current.length && currentStrokeRef.current) {
        const conn = lobbyHub.getConnection();
        const strokeId = currentStrokeRef.current.id;
        const payload = batchRef.current.slice();
        batchRef.current = [];
        if (conn) {
          conn.invoke('AddStrokePoints', lobbyId, strokeId, payload).catch(() => {});
        }
      }
    }, 50);
  };

  const handlePointerDown = (e: any) => {
    if (role !== 'Artist') return;
    const stage = e.target.getStage?.();
    const pos = stage?.getPointerPosition?.() ?? null;
    if (!pos) return;
    beginStroke(pos.x, pos.y);
  };

  const handlePointerMove = (e: any) => {
    if (role !== 'Artist') return;
    const stage = e.target.getStage?.();
    const pos = stage?.getPointerPosition?.() ?? null;
    if (!pos) return;

    const cs = currentStrokeRef.current;
    if (!cs) return; // guard against late events after stroke end

    // mutate current stroke points
    cs.points.push(pos.x, pos.y);

    // update React state using captured stroke id/points to avoid null ref races
    const strokeId = cs.id;
    const ptsCopy = [...cs.points];
    setStrokes(prev => prev.map(s => (s.id === strokeId ? { ...s, points: ptsCopy } : s)));

    // batch for server flush
    batchRef.current.push({ x: pos.x, y: pos.y });
    scheduleFlush();
  };

  const endStroke = (e?: any) => {
    if (role !== 'Artist') return;
    const cs = currentStrokeRef.current;
    if (!cs) return;

    const stage = e?.target?.getStage?.();
    const pos = stage?.getPointerPosition?.() ?? null;
    if (pos) {
      // include last pointer position so describer gets the full curve
      cs.points.push(pos.x, pos.y);
      const strokeIdForUpdate = cs.id;
      const ptsCopy = [...cs.points];
      setStrokes(prev => prev.map(s => (s.id === strokeIdForUpdate ? { ...s, points: ptsCopy } : s)));
      batchRef.current.push({ x: pos.x, y: pos.y });
    }

    const strokeId = cs.id;

    // If no move occurred (single-point stroke), ensure at least one point is sent.
    if (batchRef.current.length === 0 && cs.points.length === 2) {
      // duplicate the point so a dot renders on the remote side as a very short segment
      const x = cs.points[0];
      const y = cs.points[1];
      batchRef.current.push({ x, y });
      batchRef.current.push({ x, y });
    }

    // flush any remaining points immediately before ending
    flushBatchNow(strokeId);

    // clear timer
    if (flushTimerRef.current != null) {
      clearTimeout(flushTimerRef.current);
      flushTimerRef.current = null;
    }

    currentStrokeRef.current = null;

    const conn = lobbyHub.getConnection();
    if (conn) {
      conn.invoke('EndStroke', lobbyId, strokeId).catch(() => {});
    }
  };

  const clearCanvas = () => {
    setStrokes([]);
    const conn = lobbyHub.getConnection();
    if (conn) {
      conn.invoke('ClearCanvas', lobbyId).catch(() => {});
    }
  };

  return (
    <div style={{ position: 'relative', width, margin: '0 auto' }}>
      <Stage
        width={width}
        height={height}
        style={{ background: '#ffffff', border: '1px solid #ccc', cursor: role === 'Artist' ? 'crosshair' : 'default' }}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={endStroke}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={endStroke}
      >
        <Layer>
          {strokes.map(s => (
            <Line
              key={s.id}
              points={s.points}
              stroke={s.color}
              strokeWidth={s.width}
              lineCap="round"
              lineJoin="round"
              tension={0}
              perfectDrawEnabled={false}
            />
          ))}
        </Layer>
      </Stage>
      {role === 'Artist' && (
        <div style={{ marginTop: 12, display: 'flex', gap: 12 }}>
          <button onClick={clearCanvas}>Clear</button>
        </div>
      )}
    </div>
  );
};

export default DrawingCanvas;