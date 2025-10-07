// Avatar Modal Style Constants
export const AVATAR_STYLES = {
  // Modal dimensions
  MODAL: {
    minWidth: '800px',
    maxWidth: '950px',
    minHeight: '500px',
    padding: '40px',
    borderRadius: '30px',
  },
  
  // Colors
  COLORS: {
    modalBackground: '#FFC892',
    modalBorder: '#FFB042',
    titleBackground: '#FF962C',
    titleBorder: '#DE5C00',
    titleText: '#FFE9A1',
    arrowBackground: '#FF962C',
    arrowBorder: '#DE5C00',
    arrowText: '#FFE9A1',
    inputBorder: '#FFB042',
    inputFocusBorder: '#FF9500',
    inputBackground: 'rgba(255, 255, 255, 0.95)',
    inputText: '#2D1810',
    selectedBorder: '#FF9500',
    centerBorder: '#FFB042',
    sideBorder: 'rgba(255, 255, 255, 0.5)',
    avatarBackground: '#FFE5C4',
    buttonActive: '#FEC65F',
    buttonInactive: 'rgba(139, 69, 19, 0.3)',
    buttonTextActive: '#DA6804',
    buttonTextInactive: 'rgba(139, 69, 19, 0.6)',
    buttonBorderActive: '#FF9500',
    buttonBorderInactive: 'rgba(139, 69, 19, 0.2)',
    closeButton: 'rgba(139, 69, 19, 0.8)',
  },
  
  // Sizes
  SIZES: {
    centerAvatar: '160px',
    sideAvatar: '120px',
    arrowButton: '42px',
    closeButton: '30px',
    inputWidth: '300px',
  },
  
  // Font sizes
  FONTS: {
    title: '32px',
    arrow: '24px',
    input: '18px',
    button: '24px',
    close: '18px',
  },

  // Responsive font sizes (for CSS media queries)
  RESPONSIVE_FONTS: {
    default: {
      title: '32px',
      arrow: '24px',
      input: '18px',
      button: '24px',
      close: '18px',
    },
    medium: {
      title: '28px',
      arrow: '22px',
      input: '17px',
      button: '22px',
      close: '16px',
    },
    small: {
      title: '24px',
      arrow: '20px',
      input: '16px',
      button: '20px',
      close: '14px',
    },
    mobile: {
      title: '22px',
      arrow: '18px',
      input: '16px',
      button: '20px',
      close: '14px',
    },
    tiny: {
      title: '20px',
      arrow: '16px',
      input: '15px',
      button: '18px',
      close: '12px',
    },
  },
  
  // Shadows
  SHADOWS: {
    modal: '0 12px 40px rgba(0,0,0,0.4)',
    titleBlock: '0 4px 8px rgba(0,0,0,0.2)',
    arrow: '0 4px 8px rgba(0,0,0,0.2)',
    input: '0 4px 8px rgba(0,0,0,0.1)',
    inputFocus: '0 4px 12px rgba(255, 149, 0, 0.3)',
    selectedAvatar: '0 6px 16px rgba(255, 149, 0, 0.4)',
    centerAvatar: '0 6px 16px rgba(0,0,0,0.3)',
    sideAvatar: '0 2px 8px rgba(0,0,0,0.1)',
    buttonActive: '0 4px 8px rgba(255, 149, 0, 0.3)',
    closeButton: '0 2px 4px rgba(0,0,0,0.2)',
  },
  
  // Opacity values
  OPACITY: {
    titleBlock: 0.73,
    centerAvatar: 1,
    sideAvatar: 0.6,
    buttonActive: 1,
    buttonInactive: 0.6,
  },
  
  // Transforms
  TRANSFORMS: {
    centerScale: 'scale(1)',
    sideScale: 'scale(0.85)',
  },
} as const;

// Avatar configuration - Shows 3 avatars in carousel
export const AVATAR_CONFIG = {
  TOTAL_AVATARS: 37,
  VISIBLE_COUNT: 3,
  CENTER_INDEX: 1, // Middle avatar (0, 1, 2)
} as const;