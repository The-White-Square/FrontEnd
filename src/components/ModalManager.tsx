interface ModalManagerProps {
  openModal: 'create' | 'join' | 'choose' | null;
  closing: boolean;
  onClose: () => void;
  roomCreated: boolean;
  setRoomCreated: (v: boolean) => void;
  selectedAvatar: number | null;
  setSelectedAvatar: (id: number) => void;
}

import CreateRoomModal from '../modals/CreateRoomModal';
import JoinRoomModal from '../modals/JoinRoomModal';
import ChooseAvatarModal from '../modals/ChooseAvatarModal';
import ModalWrapper from '../modals/ModalWrapper';

function ModalManager({
  openModal,
  closing,
  onClose,
  roomCreated,
  setRoomCreated,
  selectedAvatar,
  setSelectedAvatar,
}: ModalManagerProps) {
  if (!openModal) return null;

  return (
    <ModalWrapper closing={closing} onClose={onClose}>
      {openModal === 'create' && (
        <CreateRoomModal 
          roomCreated={roomCreated} 
          setRoomCreated={setRoomCreated}
          onClose={onClose}
        />
      )}
      {openModal === 'join' && <JoinRoomModal onClose={onClose} />}
      {openModal === 'choose' && (
        <ChooseAvatarModal 
          selectedAvatar={selectedAvatar}
          setSelectedAvatar={setSelectedAvatar}
          onClose={onClose}
        />
      )}
    </ModalWrapper>
  );
}

export default ModalManager;