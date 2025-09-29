import './App.css'
import { useState } from 'react'

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

    const handleClose = () => {
        setClosing(true)
        setTimeout(() => {
            setOpenModal(null)
            setClosing(false)
        }, 300)
    }

    return (
        <div className='home-page'>
            <div className='buttons-container'>
                <h3>Create or join a room:</h3>
                <div className='top-buttons'>
                    <button className='top-button' onClick={() => setOpenModal('create')}>
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
                                <h4>Room name:</h4>
                                <input type='text' />
                                <h4>Password:</h4>
                                <input type='text' />
                                <br /><br />
                                <button>Create</button>
                            </>
                        )}

                        {openModal === 'join' && (
                            <>
                                <h2>JOIN ROOM</h2>
                                <h4>Room name:</h4>
                                <input type='text' />
                                <h4>Password:</h4>
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
