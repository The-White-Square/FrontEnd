/**
 * Drawing State Hook
 * 
 * Custom React hook that manages all state related to the drawing game page.
 * This includes drawing tools, chat functionality, player data, and responsive
 * layout detection. Centralizes state management for the main game interface.
 */

import { useState, useEffect } from 'react';
import type { ChatMessage, Player } from '../types/drawingTypes';

/**
 * Hook for managing drawing game state
 * 
 * @returns Object containing all drawing game state and functions
 */
export function useDrawingState() {
  // === Drawing Tool State ===
  
  // Currently selected color for drawing (hex format)
  const [selectedColor, setSelectedColor] = useState('#FF0000');
  
  // Current brush size (1-60 pixels)
  const [brushSize, setBrushSize] = useState(5);
  
  // Currently active drawing tool
  const [selectedTool, setSelectedTool] = useState<'brush' | 'eraser' | 'fill'>('brush');
  
  // === Chat System State ===
  
  // Array of all chat messages in the current game
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  
  // Current text in the chat input field
  const [chatInput, setChatInput] = useState('');
  
  // === Game Players ===
  
  // Mock player data - in a real game, this would come from a server
  const [players] = useState<Player[]>([
    { id: '1', username: 'You', avatar: '/avatars/avatar1.png' },
    { id: '2', username: 'Player2', avatar: '/avatars/avatar2.png' }
  ]);
  
  // === Responsive Layout ===
  
  // Whether the current screen size is considered "small" (affects UI layout)
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  
  // === Drawing Color Palette ===
  
  // Available colors for drawing - covers basic spectrum plus black/white
  const colors = [
    '#FF0000', // Red
    '#FFA500', // Orange  
    '#FFFF00', // Yellow
    '#00FF00', // Green
    '#00FFFF', // Cyan
    '#0000FF', // Blue
    '#FF00FF', // Magenta
    '#8B4513', // Brown
    '#000000', // Black
    '#FFFFFF'  // White
  ];
  
  // === Screen Size Detection ===
  
  /**
   * Set up responsive breakpoint detection
   * 
   * Monitors window resize events and updates the isSmallScreen flag
   * when the viewport width crosses the 900px threshold.
   */
  useEffect(() => {
    /**
     * Check current screen size and update state
     */
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth <= 900);
    };
    
    // Check initial screen size
    checkScreenSize();
    
    // Listen for window resize events
    window.addEventListener('resize', checkScreenSize);
    
    // Cleanup listener on component unmount
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  // === Chat Functions ===
  
  /**
   * Send a new chat message
   * 
   * Creates a new message from the current input text and adds it
   * to the message history. Clears the input field after sending.
   */
  const sendMessage = () => {
    // Don't send empty messages
    if (!chatInput.trim()) return;
    
    // Create new message object
    const newMessage: ChatMessage = {
      id: Date.now().toString(), // Simple ID generation
      playerId: '1',             // Current player ID
      message: chatInput,        // Message content
      timestamp: new Date(),     // Current timestamp
      isGuess: true             // Mark as a guess attempt
    };
    
    // Add message to history
    setChatMessages(prev => [...prev, newMessage]);
    
    // Clear input field
    setChatInput('');
  };

  // === Return Hook Interface ===
  
  return {
    // Drawing tool state and controls
    selectedColor,    // Current selected color
    setSelectedColor, // Function to change color
    brushSize,        // Current brush size
    setBrushSize,     // Function to change brush size
    selectedTool,     // Current drawing tool
    setSelectedTool,  // Function to change tool
    colors,           // Available color palette
    
    // Chat system
    chatMessages,     // Array of all messages
    chatInput,        // Current input text
    setChatInput,     // Function to update input
    sendMessage,      // Function to send message
    
    // Game and layout data
    players,          // Array of game players
    isSmallScreen,    // Responsive layout flag
  };
}