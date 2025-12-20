/**
 * Drawing State Hook
 *
 * Custom React hook that manages all state related to the drawing game page.
 * This includes drawing tools, chat functionality, player data, and responsive
 * layout detection. Centralizes state management for the main game interface.
 */

import {useState, useEffect, useRef} from 'react';
import type { ChatMessage, Player } from '../types/drawingTypes';
import LobbyHubClient from '../services/lobbyHub';

/**
 * Hook for managing drawing game state
 *
 * @param lobbyId - The lobby ID
 * @param currentPlayerName - The current player's name
 * @param initialPlayers - Optional initial players from lobby navigation state
 * @returns Object containing all drawing game state and functions
 */
export function useDrawingState(
    lobbyId: string,
    currentPlayerName: string,
    initialPlayers?: Array<{ id?: string; displayName: string; iconId?: number }>
) {
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

  // Player lookup map: playerName -> iconId
  const [playerMap, setPlayerMap] = useState<Map<string, number>>(() => {
    // Initialize playerMap from initialPlayers if provided
    const map = new Map<string, number>();
    if (initialPlayers && Array.isArray(initialPlayers)) {
      initialPlayers.forEach(p => {
        if (p.displayName && p.iconId) {
          map.set(p.displayName, p.iconId);
        }
      });
    }
    return map;
  });

  // Real player data for display
  const [players, setPlayers] = useState<Player[]>(() => {
    // Initialize players from initialPlayers if provided
    if (initialPlayers && Array.isArray(initialPlayers)) {
      return initialPlayers.map(p => ({
        id: p.iconId?.toString() || p.id || '0',
        username: p.displayName,
        avatar: `/avatars/avatar${p.iconId || 1}.png`
      }));
    }
    return [];
  });

  // Track the highest iconId we've seen for each player (to avoid downgrades)
  const playerIconIdTracker = new Map<string, number>();

  // Use ref to track playerMap for event handlers
  const playerMapRef = useRef<Map<string, number>>(playerMap);

  // Update ref whenever playerMap changes
  useEffect(() => {
    playerMapRef.current = playerMap;
  }, [playerMap]);

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
    let hasJoined = false; // Track if we've already joined this lobby

    const handleHubMessage = (message: string, playerName: string) => {
      // guard in case the hook unmounted
      if (!mounted) return;

      // Look up the iconId from the playerMap ref
      const iconId = playerMapRef.current.get(playerName) || 1;

      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        playerId: iconId.toString(),
        message: message,
        timestamp: new Date(),
        isGuess: true
      };

      setChatMessages(prev => [...prev, newMessage]);
    };

    const handlePlayerJoined = (lobbyId: string, playerName: string, iconId: number) => {
      if (!mounted) return;

      // Only update if this is a valid iconId (> 0) and higher than what we've seen
      const currentIconId = playerIconIdTracker.get(playerName) || 0;

      // Skip if iconId is 0 or lower than what we already have
      if (iconId <= 0 || iconId < currentIconId) {
        console.debug('[useDrawingState] Skipping iconId update for', playerName, 'from', currentIconId, 'to', iconId);
        return;
      }

      // Track the highest iconId we've seen for this player
      playerIconIdTracker.set(playerName, iconId);

      // Add player to the map
      setPlayerMap(prev => new Map(prev).set(playerName, iconId));

      // Add player to the display list
      setPlayers(prev => {
        // Check if player already exists
        const existingIndex = prev.findIndex(p => p.username === playerName);

        if (existingIndex !== -1) {
          // Update existing player with new iconId
          const updated = [...prev];
          updated[existingIndex] = {
            id: iconId.toString(),
            username: playerName,
            avatar: `/avatars/avatar${iconId}.png`
          };
          return updated;
        }

        // Add new player
        return [...prev, {
          id: iconId.toString(),
          username: playerName,
          avatar: `/avatars/avatar${iconId}.png`
        }];
      });
    };

    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth <= 900);
    };

    // Register handlers and start connection
    (async () => {
      if (hasJoined) return; // Prevent multiple joins

      try {
        // Register the message handler
        LobbyHubClient.onReceiveMessageHandler(handleHubMessage);

        // Register the player joined handler (for new players joining after us)
        LobbyHubClient.onPlayerJoinedHandler((lobbyIdParam: string, playerName: string, iconId: number) => {
          if (!mounted) return;
          // Only trust iconId if it's greater than 0 (valid)
          if (iconId > 0) {
            handlePlayerJoined(lobbyIdParam, playerName, iconId);
          }
        });

        // Start connection
        await LobbyHubClient.start();

        // Join the lobby only once
        if (lobbyId && !hasJoined) {
          hasJoined = true; // Mark as joined before the call

          try {
            const currentAvatarId = parseInt(sessionStorage.getItem('avatarId') || '1', 10);

            // Add current player to lobby
            await LobbyHubClient.addPlayerToLobby(lobbyId, currentPlayerName, currentAvatarId);

            // Fetch actual player list from REST API to get correct iconIds
            const playersResponse = await fetch(`${import.meta.env.VITE_API_URL || 'https://localhost:7179'}/lobby/${lobbyId}/players`, {
              method: 'GET',
              credentials: 'include'
            });

            if (playersResponse.ok) {
              const playersData = await playersResponse.json();
              // playersData should be array of { id, displayName, iconId }
              if (Array.isArray(playersData)) {
                playersData.forEach((player: any) => {
                  const name = player.displayName || player.username || player.name;
                  const icon = player.iconId || 1;
                  if (name) {
                    handlePlayerJoined(lobbyId, name, icon);
                  }
                });
              }
            }
          } catch (err) {
            hasJoined = false; // Reset on error so it can retry
            console.warn('[hub] setup failed', err);
          }
        }
      } catch (err) {
        hasJoined = false; // Reset on error
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
  }, [lobbyId, currentPlayerName]); // Removed playerMap from dependencies

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