import './App.css'
import { useState } from 'react'
import logo from './assets/logo.png';
import settings from './assets/settings.png';
import sound from './assets/sound.png';

function App() {
    return (
        <div className='App'>
            <Home />
        </div>
    )
}

function Home() {
    const [openModal, setOpenModal] = useState<null | 'create' | 'join' | 'choose'>(null)
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
            <div className='settings-sound'>
                <button>
                    <img src={settings} alt="settings" width="30" height="30" />
                </button>
                <br />
                <button>
                    <img src={sound} alt="sound" width="30" height="30" />
                </button>
            </div>
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
                <button className='bottom-button' onClick={() => setOpenModal('choose')}>
                    CHOOSE YOUR AVATAR
                </button>
            </div>

            {openModal && (
                <>
                    <div
                        className={`overlay ${closing ? 'fadeOut' : 'fadeIn'}`}
                        onClick={handleClose}
                    ></div>
                    <div className={`modal ${closing ? 'scaleDown' : 'scaleUp'}`}>
                        <button className='close-btn' onClick={handleClose}>×</button>

                        {openModal === 'create' && (
                            <>
                                <h2>CREATE ROOM</h2>
                                {roomCreated && <h4 id='code'>123abc</h4>}
                                <br /><br />
                                <button onClick={() => setRoomCreated(true)}>Create</button>
                            </>
                        )}

                        {openModal === 'join' && (
                            <>
                                <h2>JOIN ROOM</h2>
                                <h4>Room code:</h4>
                                <input type='text' />
                                <br /><br />
                                <button>Join</button>
                            </>
                        )}

                        {openModal === 'choose' && (
                            <>
                                <h2>CHOOSE YOUR AVATAR</h2>
                                <div className='avatar-buttons'>
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <button
                                            key={i}
                                            className={selectedAvatar === i ? 'selected' : ''}
                                            onClick={() => setSelectedAvatar(i)}
                                        ></button>
                                    ))}
                                </div>
                                <input type='text' />
                            </>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}

export default App
