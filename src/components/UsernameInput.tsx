import { AVATAR_STYLES } from '../constants/avatarConstants';

interface UsernameInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const UsernameInput = ({ value, onChange, className }: UsernameInputProps) => {
  return (
    <div style={{
      marginBottom: '25px',
      textAlign: 'center'
    }}>
      <input
        type="text"
        placeholder="Enter your username"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={className}
        style={{
          padding: '12px 20px',
          fontFamily: "'Jersey 25', sans-serif",
          border: `3px solid ${AVATAR_STYLES.COLORS.inputBorder}`,
          borderRadius: '15px',
          background: AVATAR_STYLES.COLORS.inputBackground,
          color: AVATAR_STYLES.COLORS.inputText,
          textAlign: 'center',
          outline: 'none',
          boxShadow: AVATAR_STYLES.SHADOWS.input
        }}
        onFocus={(e) => {
          e.target.style.borderColor = AVATAR_STYLES.COLORS.inputFocusBorder;
          e.target.style.boxShadow = AVATAR_STYLES.SHADOWS.inputFocus;
        }}
        onBlur={(e) => {
          e.target.style.borderColor = AVATAR_STYLES.COLORS.inputBorder;
          e.target.style.boxShadow = AVATAR_STYLES.SHADOWS.input;
        }}
      />
    </div>
  );
};

export default UsernameInput;