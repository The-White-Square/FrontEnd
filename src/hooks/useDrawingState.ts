import { useState, useEffect } from 'react';
import type { ChatMessage, Player } from '../types/drawingTypes';

export function useDrawingState() {
  // Drawing state
  const [selectedColor, setSelectedColor] = useState('#FF0000');
  const [brushSize, setBrushSize] = useState(5);
  const [selectedTool, setSelectedTool] = useState<'brush' | 'eraser' | 'fill'>('brush');
  
  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  
  // Players state
  const [players] = useState<Player[]>([
    { id: '1', username: 'You', avatar: '/avatars/avatar1.png' },
    { id: '2', username: 'Player2', avatar: '/avatars/avatar2.png' }
  ]);
  
  // Responsive state
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  
  // Colors palette
  const colors = [
    '#FF0000', '#FFA500', '#FFFF00', '#00FF00',
    '#00FFFF', '#0000FF', '#FF00FF', '#8B4513',
    '#000000', '#FFFFFF'
  ];
  
  // Screen size detection
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth <= 900);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  // Send chat message
  const sendMessage = () => {
    if (!chatInput.trim()) return;
    
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      playerId: '1',
      message: chatInput,
      timestamp: new Date(),
      isGuess: true
    };
    
    setChatMessages(prev => [...prev, newMessage]);
    setChatInput('');
  };

  return {
    // Drawing tool state
    selectedColor,    // Current color
    setSelectedColor, // Color setter
    brushSize,        // Current brush size
    setBrushSize,     // Brush size setter
    selectedTool,     // Current tool
    setSelectedTool,  // Tool setter
    colors,           // Color palette
    
    // Chat functionality
    chatMessages,     // Message history
    chatInput,        // Input field value
    setChatInput,     // Input setter
    sendMessage,      // Send message function
    
    // Game data
    players,          // Player list
    isSmallScreen,    // Screen size flag
  };
}