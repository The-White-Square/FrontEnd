interface ModalManagerProps {
  openModal: 'create' | 'join' | 'choose' | null;
  closing: boolean;
  onClose: () => void;
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
  selectedAvatar,
  setSelectedAvatar,
}: ModalManagerProps) {
  if (!openModal) return null;

  return (
    <ModalWrapper closing={closing} onClose={onClose}>
      {openModal === 'create' && (
        <CreateRoomModal
          onClose={onClose}
          selectedAvatar={selectedAvatar}
        />
      )}
      {openModal === 'join' && (
        <JoinRoomModal
          onClose={onClose}
          selectedAvatar={selectedAvatar}
        />
      )}
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