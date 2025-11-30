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

    lobbyHub.onStrokeStartedHandler((strokeId, color, width, tool) => {
      setStrokes(prev => [...prev, { id: strokeId, points: [], color, width, tool }]);
    });

    lobbyHub.onStrokePointsHandler((strokeId, pts) => {
      setStrokes(prev =>
        prev.map(s =>
          s.id === strokeId
            ? { ...s, points: [...s.points, ...pts.flatMap(p => [p.x, p.y])] }
            : s
        )
      );
    });

    lobbyHub.onStrokeEndedHandler(strokeId => {
      setStrokes(prev =>
        prev.map(s => (s.id === strokeId ? { ...s, finished: true } : s))
      );
    });

    lobbyHub.onCanvasClearedHandler(() => setStrokes([]));
  }, [role]);

  // Drawer interaction
  const beginStroke = (x: number, y: number) => {
    const strokeId = crypto.randomUUID();
    const stroke: Stroke = {
      id: strokeId,
      points: [x, y],
      color: strokeColor,
      width: strokeWidth,
      tool: 'pen'
    };
    currentStrokeRef.current = stroke;
    setStrokes(prev => [...prev, stroke]);

    const conn = lobbyHub.getConnection();
    if (conn) {
      conn.invoke('BeginStroke', lobbyId, strokeId, stroke.color, stroke.width, stroke.tool).catch(() => {});
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
    const pos = e.target.getStage().getPointerPosition();
    if (!pos) return;
    beginStroke(pos.x, pos.y);
  };

  const handlePointerMove = (e: any) => {
    if (role !== 'Artist' || !currentStrokeRef.current) return;
    const pos = e.target.getStage().getPointerPosition();
    if (!pos) return;
    currentStrokeRef.current.points.push(pos.x, pos.y);
    setStrokes(prev =>
      prev.map(s =>
        s.id === currentStrokeRef.current!.id ? { ...s, points: [...currentStrokeRef.current!.points] } : s
      )
    );
    batchRef.current.push({ x: pos.x, y: pos.y });
    scheduleFlush();
  };

  const endStroke = () => {
    if (role !== 'Artist' || !currentStrokeRef.current) return;
    const strokeId = currentStrokeRef.current.id;
    currentStrokeRef.current = null;
    batchRef.current = [];
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