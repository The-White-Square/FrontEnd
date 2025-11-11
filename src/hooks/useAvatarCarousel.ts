/**
 * Avatar Carousel Hook
 *
 * Custom React hook that manages the avatar selection carousel logic.
 * Handles navigation between avatars, automatic selection, and smooth
 * transition animations.
 */

import { useState, useEffect } from 'react';
import { generateAvatars, getVisibleIndices } from '../utils/avatarUtils';
import type { AvatarItem } from '../utils/avatarUtils';

/**
 * Hook for managing avatar carousel state and navigation
 *
 * @param setSelectedAvatar - Callback to update the selected avatar in parent component
 * @param initialSelectedId - optional 1-based avatar id to initialize & sync carousel center
 * @returns Object containing carousel state and navigation functions
 */
export const useAvatarCarousel = (
  setSelectedAvatar: (id: number) => void,
  initialSelectedId?: number | null
) => {
  // Generate all available avatar paths
  const avatars = generateAvatars();
  const totalAvatars = avatars.length;

  // Index of the avatar currently in the center position (0-based),
  // initialize from initialSelectedId if provided and valid
  const [currentCenterIndex, setCurrentCenterIndex] = useState<number>(() => {
    if (typeof initialSelectedId === 'number' && initialSelectedId >= 1 && initialSelectedId <= totalAvatars) {
      return initialSelectedId - 1;
    }
    return 0;
  });

  // Whether the carousel is currently animating between positions
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Auto-select the center avatar whenever the center position changes
  useEffect(() => {
    // Convert 0-based index to 1-based ID for avatar selection
    setSelectedAvatar(currentCenterIndex + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCenterIndex]);

  // Sync when parent selected avatar changes (e.g. from localStorage / modal manager)
  useEffect(() => {
    if (typeof initialSelectedId === 'number' && initialSelectedId >= 1 && initialSelectedId <= totalAvatars) {
      const desiredIndex = initialSelectedId - 1;
      setCurrentCenterIndex(desiredIndex);
    }
    // only react to changes of initialSelectedId or totalAvatars
  }, [initialSelectedId, totalAvatars]);

  /**
   * Get the avatars that should be visible in the carousel
   *
   * @returns Array of avatar items for the current view (left, center, right)
   */
  const getVisibleAvatars = (): AvatarItem[] => {
    const visibleIndices = getVisibleIndices(currentCenterIndex, totalAvatars);
    return visibleIndices.map(index => ({
      avatar: avatars[index],  // Avatar image path
      id: index + 1           // 1-based ID for selection
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

  // Return all state and functions for use in components
  return {
    currentCenterIndex,    // Current center avatar index
    getVisibleAvatars,     // Get visible avatar data
    nextAvatar,           // Navigate right
    prevAvatar,           // Navigate left
    selectCurrentAvatar,  // Manually select center avatar
    isTransitioning,      // Animation state
  };
};