import React from 'react';
import ExpandButton from './ExpandButton';
import { AVATAR_STYLES } from '../constants/avatarConstants';

interface NavigationArrowProps {
  direction: 'left' | 'right';
  onClick: () => void;
  className?: string;
}

const NavigationArrow: React.FC<NavigationArrowProps> = ({ direction, onClick, className }) => {
  return (
    <ExpandButton
      onClick={onClick}
      className={className}
      style={{
        borderRadius: '50%',
        background: AVATAR_STYLES.COLORS.arrowBackground,
        border: `2px solid ${AVATAR_STYLES.COLORS.arrowBorder}`,
        color: AVATAR_STYLES.COLORS.arrowText,
        fontWeight: 'bold',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: AVATAR_STYLES.SHADOWS.arrow
      }}
    >
      {direction === 'left' ? '‹' : '›'}
    </ExpandButton>
  );
};

export default NavigationArrow;