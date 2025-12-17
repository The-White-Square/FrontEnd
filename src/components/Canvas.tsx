import { useRef, useCallback, forwardRef, useImperativeHandle, useEffect } from 'react';
import { Stage, Layer, Rect } from 'react-konva';
import Konva from 'konva';
import lobbyHub from '../services/lobbyHub';
import type { DrawingEvent } from '../services/lobbyHub';

interface CanvasProps {
  selectedColor: string;
  brushSize: number;
  selectedTool: 'brush' | 'eraser' | 'fill';
  onSaveState: () => void;
}

export interface CanvasRef {
  undo: () => void;
  redo: () => void;
  clear: () => void;
}

// Rebuild Konva layer from server events
function replayEventsIntoLayer(events: DrawingEvent[] | any[], layer: Konva.Layer) {
  layer.destroyChildren();
  const bgRect = new Konva.Rect({ x: 0, y: 0, width: 700, height: 700, fill: '#FFFFFF' });
  layer.add(bgRect);

  const strokeMap = new Map<string, Konva.Line>();

  for (const e of events ?? []) {
    const type = e.type ?? e.Type;
    switch (type) {
      case 'CanvasCleared': {
        layer.destroyChildren();
        layer.add(bgRect.clone());
        strokeMap.clear();
        break;
      }
      case 'StrokeStarted': {
        const strokeId = e.strokeId ?? e.StrokeId;
        const color = e.color ?? e.Color;
        const width = e.width ?? e.Width;
        const tool = e.tool ?? e.Tool;
        const line = new Konva.Line({
          points: [],
          stroke: tool === 'eraser' ? '#FFFFFF' : color,
          strokeWidth: width,
          tension: 0,
          lineCap: 'round',
          lineJoin: 'round',
          globalCompositeOperation: tool === 'eraser' ? 'destination-out' : 'source-over',
        });
        strokeMap.set(strokeId, line);
        layer.add(line);
        break;
      }
      case 'StrokePoints': {
        const strokeId = e.strokeId ?? e.StrokeId;
        const line = strokeMap.get(strokeId);
        if (!line) break;
        const pts = (e.points ?? e.Points) as Array<{ x?: number; y?: number; X?: number; Y?: number }>;
        const flat = pts.flatMap(p => [ (p.x ?? p.X) as number, (p.y ?? p.Y) as number ]);
        const existing = line.points();
        if (existing.length === 0 && flat.length >= 2) {
          const [sx, sy] = flat;
          line.points([sx, sy, sx, sy, ...flat]);
        } else {
          line.points(existing.concat(flat));
        }
        break;
      }
      case 'StrokeEnded': {
        const strokeId = e.strokeId ?? e.StrokeId;
        const line = strokeMap.get(strokeId);
        if (!line) break;
        const pts = line.points();
        if (pts.length >= 2) {
          const endX = pts[pts.length - 2];
          const endY = pts[pts.length - 1];
          line.points(pts.concat([endX, endY]));
        }
        break;
      }
      default:
        break;
    }
  }

  layer.draw();
}

