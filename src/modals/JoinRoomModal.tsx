import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ExpandButton from '../components/ExpandButton';
import { useLobbyName } from "../hooks/useLobbyName";
import { useAvatarCarousel } from "../hooks/useAvatarCarousel";
import lobbyHub from "../services/lobbyHub";
import * as api from "../services/lobbyApi";

type Props = {
    onClose?: () => void
    selectedAvatar?: number | null
}

function JoinRoomModal({ onClose, selectedAvatar }: Props) {
    const [roomCode, setRoomCode] = useState('');
    const navigate = useNavigate();
    const { name } = useLobbyName('');
    const [status, setStatus] = useState<string>("");
    const [avatarId, setAvatarId] = useState(1);

    useAvatarCarousel(setAvatarId, selectedAvatar ?? null);

    const handleJoin = async () => {
        if (!roomCode.trim()) {
            setStatus("Enter room code");
            return;
        }
        if (!name || !name.trim()) {
            setStatus("Set a name first");
            return;
        }

        setStatus("Joining lobby...");
        try {
            const code = roomCode.trim();
            const res = await api.joinLobby({
                LobbyId: code,
                Username: name.trim(),
                IconId: avatarId
            });

            if (!res.ok) {
                setStatus("Join failed: " + (res.message ?? "unknown"));
                return;
            }

            await lobbyHub.start();
            await lobbyHub.addPlayerToLobby(code, name.trim(), avatarId);

            sessionStorage.setItem('lobbyId', code);
            sessionStorage.setItem('avatarId', avatarId.toString());

            setStatus("Joined lobby " + code);

            navigate('/lobby', { state: { lobbyCode: code, iconId: avatarId } });
            onClose?.();
        } catch (err) {
            console.error("Join lobby error", err);
            setStatus("Join failed: " + ((err as any)?.message ?? String(err)));
        }
    };

    return (
        <div className="join-room-modal" style={{
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
                    JOIN ROOM
                </h2>
            </div>

            <div style={{ marginBottom: '35px' }}>
                <label style={{
                    color: '#8B4513',
                    fontFamily: "'Jersey 25', sans-serif",
                    fontSize: '22px',
                    display: 'block',
                    marginBottom: '16px',
                    fontWeight: 'bold'
                }}>
                    Room code:
                </label>
                <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value)}
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
                    placeholder="Enter room code"
                />
            </div>

            {status && (
                <div style={{
                    textAlign: 'center',
                    color: '#8B4513',
                    marginBottom: 12,
                    fontFamily: "'Jersey 25', sans-serif"
                }}>
                    {status}
                </div>
            )}

            <div style={{ textAlign: 'center', marginTop: '15px' }}>
                <ExpandButton
                    onClick={roomCode.trim() ? handleJoin : undefined}
                    style={{
                        padding: '16px 40px',
                        background: roomCode.trim()
                            ? '#FEC65F'
                            : 'rgba(139, 69, 19, 0.3)',
                        color: roomCode.trim() ? '#DA6804' : 'rgba(139, 69, 19, 0.6)',
                        border: roomCode.trim() ? '2px solid #FF9500' : '2px solid rgba(139, 69, 19, 0.2)',
                        borderRadius: '20px',
                        fontSize: '24px',
                        fontFamily: "'Jersey 25', sans-serif",
                        cursor: roomCode.trim() ? 'pointer' : 'not-allowed',
                        fontWeight: 'normal',
                        boxShadow: roomCode.trim() ? '0 4px 8px rgba(255, 149, 0, 0.3)' : 'none',
                        opacity: roomCode.trim() ? 1 : 0.6
                    }}
                >
                    Join
                </ExpandButton>
            </div>
        </div>
    );
}

export default JoinRoomModal;