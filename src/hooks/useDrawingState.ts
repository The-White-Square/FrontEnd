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

export function useDrawingState(lobbyId: string, currentPlayerName: string, currentPlayerIconId: number) {
  const [selectedColor, setSelectedColor] = useState('#FF0000');
  const [brushSize, setBrushSize] = useState(5);
  const [selectedTool, setSelectedTool] = useState<'brush' | 'eraser' | 'fill'>('brush');

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');

  const [players, setPlayers] = useState<Player[]>([
    {
      id: currentPlayerName,
      username: currentPlayerName,
      avatar: new URL(`../assets/avatars/avatar${currentPlayerIconId}.png`, import.meta.url).toString(),
    }
  ]);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  const colors = [
    '#FF0000',
    '#FFA500',
    '#FFFF00',
    '#00FF00',
    '#00FFFF',
    '#0000FF',
    '#FF00FF',
    '#8B4513',
    '#000000',
    '#FFFFFF'
  ];

  useEffect(() => {
    let mounted = true;

    const handleHubMessage = (message: string, playerName: string) => {
      // guard in case the hook unmounted
      if (!mounted) return;

    LobbyHubClient.onPlayersStateHandler((playerData) => {
      if (!playerData) return;

      const playerList = Array.isArray(playerData) ? playerData : [];

      const updatedPlayers: Player[] = playerList.map((item: any) => {
        let name = '';
        let iconId = 1;

        if (typeof item === 'string') {
          name = item;
        } else if (item && typeof item === 'object') {
          name = item.displayName || item.username || item.name || '';
          const rawIcon = item.iconId || item.icon || item.IconId || item.Icon || 1;
          iconId = Number(rawIcon) || 1;
        }

        return {
          id: name,
          username: name,
          avatar: new URL(`../assets/avatars/avatar${currentPlayerIconId}.png`, import.meta.url).toString()
        };
      });

      setPlayers(updatedPlayers.length > 0 ? updatedPlayers : [
        {
          id: currentPlayerName,
          username: currentPlayerName,
          avatar: new URL(`../assets/avatars/avatar${currentPlayerIconId}.png`, import.meta.url).toString(),
        }
      ]);
    });

    LobbyHubClient.onReceiveMessageHandler((message, playerName, iconId) => {
      setPlayers(prev => {
        const exists = prev.some(p => p.id === playerName);
        if (!exists && playerName) {
          console.debug("Player not found");
          return [...prev, {
            id: playerName,
            username: playerName,
            avatar: new URL(`../assets/avatars/avatar${iconId}.png`, import.meta.url).toString(),
            iconId: iconId
          }];
        }
        console.debug("Player should be fine");
        return prev;
      });

      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        playerId: playerName,
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
      await LobbyHubClient.sendChatMessage(lobbyId, chatInput, currentPlayerName, currentPlayerIconId);
      setChatInput('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  return {
    selectedColor,
    setSelectedColor,
    brushSize,
    setBrushSize,
    selectedTool,
    setSelectedTool,
    colors,

    chatMessages,
    chatInput,
    setChatInput,
    sendMessage,

    players,
    isSmallScreen,
  };
}