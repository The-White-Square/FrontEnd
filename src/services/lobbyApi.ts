const API_URL = (import.meta.env.VITE_API_URL as string) ?? "https://localhost:7179";

export interface JoinRequest {
    LobbyId: string;
    Username: string;
    IconId: number;
}

export interface JoinCreateResponse {
    lobbyCode: string;
}

export interface ImageDto {
    id: string;
    url: string;
    bytes: number;
}

export async function joinLobby(request: JoinRequest): Promise<{ ok: boolean; lobbyCode?: string; message?: string }> {
    const res = await fetch(`${API_URL}/lobby/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
        credentials: "include",
    });

    if (!res.ok) {
        const txt = await res.text();
        return { ok: false, message: txt || res.statusText };
    }

    // Backend returns either { lobbyCode } when created or a simple string when joined
    const text = await res.text();
    try {
        const parsed = JSON.parse(text);
        if (parsed && parsed.lobbyCode) return { ok: true, lobbyCode: parsed.lobbyCode };
    } catch {
        // not JSON -> fallback to string
    }

    // treat body as plain string (username or ok)
    return { ok: true, message: text };
}

export async function getLobbyImage(lobbyId: string): Promise<ImageDto | null> {
    const res = await fetch(`${API_URL}/lobby/${encodeURIComponent(lobbyId)}/image`, {
        method: "GET",
        credentials: "include",
    });
    if (!res.ok) return null;
    return (await res.json()) as ImageDto;
}

/**
 * Fetch current players for a lobby from the server.
 * Returns array of player names or null on failure.
 */
export async function getLobbyPlayers(lobbyId: string): Promise<string[] | null> {
    const res = await fetch(`${API_URL}/lobby/${encodeURIComponent(lobbyId)}/players`, {
        method: "GET",
        credentials: "include",
    });
    if (!res.ok) return null;
    try {
        return (await res.json()) as string[];
    } catch {
        return null;
    }
}