import { useState } from 'react';
import ExpandButton from '../components/ExpandButton';
import AvatarCarouselItem from '../components/AvatarCarouselItem';
import NavigationArrow from '../components/NavigationArrow';
import UsernameInput from '../components/UsernameInput';
import SaveButton from '../components/SaveButton';
import { useAvatarCarousel } from '../hooks/useAvatarCarousel';
import { AVATAR_STYLES } from '../constants/avatarConstants';
import { useLobbyName } from "../hooks/useLobbyName";

type Props = {
  selectedAvatar: number | 0
  setSelectedAvatar: (id: number | 0) => void
  onClose?: () => void
  onSave?: (username: string, avatarId: number) => void
}

function ChooseAvatarModal({ selectedAvatar, setSelectedAvatar, onClose, onSave }: Props) {
    const { name: username, setName: setUsername } = useLobbyName('');

    const {
        getVisibleAvatars,
        nextAvatar,
        prevAvatar,
        selectCurrentAvatar,
        isTransitioning,
    } = useAvatarCarousel(setSelectedAvatar as (id:number) => void, selectedAvatar); // pass current selection here

    const handleSave = () => {
        if (username.trim() && selectedAvatar) {
            sessionStorage.setItem('avatarId', selectedAvatar.toString());

            if (onSave) {
                onSave(username.trim(), selectedAvatar);
            }
        }
        if (onClose) onClose();
    };

    return (
        <div className="avatar-modal" style={{
            background: AVATAR_STYLES.COLORS.modalBackground,
            border: `3px solid ${AVATAR_STYLES.COLORS.modalBorder}`,
            boxShadow: AVATAR_STYLES.SHADOWS.modal,
            position: 'relative'
        }}>
            
            {/* Close Button */}
            <ExpandButton 
                onClick={onClose}
                className="close-button"
                style={{
                    position: 'absolute',
                    top: '15px',
                    right: '15px',
                    borderRadius: '50%',
                    background: AVATAR_STYLES.COLORS.closeButton,
                    color: '#FFFFFF',
                    border: 'none',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: AVATAR_STYLES.SHADOWS.closeButton,
                    zIndex: 10
                }}
            >
                ×
            </ExpandButton>
            
            {/* Title Block */}
            <div className="title-block" style={{
                background: AVATAR_STYLES.COLORS.titleBackground,
                border: `2px solid ${AVATAR_STYLES.COLORS.titleBorder}`,
                borderRadius: '15px',
                marginLeft: 'auto',
                marginRight: 'auto',
                width: 'fit-content',
                boxShadow: AVATAR_STYLES.SHADOWS.titleBlock,
                opacity: AVATAR_STYLES.OPACITY.titleBlock
            }}>
                <h2 style={{
                    color: AVATAR_STYLES.COLORS.titleText,
                    fontFamily: "'Jersey 25', sans-serif",
                    fontSize: AVATAR_STYLES.FONTS.title,
                    margin: '0',
                    textAlign: 'center',
                    fontWeight: 'normal',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
                }}>
                    CHOOSE YOUR AVATAR
                </h2>
            </div>

            {/* Avatar Carousel */}
            <div className="carousel-container" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <NavigationArrow direction="left" onClick={prevAvatar} className="arrow-button" />

                <div className="avatar-carousel" style={{
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'all 0.3s ease-out',
                    transform: isTransitioning ? 'scale(0.95)' : 'scale(1)',
                    opacity: isTransitioning ? 0.7 : 1
                }}>
                    {getVisibleAvatars().map((item, index) => (
                        <AvatarCarouselItem
                            key={item.id}
                            item={item}
                            index={index}
                            selectedAvatar={selectedAvatar}
                            onSelect={selectCurrentAvatar}
                        />
                    ))}
                </div>

                <NavigationArrow direction="right" onClick={nextAvatar} className="arrow-button" />
            </div>

            <UsernameInput value={username} onChange={setUsername} className="username-input" />
            
            <div style={{ marginTop: '45px' }}>
                <SaveButton 
                    username={username} 
                    selectedAvatar={selectedAvatar} 
                    onSave={handleSave}
                    className="save-button"
                />
            </div>


        </div>
    )
}

export default ChooseAvatarModal