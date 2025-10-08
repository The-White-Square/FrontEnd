import React from 'react';
import { FaPaperPlane } from 'react-icons/fa';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ value, onChange, onSend }) => {
  // Handle Enter key press to send message
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSend();
    }
  };

  return (
    <div className="chat-input-wrapper">
      <div className="chat-input-container">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Rašyk čia..."
          className="chat-input"
        />
      </div>
      <button className="control-button send-button" onClick={onSend}>
        <FaPaperPlane />
      </button>
    </div>
  );
};

export default ChatInput;