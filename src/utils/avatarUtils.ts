/**
 * Avatar Utility Functions
 * 
 * Utility functions for handling avatar generation and carousel logic.
 * These functions manage the avatar selection system and path generation.
 */

import { AVATAR_CONFIG } from '../constants/avatarConstants';

/**
 * Generate avatar file paths for all available avatars
 * 
 * Creates an array of paths pointing to avatar images in the public/avatars folder.
 * Avatar files are expected to be named avatar1.png, avatar2.png, etc.
 * 
 * @returns Array of avatar image paths
 */
export const generateAvatars = (): string[] => {
  return Array.from({ length: AVATAR_CONFIG.TOTAL_AVATARS }, (_, i) => {
    const avatarNumber = i + 1;  // Avatar numbering starts from 1
    return `/avatars/avatar${avatarNumber}.png`;
  });
};

/**
 * Calculate which avatar indices should be visible in the carousel
 * 
 * Given a center avatar index, this function calculates which avatars
 * should be shown to the left and right of it. Handles wrapping around
 * the ends of the avatar array (circular carousel).
 * 
 * @param centerIndex - Index of the avatar that should be in the center
 * @param totalAvatars - Total number of available avatars
 * @returns Array of indices for visible avatars [left, center, right]
 */
export const getVisibleIndices = (centerIndex: number, totalAvatars: number): number[] => {
  const indices = [];
  // Calculate how many avatars to show on each side of center
  const halfVisible = Math.floor(AVATAR_CONFIG.VISIBLE_COUNT / 2);
  
  // Generate indices from left to right around the center
  for (let i = -halfVisible; i <= halfVisible; i++) {
    // Use modulo to handle wrapping (e.g., going from last avatar back to first)
    const index = (centerIndex + i + totalAvatars) % totalAvatars;
    indices.push(index);
  }
  return indices;
};

/**
 * Avatar item interface for carousel display
 * 
 * Represents a single avatar item with its image path and unique ID.
 */
export interface AvatarItem {
  avatar: string;  // Path to the avatar image file
  id: number;      // Unique identifier (1-based numbering)
}