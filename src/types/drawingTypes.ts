/**
 * Type Definitions for Drawing Game
 * 
 * This file contains all TypeScript interfaces and types used throughout
 * the Co-opy drawing game application for type safety and code clarity.
 */

/**
 * Represents a player in the drawing game
 */
export interface Player {
  id: string;        // Unique identifier for the player
  username: string;  // Display name chosen by the player
  avatar: string;    // Path to the player's selected avatar image
}

/**
 * Represents a chat message in the game
 */
export interface ChatMessage {
  id: string;          // Unique message identifier
  playerId: string;    // ID of the player who sent the message
  message: string;     // The actual message content
  timestamp: Date;     // When the message was sent
  isGuess?: boolean;   // Optional: true if this is a guess attempt
}

/**
 * Available drawing tools in the canvas
 */
export type ToolType = 'brush' | 'eraser' | 'fill';

/**
 * Current state of the drawing interface
 */
export interface DrawingState {
  isDrawing: boolean;     // Whether user is currently drawing
  selectedColor: string;  // Current selected color (hex format)
  brushSize: number;      // Current brush size (1-60 pixels)
  selectedTool: ToolType; // Currently active drawing tool
}

/**
 * Canvas history system for undo/redo functionality
 */
export interface CanvasHistory {
  history: string[];  // Array of canvas states as data URLs
  index: number;      // Current position in history (-1 if no history)
}