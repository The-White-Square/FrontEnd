import { AVATAR_CONFIG } from '../constants/avatarConstants';

// Generate avatar imports for all avatars
export const generateAvatars = (): string[] => {
  return Array.from({ length: AVATAR_CONFIG.TOTAL_AVATARS }, (_, i) => {
    const avatarNumber = i + 1;
    return new URL(`../assets/avatars/avatar${avatarNumber}.png`, import.meta.url).href;
  });
};

// Calculate visible avatar indices for carousel
export const getVisibleIndices = (centerIndex: number, totalAvatars: number): number[] => {
  const indices = [];
  const halfVisible = Math.floor(AVATAR_CONFIG.VISIBLE_COUNT / 2);
  
  for (let i = -halfVisible; i <= halfVisible; i++) {
    const index = (centerIndex + i + totalAvatars) % totalAvatars;
    indices.push(index);
  }
  return indices;
};

// Avatar item type
export interface AvatarItem {
  avatar: string;
  id: number;
}