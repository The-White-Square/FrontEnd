import React, { useRef, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';

interface CanvasProps {
  selectedColor: string;
  brushSize: number;
  selectedTool: 'brush' | 'eraser' | 'fill';
  onSaveState: () => void;
}

export interface CanvasRef {
  canvas: HTMLCanvasElement | null;
  undo: () => void;
  redo: () => void;
  clear: () => void;
}

const Canvas = forwardRef<CanvasRef, CanvasProps>(
  ({ selectedColor, brushSize, selectedTool, onSaveState }, ref) => {
    // Canvas references
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawingRef = useRef(false);
    
    // History for undo/redo
    const canvasHistoryRef = useRef<string[]>([]);
    const historyIndexRef = useRef(-1);

    // Save canvas state to history
    const saveCanvasState = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const dataURL = canvas.toDataURL();
      const newHistory = canvasHistoryRef.current.slice(0, historyIndexRef.current + 1);
      newHistory.push(dataURL);
      canvasHistoryRef.current = newHistory;
      historyIndexRef.current = newHistory.length - 1;
      onSaveState();
    }, [onSaveState]);

    // Undo functionality
    const undo = () => {
      if (historyIndexRef.current > 0) {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const newIndex = historyIndexRef.current - 1;
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
        };
        img.src = canvasHistoryRef.current[newIndex];
        historyIndexRef.current = newIndex;
      }
    };

    // Redo functionality
    const redo = () => {
      if (historyIndexRef.current < canvasHistoryRef.current.length - 1) {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const newIndex = historyIndexRef.current + 1;
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
        };
        img.src = canvasHistoryRef.current[newIndex];
        historyIndexRef.current = newIndex;
      }
    };

    // Clear canvas functionality
    const clear = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      saveCanvasState();
    };

    // Fill canvas with color
    const fillCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.fillStyle = selectedColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      saveCanvasState();
    };

    // Start drawing event
    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      if (selectedTool === 'fill') {
        fillCanvas();
        return;
      }
      
      isDrawingRef.current = true;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.strokeStyle = selectedTool === 'eraser' ? '#FFFFFF' : selectedColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.beginPath();
      ctx.moveTo(x, y);
    };
    
    // Continue drawing event
    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawingRef.current) return;
      
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.lineTo(x, y);
      ctx.stroke();
    };
    
    // Stop drawing event
    const stopDrawing = () => {
      if (isDrawingRef.current) {
        saveCanvasState();
      }
      isDrawingRef.current = false;
    };

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      canvas: canvasRef.current,
      undo,
      redo,
      clear,
    }));

    // Initialize canvas
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      canvas.width = 700;
      canvas.height = 700;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      saveCanvasState();
    }, [saveCanvasState]);

    return (
      <canvas
        ref={canvasRef}
        className="drawing-canvas"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
    );
  }
);

Canvas.displayName = 'Canvas';

export default Canvas;