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
 * @returns Object containing carousel state and navigation functions
 */
export const useAvatarCarousel = (
  setSelectedAvatar: (id: number) => void
) => {
  // Index of the avatar currently in the center position (0-based)
  const [currentCenterIndex, setCurrentCenterIndex] = useState(0);
  
  // Whether the carousel is currently animating between positions
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Generate all available avatar paths
  const avatars = generateAvatars();
  const totalAvatars = avatars.length;

  /**
   * Auto-select the center avatar whenever the center position changes
   * This ensures the highlighted avatar is always the one in the center
   */
  useEffect(() => {
    // Convert 0-based index to 1-based ID for avatar selection
    setSelectedAvatar(currentCenterIndex + 1);
  }, [currentCenterIndex, setSelectedAvatar]);

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

  /**
   * Navigate to the next avatar (right arrow)
   * 
   * Includes smooth transition animation and wraps around to the beginning
   * when reaching the end of the avatar list.
   */
  const nextAvatar = () => {
    setIsTransitioning(true);  // Start transition animation
    
    setTimeout(() => {
      // Move to next avatar with wraparound
      setCurrentCenterIndex((prev: number) => (prev + 1) % totalAvatars);
      
      // End transition animation after a brief delay
      setTimeout(() => setIsTransitioning(false), 50);
    }, 80);  // Brief delay for smooth visual transition
  };

  /**
   * Navigate to the previous avatar (left arrow)
   * 
   * Includes smooth transition animation and wraps around to the end
   * when reaching the beginning of the avatar list.
   */
  const prevAvatar = () => {
    setIsTransitioning(true);  // Start transition animation
    
    setTimeout(() => {
      // Move to previous avatar with wraparound
      // Adding totalAvatars before modulo ensures positive result
      setCurrentCenterIndex((prev: number) => (prev - 1 + totalAvatars) % totalAvatars);
      
      // End transition animation after a brief delay
      setTimeout(() => setIsTransitioning(false), 50);
    }, 80);  // Brief delay for smooth visual transition
  };

  /**
   * Manually select the current center avatar
   * 
   * This is called when the user clicks on the center avatar image.
   * Redundant in current implementation since center avatar is auto-selected,
   * but useful for explicit selection interactions.
   */
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