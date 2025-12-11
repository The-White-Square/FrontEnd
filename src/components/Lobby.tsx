import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import lobbyHub from "../services/lobbyHub";
import * as api from "../services/lobbyApi";
import BackgroundLayers from "../components/BackgroundLayers";
import { mainActionButtonStyle } from "../styles/buttonStyles";
import { useLobbyName } from "../hooks/useLobbyName";
import { useAvatarCarousel } from "../hooks/useAvatarCarousel";

const API_URL = (import.meta.env.VITE_API_URL as string) ?? "https://localhost:7179";

type PlayerItem = { id?: string; displayName: string; iconId?: number };

export default function Lobby() {
    const [lobbyId, setLobbyId] = useState("");
    const { name, setName, status: nameStatus } = useLobbyName("");
    const [iconId, setIconId] = useState(1);
    const { currentCenterIndex, getVisibleAvatars, nextAvatar, prevAvatar } = useAvatarCarousel(setIconId, iconId);
    const [status, setStatus] = useState("");
    const [players, setPlayers] = useState<PlayerItem[]>([]);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [myRole, setMyRole] = useState<string | null>(null);

    const location = useLocation();
    const navigate = useNavigate();
    const joinedRef = useRef(false);

    const getLocalAvatarSrc = (id?: number): string | null => {
        if (!id) return null;
        try {
            return new URL(`../assets/avatars/avatar${id}.png`, import.meta.url).toString();
        } catch {
            return null;
        }
    };

    const uniquePlayers = (list: PlayerItem[]) => {
        const map = new Map<string, PlayerItem>();
        for (const p of list) {
            if (!p?.displayName) continue;
            const existing = map.get(p.displayName);
            if (existing) {
                if (!existing.id && p.id) existing.id = p.id;
                if (!existing.iconId && p.iconId) existing.iconId = p.iconId;
            } else {
                map.set(p.displayName, { ...p });
            }
        }
        return Array.from(map.values());
    };

    const toPlayerItem = (it: any): PlayerItem => {
        if (!it) return { displayName: "", iconId: 1 };
        if (typeof it === "string") return { displayName: it, iconId: 1 };

        const displayName = it.displayName ?? it.DisplayName ?? it.username ?? it.userName ?? it.user ?? "";
        const id = it.id ?? it.Id ?? undefined;

        let rawIcon = it.iconId ?? it.icon ?? it.IconId ?? it.Icon ?? it.iconIdString ?? undefined;
        if (typeof rawIcon === "string" && rawIcon.trim() !== "") {
            const n = parseInt(rawIcon, 10);
            rawIcon = Number.isNaN(n) ? undefined : n;
        }
        const iconIdVal = rawIcon != null ? Number(rawIcon) : 1;

        return { id, displayName, iconId: iconIdVal };
    };

    const normalizePlayers = (list: any[]): PlayerItem[] =>
        uniquePlayers((list ?? []).map(it => toPlayerItem(it)));

    useEffect(() => {
        lobbyHub.onPlayersStateHandler((names) => {
            console.debug("[hub] PlayersState", names);
            setPlayers(normalizePlayers(names ?? []));
        });

        lobbyHub.onPlayerJoinedHandler((lobby, playerName, icon) => {
            console.debug("[hub] PlayerJoined", lobby, playerName, icon);
            setPlayers((prev) => {
                if (prev.some((x) => x.displayName === playerName)) {
                    return prev.map(p => p.displayName === playerName && icon ? { ...p, iconId: icon } : p);
                }
                return uniquePlayers([...prev, { displayName: playerName, iconId: icon ?? 1 }]);
            });
        });

        lobbyHub.onAssignedRoleHandler((role) => {
            console.debug("[hub] AssignedRole", role);
            setMyRole(role);

            const r = (role ?? "").toString().toLowerCase();
            const isDescriber = r.includes("explainer");
            const isDrawer = r.includes("artist");

            setStatus(`Assigned role: ${role}`);

            setLobbyId(currentLobbyId => {
                const stateLobbyCode = (location as any)?.state?.lobbyCode;
                const code = currentLobbyId || stateLobbyCode || "";
                const navState = { lobbyId: code, name, iconId };

                console.debug("[nav] role detection:", { role: r, isDescriber, isDrawer, lobbyId: code });

                if (isDrawer && code) {
                    navigate(`/game/${encodeURIComponent(code)}`, { state: navState });
                } else if (isDescriber) {
                    navigate("/describer", { state: navState });
                } else {
                    console.warn("Unknown role received, not navigating:", role);
                }
                return currentLobbyId;
            });
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

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigate, location]);

    const refreshPlayersFromServer = async (code: string) => {
        try {
            const list = await api.getLobbyPlayers(code);
            if (list?.length) {
                console.debug("[api] Fetched players list (REST)", list);
                setPlayers(normalizePlayers(list));
                return;
            }

            const hubList = await lobbyHub.getPlayers(code);
            if (hubList?.length) {
                console.debug("[hub] Fetched players list (hub)", hubList);
                setPlayers(normalizePlayers(hubList));
                return;
            }

            console.debug("[info] No players list available for", code);
        } catch (err) {
            console.warn("Failed to fetch players list", err);
        }
    };

    useEffect(() => {
        if (joinedRef.current) return;

        const state = (location as any)?.state ?? {};
        const codeFromState: string | undefined = state.lobbyCode;
        const iconFromState: number | undefined = state.iconId;

        if (!codeFromState) return;

        if (players.some(p => p.displayName === name && name !== "")) {
            joinedRef.current = true;
            return;
        }

        const joinFromState = async () => {
            if (!name) {
                setStatus("Set a name first");
                return;
            }

            setLobbyId(codeFromState);
            if (iconFromState !== undefined) {
                setIconId(iconFromState);
            }
            setStatus("Joining lobby...");

            try {
                await lobbyHub.start();

                const finalIconId = iconFromState ?? iconId;

                const res = await api.joinLobby({
                    LobbyId: codeFromState,
                    Username: name,
                    IconId: finalIconId
                });

                if (!res.ok) {
                    setStatus("Join failed: " + (res.message ?? "unknown"));
                    return;
                }

                await lobbyHub.addPlayerToLobby(codeFromState, name, finalIconId);
                await refreshPlayersFromServer(codeFromState);

                setStatus("Joined lobby " + codeFromState);
                joinedRef.current = true;
            } catch (err) {
                console.error("Join from state error", err);
                setStatus("Join failed: " + ((err as any)?.message ?? String(err)));
            }
        };

        joinFromState();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location]);

    const handleGetImage = async () => {
        if (!lobbyId) {
            setStatus("No lobby id");
            return;
        }
        setStatus("Searching for lobby image...");
        try {
            const dto = await api.getLobbyImage(lobbyId);
            if (!dto) {
                setStatus("No image available");
                return;
            }
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
        if (!lobbyId) {
            setStatus("No lobby id");
            return;
        }
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

    // small inline styles to reproduce the pill + avatar + big name layout
    const headerStyle: React.CSSProperties = { textAlign: "center", fontSize: 36, color: "#6b0000", marginTop: 6, fontFamily: "'Jersey 25', sans-serif" };
    const playerRowWrap: React.CSSProperties = { display: "flex", justifyContent: "center", marginTop: 18 };
    const pillStyle: React.CSSProperties = {
        background: "#fff",
        borderRadius: 48,
        width: "clamp(560px, 60vw, 920px)", // responsive: changes with window width, within min/max bounds
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        padding: "12px 18px",
        boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
        position: "relative", // allow absolute centering of name
    };
    const avatarWrap: React.CSSProperties = {
        width: 84,
        height: 84,
        borderRadius: "50%",
        overflow: "hidden",
        marginRight: 18,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "6px solid #fff",
        background: "#f6e9e5",
        flexShrink: 0,
    };
    const playerNameStyle: React.CSSProperties = {
        position: "absolute",
        left: "50%",
        transform: "translateX(-50%)",
        width: "calc(100% - 160px)", // leave room for avatar + padding
        textAlign: "center",
        fontSize: 40,
        fontFamily: "'Jersey 25', sans-serif",
        color: "#111",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        pointerEvents: "none",
    };
    const startButtonWrap: React.CSSProperties = { display: "flex", justifyContent: "center", marginTop: 40 };

    return (
        <BackgroundLayers>
            <div style={{ position: 'relative', zIndex: 1, color: 'black', padding: 20 }}>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div>
                        <strong>Name:</strong> <span>{name || "�"}</span>
                        {nameStatus && <div style={{ fontSize: 12, color: '#666' }}>{nameStatus}</div>}
                    </div>
                    <label style={{ marginLeft: 8 }}>
                        IconId: <input type="number" value={iconId} onChange={e => setIconId(parseInt(e.target.value || "0"))} style={{ width: 64 }} />
                    </label>
                </div>

                <div style={{ marginTop: 8 }}>
                    <button onClick={handleGetImage}>GET /lobby/{lobbyId}/image</button>
                </div>

                <div style={{ marginTop: 12 }}>
                    <strong>Status:</strong> {status}
                </div>

                {/* Players header */}
                <div style={{ marginTop: 18 }}>
                    <div style={headerStyle}>Players {players.length}/2</div>

                    {/* Player list - centered pill rows */}
                    {players.map((p) => {
                        const src = getLocalAvatarSrc(p.iconId) ?? undefined;
                        return (
                            <div key={p.id ?? p.displayName} style={playerRowWrap}>
                                <div style={pillStyle}>
                                    <div style={avatarWrap}>
                                        {src ? (
                                            <img src={src} alt={p.displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                        ) : (
                                            <div style={{ fontSize: 24, color: "#7a3b3b" }}>{p.displayName?.charAt(0) ?? "?"}</div>
                                        )}
                                    </div>
                                    <div style={playerNameStyle}>{p.displayName}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* START button centered at bottom (uses Home mainActionButtonStyle) */}
                <div style={startButtonWrap}>
                    <button onClick={handleAssignRoles} style={{ ...mainActionButtonStyle, minWidth: 160, padding: "10px 36px" }}>START</button>
                </div>

                {myRole === "describer" && imageUrl && (
                    <div style={{ marginTop: 12 }}>
                        <h4>Your image (describer)</h4>
                        <img src={imageUrl} alt="to describe" style={{ maxWidth: 420 }} />
                    </div>
                )}

                {myRole === "drawer" && <div style={{ marginTop: 12 }}>You are the drawer, wait for describer to explain and draw.</div>}
            </div>
        </BackgroundLayers>
    );
}