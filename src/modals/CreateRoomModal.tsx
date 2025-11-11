import ExpandButton from '../components/ExpandButton';
import { useState } from "react";
import lobbyHub from "../services/lobbyHub";
import * as api from "../services/lobbyApi";
import { useLobbyName } from "../hooks/useLobbyName";

type Props = {
  onClose?: () => void
  selectedAvatar?: number | null
}

function CreateRoomModal({ onClose = () => {}, selectedAvatar }: Props) {
    const { name } = useLobbyName('');
    const [status, setStatus] = useState<string>("");

    const handleCreate = async () => {
        if (!name || !name.trim()) { setStatus("Set a name first"); return; }

        setStatus("Creating lobby...");
        try {
            const res = await api.joinLobby({ LobbyId: "", Username: name.trim(), IconId: selectedAvatar ?? 1 });
            if (!res.ok) { setStatus("Create failed: " + (res.message ?? "unknown")); return; }

            const code = res.lobbyCode ?? (res.message ?? "");
            if (!code) { setStatus("Create failed: no code returned"); return; }

            // start hub and add player (match Lobby.tsx behavior)
            await lobbyHub.start();
            await lobbyHub.addPlayerToLobby(code, name.trim(), selectedAvatar ?? 1);

            setStatus("Lobby created: " + code);
            // Do not navigate — leave user on the current page/modal as requested.
            // If you want the modal to close automatically after creation uncomment:
            // onClose();
        } catch (err) {
            console.error("Create lobby error", err);
            setStatus("Create failed: " + ((err as any)?.message ?? String(err)));
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
            
            {/* Title Block */}
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

            {/* Status Message */}
            {status && <div style={{ textAlign: 'center', color: '#8B4513', marginBottom: 12 }}>{status}</div>}
                    
            {/* Create Button */}
            <div style={{ textAlign: 'center', marginTop: '15px' }}>
                <ExpandButton
                    onClick={handleCreate}
                    style={{
                        padding: '16px 40px',
                        background: '#FEC65F',
                        color: '#DA6804',
                        border: '2px solid #FF9500',
                        borderRadius: '20px',
                        fontSize: '24px',
                        fontFamily: "'Jersey 25', sans-serif",
                        cursor: 'pointer',
                        fontWeight: 'normal',
                        boxShadow: '0 4px 8px rgba(255, 149, 0, 0.3)',
                        opacity: 1
                    }}
                >
                    Create
                </ExpandButton>
            </div>
        </div>
    )
}

export default CreateRoomModal
