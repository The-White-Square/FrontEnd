import { useState } from 'react';
import type { ModalType } from '../constants/homeConstants';
import { MODAL_ANIMATION_DURATION } from '../constants/homeConstants';

export function useModalManager() {
  const [openModal, setOpenModal] = useState<ModalType>(null);
  const [closing, setClosing] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setOpenModal(null);
      setClosing(false);
    }, MODAL_ANIMATION_DURATION);
  };

  const openCreateModal = () => setOpenModal('create');
  const openJoinModal = () => setOpenModal('join');
  const openChooseModal = () => setOpenModal('choose');

  return {
    openModal,
    closing,
    selectedAvatar,
    setSelectedAvatar,
    handleClose,
    openCreateModal,
    openJoinModal,
    openChooseModal,
  };
}