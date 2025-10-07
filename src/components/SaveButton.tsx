import React from 'react';
import ExpandButton from './ExpandButton';
import { AVATAR_STYLES } from '../constants/avatarConstants';

interface SaveButtonProps {
  username: string;
  selectedAvatar: number | null;
  onSave: () => void;
  className?: string;
}

const SaveButton: React.FC<SaveButtonProps> = ({ username, selectedAvatar, onSave, className }) => {
  const isEnabled = username.trim() && selectedAvatar;

  return (
    <div style={{ textAlign: 'center' }}>
      <ExpandButton
        onClick={isEnabled ? onSave : undefined}
        className={className}
        style={{
          padding: '16px 40px',
          background: isEnabled 
            ? AVATAR_STYLES.COLORS.buttonActive
            : AVATAR_STYLES.COLORS.buttonInactive,
          color: isEnabled 
            ? AVATAR_STYLES.COLORS.buttonTextActive 
            : AVATAR_STYLES.COLORS.buttonTextInactive,
          border: isEnabled 
            ? `2px solid ${AVATAR_STYLES.COLORS.buttonBorderActive}` 
            : `2px solid ${AVATAR_STYLES.COLORS.buttonBorderInactive}`,
          borderRadius: '20px',
          fontFamily: "'Jersey 25', sans-serif",
          cursor: isEnabled ? 'pointer' : 'not-allowed',
          fontWeight: 'normal',
          boxShadow: isEnabled ? AVATAR_STYLES.SHADOWS.buttonActive : 'none',
          opacity: isEnabled ? AVATAR_STYLES.OPACITY.buttonActive : AVATAR_STYLES.OPACITY.buttonInactive
        }}
      >
        Save
      </ExpandButton>
    </div>
  );
};

export default SaveButton;