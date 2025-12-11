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
    LobbyHubClient.start();

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
    });

    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth <= 900);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, [currentPlayerName, currentPlayerIconId]);

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