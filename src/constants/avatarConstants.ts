/**
 * Avatar Modal Style Constants
 * 
 * Comprehensive styling constants for the avatar selection modal.
 * These constants provide a centralized way to manage the modal's
 * appearance across different screen sizes and states.
 */

// Main avatar modal style configuration
export const AVATAR_STYLES = {
  // Modal container dimensions
  MODAL: {
    minWidth: '800px',      // Minimum modal width
    maxWidth: '950px',      // Maximum modal width
    minHeight: '500px',     // Minimum modal height
    padding: '40px',        // Internal padding
    borderRadius: '30px',   // Rounded corners
  },
  
  // Color scheme for the modal (warm orange/brown theme)
  COLORS: {
    // Modal container colors
    modalBackground: '#FFC892',           // Light orange background
    modalBorder: '#FFB042',               // Orange border
    
    // Title section colors
    titleBackground: '#FF962C',           // Darker orange for title
    titleBorder: '#DE5C00',              // Dark orange border
    titleText: '#FFE9A1',                // Light cream text
    
    // Navigation arrow colors
    arrowBackground: '#FF962C',           // Same as title background
    arrowBorder: '#DE5C00',              // Same as title border
    arrowText: '#FFE9A1',                // Same as title text
    
    // Input field colors
    inputBorder: '#FFB042',               // Normal border color
    inputFocusBorder: '#FF9500',         // Border when focused
    inputBackground: 'rgba(255, 255, 255, 0.95)', // Semi-transparent white
    inputText: '#2D1810',                // Dark brown text
    
    // Avatar selection colors
    selectedBorder: '#FF9500',            // Highlighted selected avatar
    centerBorder: '#FFB042',             // Center avatar border
    sideBorder: 'rgba(255, 255, 255, 0.5)', // Side avatar borders
    avatarBackground: '#FFE5C4',         // Avatar container background
    
    // Button states
    buttonActive: '#FEC65F',             // Enabled button background
    buttonInactive: 'rgba(139, 69, 19, 0.3)', // Disabled button background
    buttonTextActive: '#DA6804',         // Enabled button text
    buttonTextInactive: 'rgba(139, 69, 19, 0.6)', // Disabled button text
    buttonBorderActive: '#FF9500',       // Enabled button border
    buttonBorderInactive: 'rgba(139, 69, 19, 0.2)', // Disabled button border
    
    // Close button
    closeButton: 'rgba(139, 69, 19, 0.8)', // Semi-transparent dark brown
  },
  
  // Element dimensions
  SIZES: {
    centerAvatar: '160px',    // Main (center) avatar size
    sideAvatar: '120px',      // Side avatar size
    arrowButton: '42px',      // Navigation arrow button size
    closeButton: '30px',      // Close button size
    inputWidth: '300px',      // Username input width
  },
  
  // Typography sizes
  FONTS: {
    title: '32px',     // Modal title font size
    arrow: '24px',     // Arrow icon font size
    input: '18px',     // Input field font size
    button: '24px',    // Button font size
    close: '18px',     // Close button font size
  },

  // Responsive font sizes for different screen sizes
  // Used in CSS media queries for adaptive design
  RESPONSIVE_FONTS: {
    default: {
      title: '32px', arrow: '24px', input: '18px', button: '24px', close: '18px',
    },
    medium: {
      title: '28px', arrow: '22px', input: '17px', button: '22px', close: '16px',
    },
    small: {
      title: '24px', arrow: '20px', input: '16px', button: '20px', close: '14px',
    },
    mobile: {
      title: '22px', arrow: '18px', input: '16px', button: '20px', close: '14px',
    },
    tiny: {
      title: '20px', arrow: '16px', input: '15px', button: '18px', close: '12px',
    },
  },
  
  // Box shadow effects for depth and focus
  SHADOWS: {
    modal: '0 12px 40px rgba(0,0,0,0.4)',           // Main modal shadow
    titleBlock: '0 4px 8px rgba(0,0,0,0.2)',        // Title section shadow
    arrow: '0 4px 8px rgba(0,0,0,0.2)',             // Arrow button shadow
    input: '0 4px 8px rgba(0,0,0,0.1)',             // Input field shadow
    inputFocus: '0 4px 12px rgba(255, 149, 0, 0.3)', // Input focus glow
    selectedAvatar: '0 6px 16px rgba(255, 149, 0, 0.4)', // Selected avatar glow
    centerAvatar: '0 6px 16px rgba(0,0,0,0.3)',     // Center avatar shadow
    sideAvatar: '0 2px 8px rgba(0,0,0,0.1)',        // Side avatar shadow
    buttonActive: '0 4px 8px rgba(255, 149, 0, 0.3)', // Active button shadow
    closeButton: '0 2px 4px rgba(0,0,0,0.2)',       // Close button shadow
  },
  
  // Opacity levels for different states
  OPACITY: {
    titleBlock: 0.73,      // Slightly transparent title block
    centerAvatar: 1,       // Fully opaque center avatar
    sideAvatar: 0.6,       // Semi-transparent side avatars
    buttonActive: 1,       // Fully opaque active buttons
    buttonInactive: 0.6,   // Semi-transparent inactive buttons
  },
  
  // Transform effects for avatar scaling
  TRANSFORMS: {
    centerScale: 'scale(1)',      // No scaling for center avatar
    sideScale: 'scale(0.85)',     // Slightly smaller side avatars
  },
} as const;

/**
 * Avatar Carousel Configuration
 * 
 * Settings that control the avatar selection carousel behavior.
 */
export const AVATAR_CONFIG = {
  TOTAL_AVATARS: 37,    // Total number of available avatars
  VISIBLE_COUNT: 3,     // Number of avatars visible at once (left, center, right)
  CENTER_INDEX: 1,      // Index of the center avatar in visible array (0, 1, 2)
} as const;