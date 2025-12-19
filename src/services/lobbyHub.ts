import * as signalR from "@microsoft/signalr";

const API_URL = (import.meta.env.VITE_API_URL as string) ?? "https://localhost:7179";

export type DrawingEvent =
  | { type: 'StrokeStarted'; strokeId: string; color: string; width: number; tool: string }
  | { type: 'StrokePoints'; strokeId: string; points: { x: number; y: number }[] }
  | { type: 'StrokeEnded'; strokeId: string }
  | { type: 'CanvasCleared' };

export type CanvasResetHandler = (events: DrawingEvent[]) => void;

export type PlayerJoinedHandler = (lobbyId: string, playerName: string, iconId?: number) => void;
export type AssignedRoleHandler = (role: string) => void;
export type ReceiveImageHandler = (imageUrl: string) => void;
export type RolesAssignedHandler = (describerName: string, drawerName: string) => void;
export type ReceiveMessageHandler = (message: string, playerName: string) => void;
export type GoToFinalHandler = () => void;

// Drawing preview event handler types
export type StrokeStartedHandler = (strokeId: string, color: string, width: number, tool: string) => void;
export type StrokePointsHandler = (strokeId: string, points: { x: number; y: number }[]) => void;
export type StrokeEndedHandler = (strokeId: string) => void;
export type CanvasClearedHandler = () => void;

class LobbyHubClient {
    private connection?: signalR.HubConnection;
    private startPromise?: Promise<void>; // NEW: coalesce start calls

    private onPlayerJoined?: PlayerJoinedHandler;
    private onPlayersState?: (names: string[]) => void;
    private onAssignedRole?: AssignedRoleHandler;
    private onReceiveImage?: ReceiveImageHandler;
    private onRolesAssigned?: RolesAssignedHandler;

    private joinedLobbies: Set<string> = new Set();
    private rawHandlers: Map<string, Set<(...args: any[]) => void>> = new Map();

    private onReceiveMessage?: ReceiveMessageHandler;
    private onGoToFinal?: GoToFinalHandler;

    // drawing preview handlers
    private onStrokeStarted?: StrokeStartedHandler;
    private onStrokePoints?: StrokePointsHandler;
    private onStrokeEnded?: StrokeEndedHandler;
    private onCanvasCleared?: CanvasClearedHandler;
    private onCanvasReset?: CanvasResetHandler;

    // Ensure we end up with exactly one connection and wait until Connected before invoking
    async start(): Promise<void> {
        if (this.connection?.state === signalR.HubConnectionState.Connected) return;
        if (this.startPromise) return this.startPromise;

        // If there is an existing connection instance (Connecting/Reconnecting), reuse it.
        if (!this.connection) {
            this.connection = new signalR.HubConnectionBuilder()
                .withUrl(`${API_URL}/hubs/lobby`)
                .withAutomaticReconnect()
                .build();

            // Events
            this.connection.on("PlayerJoined", (...args: any[]) => {
                let lobbyId: string = "";
                let playerName: string = "";
                let iconId: number | 0 = 0;

                if (args.length === 1 && typeof args[0] === "string") {
                    playerName = args[0];
                } else {
                    if (typeof args[0] === "string") lobbyId = args[0];
                    if (typeof args[1] === "string") playerName = args[1];
                    if (typeof args[2] === "number") iconId = args[2];
                    if (!playerName && typeof args[0] === "string") playerName = args[0];
                }

                this.onPlayerJoined?.(lobbyId ?? "", playerName ?? "", iconId);
            });

            this.connection.on("PlayersState", (names: string[]) => {
                this.onPlayersState?.(names);
            });

            this.connection.on("AssignedRole", (role: string) => {
                const normalized =
                    role === "Explainer" ? "Describer" :
                    role === "Artist" ? "Drawer" :
                    role;
                this.onAssignedRole?.(normalized);
            });

            this.connection.on("ReceiveImage", (imageUrl: string) => this.onReceiveImage?.(imageUrl));
            this.connection.on("RolesAssigned", (describer: string, drawer: string) => this.onRolesAssigned?.(describer, drawer));

            this.connection.on("LobbyMessage", (message: string, playerName: string) => {
                this.onReceiveMessage?.(message, playerName);
            });

            this.connection.on("GoToFinal", async () => {
                const callbacks = this.rawHandlers.get("GoToFinal");
                if (callbacks && callbacks.size > 0) {
                    const promises: Promise<unknown>[] = [];
                    for (const cb of callbacks) {
                        try { promises.push(Promise.resolve(cb())); } catch { /* ignore */ }
                    }
                    try { await Promise.allSettled(promises); } catch { /* ignore */ }
                }
                try { this.onGoToFinal?.(); } catch { /* ignore */ }
            });

            // drawing events
            this.connection.on("StrokeStarted", (strokeId: string, color: string, width: number, tool: string) => {
                this.onStrokeStarted?.(strokeId, color, width, tool);
            });
            this.connection.on("StrokePoints", (strokeId: string, points: { x: number; y: number }[]) => {
                this.onStrokePoints?.(strokeId, points);
            });
            this.connection.on("StrokeEnded", (strokeId: string) => {
                this.onStrokeEnded?.(strokeId);
            });
            this.connection.on("CanvasCleared", () => {
                this.onCanvasCleared?.();
            });
            this.connection.on("CanvasReset", (events: DrawingEvent[]) => {
                this.onCanvasReset?.(events);
            });

            // attach pre-registered raw handlers (skip GoToFinal)
            for (const [eventName, callbacks] of this.rawHandlers.entries()) {
                if (eventName === "GoToFinal") continue;
                for (const cb of callbacks) {
                    try { this.connection.on(eventName, cb); } catch { /* ignore */ }
                }
            }
        }

        // Coalesce concurrent starts and wait until Connected
        this.startPromise = (async () => {
            if (this.connection!.state !== signalR.HubConnectionState.Connected) {
                try {
                    await this.connection!.start();
                } catch (err) {
                    this.startPromise = undefined;
                    throw err;
                }
            }
            // Wait a moment if still in transitional state
            let tries = 0;
            while (this.connection!.state !== signalR.HubConnectionState.Connected && tries < 40) {
                await new Promise(r => setTimeout(r, 50));
                tries++;
            }
            if (this.connection!.state !== signalR.HubConnectionState.Connected) {
                this.startPromise = undefined;
                throw new Error("SignalR connection not connected (timeout).");
            }
        })();

        try {
            await this.startPromise;
        } finally {
            this.startPromise = undefined;
        }
    }

