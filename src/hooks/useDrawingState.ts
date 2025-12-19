 /**
 * Drawing State Hook
 * 
 * Custom React hook that manages all state related to the drawing game page.
 * This includes drawing tools, chat functionality, player data, and responsive
 * layout detection. Centralizes state management for the main game interface.
 */

import { useState, useEffect } from 'react';
import type { ChatMessage, Player } from '../types/drawingTypes';
import LobbyHubClient from '../services/lobbyHub';
/**
 * Hook for managing drawing game state
 * 
 * @returns Object containing all drawing game state and functions
 */
export function useDrawingState(lobbyId: string, currentPlayerName: string) {
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
    { id: sessionStorage.getItem('avatarId') || '0', username: 'You', avatar: '/avatars/avatar1.png' },
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
    let mounted = true;

    const handleHubMessage = (message: string, playerName: string) => {
      // guard in case the hook unmounted
      if (!mounted) return;

      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        playerId: playerName === currentPlayerName ? '1' : '2', // You might want better ID logic
        message: message,
        timestamp: new Date(),
        isGuess: true
      };

      setChatMessages(prev => [...prev, newMessage]);
    };

    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth <= 900);
    };

    // Register handler before starting the connection, then start and join lobby.
    (async () => {
      try {
        // register the handler first so incoming events have a callback ready
        LobbyHubClient.onReceiveMessageHandler(handleHubMessage);

        // start connection (await so errors surface)
        await LobbyHubClient.start();

        // ensure server knows this connection is in the lobby (so it receives LobbyMessage)
        if (lobbyId) {
          try {
            await LobbyHubClient.addPlayerToLobby(lobbyId, currentPlayerName);
          } catch (err) {
            // non-fatal, but log for debugging
            console.warn('[hub] addPlayerToLobby failed', err);
          }
        }
      } catch (err) {
        console.error('[hub] start failed', err);
      }
    })();

    // Check initial screen size and attach resize listener
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    // Cleanup on unmount
    return () => {
      mounted = false;
      window.removeEventListener('resize', checkScreenSize);
    };
  }, [lobbyId, currentPlayerName]);
  
  // === Chat Functions ===
  
  /**
   * Send a new chat message
   * 
   * Creates a new message from the current input text and adds it
   * to the message history.
   */
  const sendMessage = async () => {
    if (!chatInput.trim()) return;

    try {
      // Send via SignalR
      await LobbyHubClient.sendChatMessage(lobbyId, chatInput, currentPlayerName);

      // Clear input
      setChatInput('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
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