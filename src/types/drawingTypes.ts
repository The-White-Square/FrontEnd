export interface Player {
  id: string;
  username: string;
  avatar: string;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  message: string;
  timestamp: Date;
  isGuess?: boolean;
}

export type ToolType = 'brush' | 'eraser' | 'fill';

export interface DrawingState {
  isDrawing: boolean;
  selectedColor: string;
  brushSize: number;
  selectedTool: ToolType;
}

export interface CanvasHistory {
  history: string[];
  index: number;
}