    private async ensureConnected() {
        await this.start();
        // As an extra guard, poll briefly if state isn�t yet Connected
        let tries = 0;
        while (this.connection!.state !== signalR.HubConnectionState.Connected && tries < 40) {
            await new Promise(r => setTimeout(r, 25));
            tries++;
        }
        if (this.connection!.state !== signalR.HubConnectionState.Connected) {
            throw new Error("SignalR not connected.");
        }
    }

    async addPlayerToLobby(lobbyId: string, playerName: string, iconId = 0, options?: { force?: boolean }) {
        await this.ensureConnected();

        if (!options?.force && this.joinedLobbies.has(lobbyId)) {
            console.debug(`[hub] addPlayerToLobby skipped (already joined)`, lobbyId, playerName);
            return;
        }

        await this.connection!.invoke("AddPlayerToLobby", lobbyId, playerName, iconId);
        this.joinedLobbies.add(lobbyId);
    }

    async getPlayers(lobbyId: string): Promise<string[] | null> {
        await this.ensureConnected();
        try {
            const result = await this.connection!.invoke<string[]>("GetPlayers", lobbyId);
            return result ?? null;
        } catch (err) {
            console.warn("[hub] GetPlayers failed", err);
            return null;
        }
    }

    async removePlayerFromLobby(lobbyId: string) {
        if (!this.connection) return;
        try {
            await this.ensureConnected();
            await this.connection!.invoke("RemovePlayerFromLobby", lobbyId);
        } catch { /* ignore */ }
        this.joinedLobbies.delete(lobbyId);
    }

    async assignRoles(lobbyId: string) {
        await this.ensureConnected();
        return await this.connection!.invoke<boolean>("AssignRoles", lobbyId);
    }

    async sendChatMessage(lobbyId: string, message: string, playerName: string, iconId = 0) {
        await this.ensureConnected();
        await this.connection!.invoke("SendLobbyMessage", lobbyId, message, playerName, iconId);
    }

    async goToFinal(lobbyId: string) {
        await this.ensureConnected();
        try {
            await this.connection!.invoke("GoToFinal", lobbyId);
        } catch (err) {
            console.warn("[hub] goToFinal failed", err);
            throw err;
        }
    }

