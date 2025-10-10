import { useRef, useEffect } from 'react';
import type { ChatMessage, Player } from '../types/drawingTypes';

interface ChatWindowProps {
  messages: ChatMessage[];
  players: Player[];
}

const ChatWindow = ({ messages, players }: ChatWindowProps) => {
  const chatMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="chat-messages" ref={chatMessagesRef}>
      {messages.map(message => {
        const player = players.find(p => p.id === message.playerId);
        return (
          <div key={message.id} className="chat-message">
            <img src={player?.avatar} alt={player?.username} className="message-avatar" />
            <div className="message-content">
              <div className="message-username">{player?.username}</div>
              <div className="message-text">{message.message}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChatWindow;