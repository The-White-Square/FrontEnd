import ExpandButton from './ExpandButton';
import { AVATAR_STYLES, AVATAR_CONFIG } from '../constants/avatarConstants';
import type { AvatarItem } from '../utils/avatarUtils';

interface AvatarCarouselItemProps {
  item: AvatarItem;
  index: number;
  selectedAvatar: number | null;
  onSelect?: () => void;
}

const AvatarCarouselItem = ({
  item,
  index,
  selectedAvatar,
  onSelect,
}: AvatarCarouselItemProps) => {
  const isCenter = index === AVATAR_CONFIG.CENTER_INDEX;
  const opacity = isCenter ? AVATAR_STYLES.OPACITY.centerAvatar : AVATAR_STYLES.OPACITY.sideAvatar;

  return (
    <ExpandButton
      key={item.id}
      onClick={isCenter ? onSelect : undefined}
      className={isCenter ? 'center-avatar' : 'side-avatar'}
      style={{
        borderRadius: '50%',
        border: selectedAvatar === item.id 
          ? `4px solid ${AVATAR_STYLES.COLORS.selectedBorder}` 
          : isCenter 
            ? `3px solid ${AVATAR_STYLES.COLORS.centerBorder}`
            : `2px solid ${AVATAR_STYLES.COLORS.sideBorder}`,
        background: AVATAR_STYLES.COLORS.avatarBackground,
        cursor: isCenter ? 'pointer' : 'default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: selectedAvatar === item.id
          ? AVATAR_STYLES.SHADOWS.selectedAvatar
          : isCenter
            ? AVATAR_STYLES.SHADOWS.centerAvatar
            : AVATAR_STYLES.SHADOWS.sideAvatar,
        overflow: 'hidden',
        opacity: opacity,
        transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
        transform: isCenter ? AVATAR_STYLES.TRANSFORMS.centerScale : AVATAR_STYLES.TRANSFORMS.sideScale
      }}
    >
      <img 
        src={item.avatar} 
        alt={`Avatar ${item.id}`}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
      />
    </ExpandButton>
  );
};

export default AvatarCarouselItem;