    async uploadDataUrlToDrawings(dataUrl: string, lobbyId?: string): Promise<any> {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const fd = new FormData();
        fd.append('file', blob, 'drawing.png');

        const resp = await fetch(`${API_URL}/api/drawings`, {
            method: 'POST',
            body: fd,
            credentials: 'include'
        });

        if (!resp.ok) {
            const text = await resp.text();
            throw new Error(`Upload failed: ${resp.status} ${text}`);
        }

        const json = await resp.json();

        if (lobbyId) {
            try {
                await this.ensureConnected();
                await this.connection!.invoke("AnnounceDrawing", lobbyId, json.url);
            } catch (err) {
                console.warn('[hub] AnnounceDrawing failed', err);
            }
        }

        return json;
    }

    autoSaveCanvasOnGoToFinal(canvasSelector = '#drawing-canvas') {
        const handler = async () => {
            try {
                const canvas = document.querySelector(canvasSelector) as HTMLCanvasElement | null;
                if (!canvas) return;
                const dataUrl = canvas.toDataURL('image/png');
                await this.uploadDataUrlToDrawings(dataUrl);
            } catch (err) {
                console.warn('[lobbyHub] auto-save canvas failed', err);
            }
        };

        this.registerRawHandler('GoToFinal', handler);
    }

    // Outbound drawing methods invoked by the drawer
    async beginStroke(lobbyId: string, strokeId: string, color: string, width: number, tool: string) {
        await this.ensureConnected();
        await this.connection!.invoke("BeginStroke", lobbyId, strokeId, color, width, tool);
    }

    async addStrokePoints(lobbyId: string, strokeId: string, points: { x: number; y: number }[]) {
        await this.ensureConnected();
        await this.connection!.invoke("AddStrokePoints", lobbyId, strokeId, points);
    }

    async endStroke(lobbyId: string, strokeId: string) {
        await this.ensureConnected();
        await this.connection!.invoke("EndStroke", lobbyId, strokeId);
    }

    async clearCanvas(lobbyId: string) {
        await this.ensureConnected();
        await this.connection!.invoke("ClearCanvas", lobbyId);
    }

    // Timeline methods
    async getDrawingEvents(lobbyId: string): Promise<DrawingEvent[]> {
        await this.ensureConnected();
        const events = await this.connection!.invoke<DrawingEvent[]>("GetDrawingEvents", lobbyId);
        return events ?? [];
    }

    async undoLast(lobbyId: string): Promise<boolean> {
        await this.ensureConnected();
        return await this.connection!.invoke<boolean>("UndoLast", lobbyId);
    }

    async redoLast(lobbyId: string): Promise<boolean> {
        await this.ensureConnected();
        return await this.connection!.invoke<boolean>("RedoLast", lobbyId);
    }

    // public registration helpers for the UI
    onPlayerJoinedHandler(cb: PlayerJoinedHandler) { this.onPlayerJoined = cb; }
    onPlayersStateHandler(cb: (names: string[]) => void) { this.onPlayersState = cb; }
    onAssignedRoleHandler(cb: AssignedRoleHandler) { this.onAssignedRole = cb; }
    onReceiveImageHandler(cb: ReceiveImageHandler) { this.onReceiveImage = cb; }
    onRolesAssignedHandler(cb: RolesAssignedHandler) { this.onRolesAssigned = cb; }
    onReceiveMessageHandler(cb: ReceiveMessageHandler) { this.onReceiveMessage = cb; }
    onGoToFinalHandler(cb: GoToFinalHandler) { this.onGoToFinal = cb; }

    onStrokeStartedHandler(cb: StrokeStartedHandler) { this.onStrokeStarted = cb; }
    onStrokePointsHandler(cb: StrokePointsHandler) { this.onStrokePoints = cb; }
    onStrokeEndedHandler(cb: StrokeEndedHandler) { this.onStrokeEnded = cb; }
    onCanvasClearedHandler(cb: CanvasClearedHandler) { this.onCanvasCleared = cb; }
    onCanvasResetHandler(cb: CanvasResetHandler) { this.onCanvasReset = cb; }

    registerRawHandler(eventName: string, cb: (...args: any[]) => void) {
        const set = this.rawHandlers.get(eventName) ?? new Set<(...args: any[]) => void>();
        if (!set.has(cb)) {
            set.add(cb);
            this.rawHandlers.set(eventName, set);
        }
        if (this.connection && eventName !== "GoToFinal") {
            try { this.connection.on(eventName, cb); } catch { /* ignore */ }
        }
    }
}

const client = new LobbyHubClient();
export default client;

// Optional: expose for console debugging
// ;(window as any).lobbyHub = client;