import { useState } from 'react';
import ExpandButton from '../components/ExpandButton';

type Props = {
  roomCreated: boolean
  setRoomCreated: (v: boolean) => void
  onClose?: () => void
}

function CreateRoomModal({ roomCreated, setRoomCreated, onClose = () => {} }: Props) {
    const [roomName, setRoomName] = useState('');
    const handleCreate = () => {
        if (roomName.trim()) {
            setRoomCreated(true);
        }
    };

    return (
        <div className="create-room-modal" style={{
                background: '#FFC892',
                border: '3px solid #FFB042',
                borderRadius: '30px',
                padding: '35px',
                minWidth: '450px',
                maxWidth: '550px',
                minHeight: '350px',
                boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
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
                    background: 'rgba(139, 69, 19, 0.8)',
                    color: '#FFFFFF',
                    border: 'none',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    zIndex: 10
                }}
            >
                ×
            </ExpandButton>
            
            {/* Title Block - Made Bigger */}
            <div className="modal-title-block" style={{
                background: '#FF962C',
                border: '2px solid #DE5C00',
                borderRadius: '15px',
                padding: '16px 20px',
                marginBottom: '35px',
                marginLeft: 'auto',
                marginRight: 'auto',
                width: 'fit-content',
                minWidth: '200px',
                maxWidth: '240px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                opacity: 0.73
            }}>
                <h2 style={{
                    color: '#FFE9A1',
                    fontFamily: "'Jersey 25', sans-serif",
                    fontSize: '32px',
                    margin: '0',
                    textAlign: 'center',
                    fontWeight: 'normal',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
                }}>
                    CREATE ROOM
                </h2>
            </div>

            {roomCreated ? (
                <div style={{ textAlign: 'center' }}>
                    <h4 id='code' style={{
                        color: '#8B4513',
                        fontFamily: "'Jersey 25', sans-serif",
                        fontWeight: 'normal',
                        fontSize: '22px',
                        margin: '16px 0',
                        padding: '16px',
                        background: 'rgba(255,255,255,0.6)',
                        borderRadius: '12px',
                        border: '2px solid rgba(139, 69, 19, 0.2)'
                    }}>
                        Room Code: 123abc
                    </h4>
                </div>
            ) : (
                <>
                    {/* Input Section */}
                    <div style={{ marginBottom: '35px' }}>
                        <label style={{
                            color: '#8B4513',
                            fontFamily: "'Jersey 25', sans-serif",
                            fontSize: '22px',
                            display: 'block',
                            marginBottom: '16px',
                            fontWeight: 'bold'
                        }}>
                            Room name:
                        </label>
                        <input
                            type="text"
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '18px 24px',
                                border: 'none',
                                borderRadius: '25px',
                                fontSize: '20px',
                                fontWeight: 'normal',
                                background: 'rgba(255,255,255,0.9)',
                                outline: 'none',
                                boxSizing: 'border-box',
                                boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.1)'
                            }}
                            placeholder="Enter room name"
                        />
                    </div>
                    
                    {/* Create Button */}
                    <div style={{ textAlign: 'center', marginTop: '15px' }}>
                        <ExpandButton
                            onClick={roomName.trim() ? handleCreate : undefined}
                            style={{
                                padding: '16px 40px',
                                background: roomName.trim() 
                                    ? '#FEC65F'
                                    : 'rgba(139, 69, 19, 0.3)',
                                color: roomName.trim() ? '#DA6804' : 'rgba(139, 69, 19, 0.6)',
                                border: roomName.trim() ? '2px solid #FF9500' : '2px solid rgba(139, 69, 19, 0.2)',
                                borderRadius: '20px',
                                fontSize: '24px',
                                fontFamily: "'Jersey 25', sans-serif",
                                cursor: roomName.trim() ? 'pointer' : 'not-allowed',
                                fontWeight: 'normal',
                                boxShadow: roomName.trim() ? '0 4px 8px rgba(255, 149, 0, 0.3)' : 'none',
                                opacity: roomName.trim() ? 1 : 0.6
                            }}
                        >
                            Create
                        </ExpandButton>
                    </div>
                </>
            )}
        </div>
    )
}

export default CreateRoomModal