const Canvas = forwardRef<CanvasRef, CanvasProps>(
  ({ selectedColor, brushSize, selectedTool, onSaveState }, ref) => {
    // Konva stage and layer references
    const stageRef = useRef<Konva.Stage>(null);
    const layerRef = useRef<Konva.Layer>(null);

    // Drawing state
    const isDrawingRef = useRef(false);
    const currentLineRef = useRef<Konva.Line | null>(null);
    const currentStrokeIdRef = useRef<string | null>(null);

    // History for undo/redo - stores complete canvas state
    const historyRef = useRef<string[]>([]);
    const historyIndexRef = useRef(-1);

    const lobbyId = sessionStorage.getItem('lobbyId') || '';

    const saveCanvasState = useCallback(() => {
      const stage = stageRef.current;
      if (!stage) return;
      
      // Save the entire stage as data URL
      const dataURL = stage.toDataURL();
      const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
      newHistory.push(dataURL);
      historyRef.current = newHistory;
      historyIndexRef.current = newHistory.length - 1;
      onSaveState();
    }, [onSaveState]);

    // Restore canvas state from history
    const restoreCanvasState = (dataURL: string) => {
      const stage = stageRef.current;
      const layer = layerRef.current;
      if (!stage || !layer) return;

      const img = new Image();
      img.onload = () => {
        // Clear the layer
        layer.destroyChildren();
        const konvaImg = new Konva.Image({ x: 0, y: 0, image: img, width: 700, height: 700 });
        layer.add(konvaImg);
        layer.draw();
      };
      img.src = dataURL;
    };

    // Undo functionality
    const undo = () => {
      if (historyIndexRef.current > 0) {
        const newIndex = historyIndexRef.current - 1;
        const dataURL = historyRef.current[newIndex];
        restoreCanvasState(dataURL);
        historyIndexRef.current = newIndex;
      }
    };

    // Redo functionality
    const redo = () => {
      if (historyIndexRef.current < historyRef.current.length - 1) {
        const newIndex = historyIndexRef.current + 1;
        const dataURL = historyRef.current[newIndex];
        restoreCanvasState(dataURL);
        historyIndexRef.current = newIndex;
      }
    };

    const clear = () => {
      const layer = layerRef.current;
      if (!layer) return;
      
      // Clear all elements and reset to white background
      layer.destroyChildren();
      const bgRect = new Konva.Rect({ x: 0, y: 0, width: 700, height: 700, fill: '#FFFFFF' });
      layer.add(bgRect);
      layer.draw();
      
      // Save this clear state to history
      saveCanvasState();
      if (lobbyId) lobbyHub.clearCanvas(lobbyId).catch(() => {});
    };

    // Flood fill implementation using Konva
    const floodFill = (startX: number, startY: number, fillColor: string) => {
      const stage = stageRef.current;
      const layer = layerRef.current;
      if (!stage || !layer) return;

      // Convert Konva stage to canvas for pixel manipulation
      const canvas = stage.toCanvas();
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const width = canvas.width;
      const height = canvas.height;
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
      };
      const fillColorRgb = hexToRgb(fillColor);
      if (!fillColorRgb) return;

      // Get target color at click position
      const pixelIndex = (Math.floor(startY) * width + Math.floor(startX)) * 4;
      const targetR = data[pixelIndex];
      const targetG = data[pixelIndex + 1];
      const targetB = data[pixelIndex + 2];
      const targetA = data[pixelIndex + 3];
      if (targetR === fillColorRgb.r && targetG === fillColorRgb.g && targetB === fillColorRgb.b && targetA === 255) {
        return;
      }
      const pixelStack: number[][] = [[Math.floor(startX), Math.floor(startY)]];
      const visited = new Set<string>();
      while (pixelStack.length > 0) {
        const [x, y] = pixelStack.pop()!;
        if (x < 0 || x >= width || y < 0 || y >= height) continue;
        const key = `${x},${y}`;
        if (visited.has(key)) continue;
        visited.add(key);

        const index = (y * width + x) * 4;
        if (data[index] === targetR && data[index + 1] === targetG && data[index + 2] === targetB && data[index + 3] === targetA) {
          data[index] = fillColorRgb.r;
          data[index + 1] = fillColorRgb.g;
          data[index + 2] = fillColorRgb.b;
          data[index + 3] = 255;

          // Add adjacent pixels to stack
          pixelStack.push([x + 1, y]);
          pixelStack.push([x - 1, y]);
          pixelStack.push([x, y + 1]);
          pixelStack.push([x, y - 1]);
        }
      }

      // Apply the flood filled image back to Konva
      ctx.putImageData(imageData, 0, 0);
      
      // Create a new image element from the modified canvas
      const img = new Image();
      img.onload = () => {
        // Clear the current layer and add the flood-filled image
        layer.destroyChildren();
        const bgRect = new Konva.Rect({ x: 0, y: 0, width: 700, height: 700, fill: '#FFFFFF' });
        layer.add(bgRect);
        const konvaImg = new Konva.Image({ x: 0, y: 0, image: img, width: 700, height: 700 });
        layer.add(konvaImg);
        
        // No need to redraw lines since they're already in the Konva layer
        
        layer.draw();
        saveCanvasState();
      };
      img.src = canvas.toDataURL();
    };



    // Get pointer position
    const getPointerPosition = (stage: Konva.Stage) => {
      const pos = stage.getPointerPosition();
      return pos || { x: 0, y: 0 };
    };

    // Start drawing event
    const handleMouseDown = () => {
      const stage = stageRef.current;
      if (!stage) return;
      const pos = getPointerPosition(stage);
      if (selectedTool === 'fill') {
        floodFill(pos.x, pos.y, selectedColor);
        return;
      }

      isDrawingRef.current = true;
      
      // Add line to Konva layer directly
      const layer = layerRef.current;
      if (layer) {
        const initialPoints = [pos.x, pos.y, pos.x, pos.y]; // duplicate start point to ensure round cap
        const konvaLine = new Konva.Line({
          points: initialPoints,
          stroke: selectedTool === 'eraser' ? '#FFFFFF' : selectedColor,
          strokeWidth: brushSize,
          tension: 0, // disable spline smoothing to avoid deformation on fast strokes
          lineCap: 'round',
          lineJoin: 'round',
          globalCompositeOperation: selectedTool === 'eraser' ? 'destination-out' : 'source-over',
        });
        
        // Store reference to current line for mouse move events
        currentLineRef.current = konvaLine;
        layer.add(konvaLine);
        layer.draw();
      }
      // start streaming stroke to describer
      if (lobbyId) {
        const strokeId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
        currentStrokeIdRef.current = strokeId;
        lobbyHub.beginStroke(lobbyId, strokeId, selectedColor, brushSize, selectedTool).catch(() => {});
      }
    };

    const handleMouseMove = () => {
      if (!isDrawingRef.current || !currentLineRef.current) return;
      const stage = stageRef.current;
      const layer = layerRef.current;
      if (!stage || !layer) return;
      const pos = getPointerPosition(stage);
      
      // Update the current line being drawn directly on Konva
      const currentPoints = currentLineRef.current.points();
      currentLineRef.current.points([...currentPoints, pos.x, pos.y]);
      layer.draw();
      // stream point batches to describer
      if (lobbyId && currentStrokeIdRef.current) {
        const pts = [ { x: pos.x, y: pos.y } ];
        lobbyHub.addStrokePoints(lobbyId, currentStrokeIdRef.current, pts).catch(() => {});
      }
    };

    const handleMouseUp = () => {
      if (isDrawingRef.current) {
        // duplicate end point to preserve round cap at end
        if (currentLineRef.current) {
          const pts = currentLineRef.current.points();
          if (pts.length >= 2) {
            const endX = pts[pts.length - 2];
            const endY = pts[pts.length - 1];
            currentLineRef.current.points([...pts, endX, endY]);
          }
        }
        saveCanvasState();
      }
      isDrawingRef.current = false;
      // end stroke stream
      if (lobbyId && currentStrokeIdRef.current) {
        lobbyHub.endStroke(lobbyId, currentStrokeIdRef.current).catch(() => {});
      }
      currentStrokeIdRef.current = null;
      currentLineRef.current = null;
    };

    useImperativeHandle(ref, () => ({ undo, redo, clear }));

    // Initialize canvas state
    useEffect(() => {
      const timer = setTimeout(() => { saveCanvasState(); }, 100);
      return () => clearTimeout(timer);
    }, [saveCanvasState]);

    // Register a best-effort GoToFinal handler that uploads the current stage PNG
    useEffect(() => {
      const handler = async (..._args: any[]) => {
        try {
          const stage = stageRef.current;
          if (!stage) return;
          // produce PNG data URL
          const dataUrl = stage.toDataURL({ mimeType: 'image/png', quality: 1 });
          // best-effort upload; pass lobbyId so hub can broadcast the created URL
          await lobbyHub.uploadDataUrlToDrawings(dataUrl, lobbyId).catch((err) => {
            console.warn('[Canvas] auto-upload failed', err);
          });
        } catch (err) {
          console.warn('[Canvas] auto-upload error', err);
        }
      };

      // register raw handler (idempotent, lobbyHub avoids duplicate registration)
      lobbyHub.registerRawHandler('GoToFinal', handler);
      // no explicit cleanup: registerRawHandler persists handlers; no-op on unmount-safe usage
    }, []);

    // Bootstrap from server on mount (refresh recovery)
    useEffect(() => {
      let mounted = true;
      (async () => {
        try {
          await lobbyHub.start();
          if (lobbyId) {
            const events = await lobbyHub.getDrawingEvents(lobbyId);
            const layer = layerRef.current;
            if (mounted && layer) replayEventsIntoLayer(events, layer);
          }
        } catch {}
      })();

      lobbyHub.onCanvasResetHandler((events) => {
        const layer = layerRef.current;
        if (layer) replayEventsIntoLayer(events, layer);
      });

      return () => { mounted = false; };
    }, [lobbyId]);

    return (
      <div className="drawing-canvas">
        <Stage
          width={700}
          height={700}
          onMouseDown={handleMouseDown}
          onMousemove={handleMouseMove}
          onMouseup={handleMouseUp}
          ref={stageRef}
        >
          <Layer ref={layerRef}>
            <Rect x={0} y={0} width={700} height={700} fill={'#FFFFFF'} />
          </Layer>
        </Stage>
      </div>
    );
  }
);

Canvas.displayName = 'Canvas';

export default Canvas;