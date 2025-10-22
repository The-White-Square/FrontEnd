import React, { useEffect, useState } from "react";
import lobbyHub from "../services/lobbyHub";
import * as api from "../services/lobbyApi";
const API_URL = (import.meta.env.VITE_API_URL as string) ?? "https://localhost:7179";

export default function Lobby() {
    const [lobbyId, setLobbyId] = useState("");
    const [name, setName] = useState("");
    const [iconId, setIconId] = useState(1);
    const [status, setStatus] = useState("");
    const [players, setPlayers] = useState<string[]>([]);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [myRole, setMyRole] = useState<string | null>(null);

    useEffect(() => {
        // full players state (new joiner receives current list)
        lobbyHub.onPlayersStateHandler((names) => {
            console.debug("[hub] PlayersState", names);
            setPlayers(names ?? []);
        });

        lobbyHub.onPlayerJoinedHandler((lobby, playerName) => {
            console.debug("[hub] PlayerJoined", lobby, playerName);
            setPlayers((p) => {
                if (p.includes(playerName)) return p;
                return [...p, playerName];
            });
        });

        lobbyHub.onAssignedRoleHandler((role) => {
            console.debug("[hub] AssignedRole", role);
            setMyRole(role);
            setStatus(`Assigned role: ${role}`);
        });

        lobbyHub.onReceiveImageHandler((img) => {
            console.debug("[hub] ReceiveImage", img);
            const absolute = img.startsWith("http") ? img : API_URL + img;
            setImageUrl(absolute);
            setStatus("Received image (describer).");
        });

        lobbyHub.onRolesAssignedHandler((describer, drawer) => {
            console.debug("[hub] RolesAssigned", describer, drawer);
            setStatus(`Roles assigned - describer: ${describer}, drawer: ${drawer}`);
        });

        // no auto-start here; we'll start when needed
    }, []);

    const handleCreate = async () => {
        if (!name) { setStatus("Set a name first"); return; }
        setStatus("Creating lobby");
        try {
            const res = await api.joinLobby({ LobbyId: "", Username: name, IconId: iconId });
            if (!res.ok) { setStatus("Create failed: " + (res.message ?? "unknown")); return; }
            const code = res.lobbyCode ?? res.message ?? "";
            setLobbyId(code);
            setStatus("Lobby created: " + code);

            await lobbyHub.start();
            // attach PlayersState handler to raw connection if lobbyHub implementation allows it
            // (lobbyHub.start already attaches handlers in service; but ensure we listen for PlayersState)
            (lobbyHub as any).registerRawHandler?.("PlayersState", (names: string[]) => setPlayers(names ?? []));

            await lobbyHub.addPlayerToLobby(code, name, iconId);
        } catch (err) {
            console.error("Create lobby error", err);
            setStatus("Create failed: " + (err as any)?.message ?? String(err));
        }
    };

    const handleJoin = async () => {
        if (!lobbyId) { setStatus("Enter lobby code"); return; }
        if (!name) { setStatus("Set a name first"); return; }
        setStatus("Joining lobby...");
        try {
            const res = await api.joinLobby({ LobbyId: lobbyId, Username: name, IconId: iconId });
            if (!res.ok) { setStatus("Join failed: " + (res.message ?? "unknown")); return; }

            await lobbyHub.start();
            (lobbyHub as any).registerRawHandler?.("PlayersState", (names: string[]) => setPlayers(names ?? []));

            await lobbyHub.addPlayerToLobby(lobbyId, name, iconId);
            setStatus("Joined lobby " + lobbyId);
        } catch (err) {
            console.error("Join lobby error", err);
            setStatus("Join failed: " + (err as any)?.message ?? String(err));
        }
    };

    const handleGetImage = async () => {
        if (!lobbyId) { setStatus("No lobby id"); return; }
        setStatus("Searching for lobby image...");
        try {
            const dto = await api.getLobbyImage(lobbyId);
            if (!dto) { setStatus("No image available"); return; }
            const absolute = dto.url.startsWith("http") ? dto.url : API_URL + dto.url;
            setImageUrl(absolute);
            setStatus("Image found.");
            console.debug("GET image dto:", dto);
        } catch (err) {
            console.error("Get lobby image error", err);
            setStatus("Failed to find image: " + ((err as any)?.message ?? String(err)));
        }
    };

    const handleAssignRoles = async () => {
        if (!lobbyId) { setStatus("No lobby id"); return; }
        try {
            await lobbyHub.start();
            const ok = await lobbyHub.assignRoles(lobbyId);
            setStatus(ok ? "Assigned roles" : "Assigning roles failed");
            console.debug("AssignRoles result:", ok);
        } catch (err) {
            console.error("Assign roles error", err);
            setStatus("Assign roles failed: " + ((err as any)?.message ?? String(err)));
        }
    };

    return (
        <div>
            <h3>Lobby</h3>

            <div>
                <label>Name: <input value={name} onChange={e => setName(e.target.value)} /></label>
                <label style={{ marginLeft: 8 }}>IconId: <input type="number" value={iconId} onChange={e => setIconId(parseInt(e.target.value || "0"))} style={{ width: 64 }} /></label>
            </div>

            <div style={{ marginTop: 8 }}>
                <button onClick={handleCreate}>Create Lobby</button>
            </div>

            <div style={{ marginTop: 8 }}>
                <input placeholder="Lobby code" value={lobbyId} onChange={e => setLobbyId(e.target.value.toLowerCase())} />
                <button onClick={handleJoin}>Join Lobby</button>
            </div>

            <div style={{ marginTop: 8 }}>
                <button onClick={handleGetImage}>GET /lobby/{lobbyId}/image</button>
                <button onClick={handleAssignRoles} style={{ marginLeft: 8 }}>Assign Roles (hub)</button>
            </div>

            <div style={{ marginTop: 12 }}>
                <strong>Status:</strong> {status}
            </div>

            <div style={{ marginTop: 8 }}>
                <strong>Players:</strong>
                <ul>{players.map(p => <li key={p}>{p}</li>)}</ul>
            </div>

            {myRole === "describer" && imageUrl && (
                <div style={{ marginTop: 12 }}>
                    <h4>Your image (describer)</h4>
                    <img src={imageUrl} alt="to describe" style={{ maxWidth: 420 }} />
                </div>
            )}

            {myRole === "drawer" && <div style={{ marginTop: 12 }}>You are the drawer, wait for describer to explain and draw.</div>}
        </div>
    );
}