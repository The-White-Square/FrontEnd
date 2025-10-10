/**
 * Modal Manager Hook
 * 
 * Custom React hook that manages modal state for the home page.
 * Handles opening/closing modals with smooth animations and tracks
 * the selected avatar across different modal interactions.
 */

import { useState } from 'react';
import type { ModalType } from '../constants/homeConstants';
import { MODAL_ANIMATION_DURATION } from '../constants/homeConstants';

/**
 * Hook for managing modal state and animations
 * 
 * @returns Object containing modal state and control functions
 */
export function useModalManager() {
  // Current open modal (null if no modal is open)
  const [openModal, setOpenModal] = useState<ModalType>(null);
  
  // Whether a modal is currently closing (for animation purposes)
  const [closing, setClosing] = useState(false);
  
  // Currently selected avatar ID (persists across modal opens/closes)
  const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null);

  /**
   * Close the current modal with animation
   * 
   * Sets closing state to trigger fade-out animation, then
   * actually closes the modal after the animation completes.
   */
  const handleClose = () => {
    setClosing(true);  // Start closing animation
    setTimeout(() => {
      setOpenModal(null);    // Actually close modal
      setClosing(false);     // Reset closing state
    }, MODAL_ANIMATION_DURATION);
  };

  // Modal opening functions - each sets the specific modal type
  const openCreateModal = () => setOpenModal('create');   // Create room modal
  const openJoinModal = () => setOpenModal('join');       // Join room modal
  const openChooseModal = () => setOpenModal('choose');   // Avatar selection modal

  // Return all state and functions for use in components
  return {
    // State
    openModal,         // Currently open modal type
    closing,           // Animation state
    selectedAvatar,    // Selected avatar ID
    
    // Setters
    setSelectedAvatar, // Update selected avatar
    
    // Actions
    handleClose,       // Close current modal
    openCreateModal,   // Open create room modal
    openJoinModal,     // Open join room modal
    openChooseModal,   // Open avatar selection modal
  };
}