import { floatingIconButtonStyle } from '../styles/buttonStyles';

interface FloatingIconButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  ariaLabel?: string;
}

function FloatingIconButton({
  onClick,
  children,
  ariaLabel,
}: FloatingIconButtonProps) {
  return (
    <button style={floatingIconButtonStyle} onClick={onClick} aria-label={ariaLabel}>
      {children}
    </button>
  );
}

export default FloatingIconButton;