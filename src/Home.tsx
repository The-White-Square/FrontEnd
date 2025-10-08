import BackgroundLayers from './components/BackgroundLayers';
import MainContent from './components/MainContent';
import FloatingControls from './components/FloatingControls';
import ModalManager from './components/ModalManager';
import { useModalManager } from './hooks/useModalManager';
import { homeStyles } from './styles/homeStyles';

function Home() {
  // Modal management
  const {
    openModal,
    closing,
    selectedAvatar,
    setSelectedAvatar,
    handleClose,
    openCreateModal,
    openJoinModal,
    openChooseModal,
  } = useModalManager();

  return (
    <BackgroundLayers>
      <FloatingControls />
      <MainContent
        onCreateRoom={openCreateModal}
        onJoinRoom={openJoinModal}
        onChooseAvatar={openChooseModal}
      />
      
      <ModalManager
        openModal={openModal}
        closing={closing}
        onClose={handleClose}
        selectedAvatar={selectedAvatar}
        setSelectedAvatar={setSelectedAvatar}
      />
      
      <style>{homeStyles}</style>
    </BackgroundLayers>
  );
}

export default Home