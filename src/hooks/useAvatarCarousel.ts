import { useState, useEffect } from 'react';
import { generateAvatars, getVisibleIndices } from '../utils/avatarUtils';
import type { AvatarItem } from '../utils/avatarUtils';

export const useAvatarCarousel = (
  setSelectedAvatar: (id: number) => void
) => {
  const [currentCenterIndex, setCurrentCenterIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const avatars = generateAvatars();
  const totalAvatars = avatars.length;

  // Auto-select the center avatar whenever it changes
  useEffect(() => {
    setSelectedAvatar(currentCenterIndex + 1);
  }, [currentCenterIndex, setSelectedAvatar]);

  const getVisibleAvatars = (): AvatarItem[] => {
    const visibleIndices = getVisibleIndices(currentCenterIndex, totalAvatars);
    return visibleIndices.map(index => ({ 
      avatar: avatars[index], 
      id: index + 1 
    }));
  };

  const nextAvatar = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentCenterIndex((prev: number) => (prev + 1) % totalAvatars);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 80);
  };

  const prevAvatar = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentCenterIndex((prev: number) => (prev - 1 + totalAvatars) % totalAvatars);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 80);
  };

  const selectCurrentAvatar = () => {
    setSelectedAvatar(currentCenterIndex + 1);
  };

  return {
    currentCenterIndex,
    getVisibleAvatars,
    nextAvatar,
    prevAvatar,
    selectCurrentAvatar,
    isTransitioning,
  };
};