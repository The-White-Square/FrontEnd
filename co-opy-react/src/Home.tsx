import { useState } from 'react'
import logo from './assets/logo.png';
import SettingsSound from './SettingsSound'
import CreateRoomModal from './modals/CreateRoomModal'
import JoinRoomModal from './modals/JoinRoomModal'
import ChooseAvatarModal from './modals/ChooseAvatarModal'
import ModalWrapper from './modals/ModalWrapper'

function Home() {
    const [openModal, setOpenModal] = useState<null 
                                               | 'create' 
                                               | 'join' 
                                               | 'choose'
                                               >(null)
    const [closing, setClosing] = useState(false)
    const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null)
    const [roomCreated, setRoomCreated] = useState(false)

    const handleClose = () => {
        setClosing(true)
        setTimeout(() => {
            setOpenModal(null)
            setClosing(false)
            setRoomCreated(false)
        }, 300)
    }

    return (
        <div className='home-page'>
            <SettingsSound />

            <img id='logo' src={logo} alt='co-opy logo' />

            <div className='buttons-container'>
                <h3>Create or join a room:</h3>

                <div className='top-buttons'>

                    <button onClick={() => setOpenModal('create')}>
                        CREATE ROOM
                    </button>

                    <button onClick={() => setOpenModal('join')}>
                        JOIN ROOM
                    </button>

                </div>
                
                <button className='bottom-button' 
                        onClick={() => setOpenModal('choose')}>
                    CHOOSE YOUR AVATAR
                </button>
            </div>

            {openModal && (
                <ModalWrapper closing={closing} onClose={handleClose}>
                    {openModal === 'create' && (
                        <CreateRoomModal roomCreated={roomCreated} 
                                         setRoomCreated={setRoomCreated} />
                    )}
                    {openModal === 'join' && <JoinRoomModal />}
                    {openModal === 'choose' && (
                        <ChooseAvatarModal selectedAvatar={selectedAvatar}
                                           setSelectedAvatar={setSelectedAvatar} />
                    )}
                </ModalWrapper>
            )}
        </div>
    )
}

export default Home