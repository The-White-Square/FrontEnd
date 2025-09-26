import './App.css'
import { useState } from 'react'

function App() {
    return (
        <div className="App">
            <Home />
        </div>
    )
}

function Home() {
    const [openModal, setOpenModal] = useState<null | "create" | "join" | "choose">(null)
    const [closing, setClosing] = useState(false)
    const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null)

    const handleClose = () => {
        setClosing(true)
        setTimeout(() => {
            setOpenModal(null)
            setClosing(false)
            setSelectedAvatar(null)
        }, 300)
    }

    return (
        <div className="home-page">
            <div className="buttons-container">
                <div className="top-buttons">
                    <button onClick={() => setOpenModal("create")}>Create room</button>
                    <button onClick={() => setOpenModal("join")}>Join room</button>
                </div>
                <button className="bottom-button" onClick={() => setOpenModal("choose")}>
                    Choose name & avatar
                </button>
            </div>

            {openModal && (
                <>
                    <div
                        className={`overlay ${closing ? 'fadeOut' : 'fadeIn'}`}
                        onClick={handleClose}
                    ></div>
                    <div className={`modal ${closing ? 'scaleDown' : 'scaleUp'}`}>
                        <button className="close-btn" onClick={handleClose}>×</button>

                        {openModal === "create" && (
                            <>
                                <h2>Create room</h2>
                                <p>123abc</p>
                            </>
                        )}

                        {openModal === "join" && (
                            <>
                                <h2>Join room</h2>
                                <input type="text" />
                                <br /><br />
                                <button>Join</button>
                            </>
                        )}

                        {openModal === "choose" && (
                            <>
                                <h2>Choose name & avatar</h2>
                                <div className="avatar-buttons">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <button
                                            key={i}
                                            className={selectedAvatar === i ? 'selected' : ''}
                                            onClick={() => setSelectedAvatar(i)}
                                        ></button>
                                    ))}
                                </div>
                                <input type="text" placeholder="Enter name" style={{ width: '100%' }} />
                            </>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}

export default App
