/**
 * Home Page Component
 * 
 * The main landing page for the Co-opy drawing game.
 * Features a logo, action buttons for creating/joining rooms,
 * avatar selection, and floating controls. Includes modal
 * management for user interactions.
 */

import BackgroundLayers from './components/BackgroundLayers';
import MainContent from './components/MainContent';
import FloatingControls from './components/FloatingControls';
import ModalManager from './components/ModalManager';
import { useModalManager } from './hooks/useModalManager';
import { homeStyles } from './styles/homeStyles';
import { useEffect } from 'react';
import { useLobbyName } from './hooks/useLobbyName';

/**
 * Home page component with modal management
 * 
 * Renders the main game landing page with:
 * - Animated background layers
 * - Floating control buttons (sound, settings)
 * - Main content area with logo and action buttons
 * - Modal system for room creation, joining, and avatar selection
 */
function Home() {
  // Modal state management using custom hook
  const {
    openModal,          // Currently open modal type
    closing,            // Whether modal is closing (for animations)
    selectedAvatar,     // Selected avatar ID
    setSelectedAvatar,  // Function to update selected avatar
    handleClose,        // Function to close current modal
    openCreateModal,    // Function to open create room modal
    openJoinModal,      // Function to open join room modal
    openChooseModal,    // Function to open avatar selection modal
  } = useModalManager();

  const { setName } = useLobbyName('');

  useEffect(() => {
    setName('');
    setSelectedAvatar(0);
  }, []);

  return (
    <BackgroundLayers>
      {/* Floating controls (sound toggle, settings) */}
      <FloatingControls />
      
      {/* Main content area with logo and buttons */}
      <MainContent
        onCreateRoom={openCreateModal}    // Handler for create room button
        onJoinRoom={openJoinModal}        // Handler for join room button
        onChooseAvatar={openChooseModal}  // Handler for avatar selection button
      />
      
      {/* Modal system for user interactions */}
      <ModalManager
        openModal={openModal}             // Current modal type
        closing={closing}                 // Animation state
        onClose={handleClose}             // Close handler
        selectedAvatar={selectedAvatar}   // Selected avatar state
        setSelectedAvatar={setSelectedAvatar} // Avatar selection handler
      />
      
      {/* Inject responsive styles for this page */}
      <style>{homeStyles}</style>
    </BackgroundLayers>
  );
}

export default Home