import * as signalR from "@microsoft/signalr";

const API_URL = (import.meta.env.VITE_API_URL as string) ?? "https://localhost:7179";

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
    private onPlayerJoined?: PlayerJoinedHandler;
    private onPlayersState?: (names: string[]) => void;
    private onAssignedRole?: AssignedRoleHandler;
    private onReceiveImage?: ReceiveImageHandler;
    private onRolesAssigned?: RolesAssignedHandler;

    // track which lobbies we've already added this client to (prevents duplicate AddPlayerToLobby calls)
    private joinedLobbies: Set<string> = new Set();

    // track raw handlers registered so we don't register the same callback multiple times
    // Map<eventName, Set<callback>>
    private rawHandlers: Map<string, Set<(...args: any[]) => void>> = new Map();

    private onReceiveMessage?: ReceiveMessageHandler;
    private onGoToFinal?: GoToFinalHandler;

    // drawing preview handlers
    private onStrokeStarted?: StrokeStartedHandler;
    private onStrokePoints?: StrokePointsHandler;
    private onStrokeEnded?: StrokeEndedHandler;
    private onCanvasCleared?: CanvasClearedHandler;

    // start the connection and attach all known handlers
    async start() {
        if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) return;

        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(`${API_URL}/hubs/lobby`)
            .withAutomaticReconnect()
            .build();

        // tolerant PlayerJoined handler: accept both shapes sent from server
        this.connection.on("PlayerJoined", (...args: any[]) => {
            let lobbyId: string = "";
            let playerName: string = "";
            let iconId: number | undefined = undefined;

            if (args.length === 1 && typeof args[0] === "string") {
                playerName = args[0];
            } else {
                if (typeof args[0] === "string") lobbyId = args[0];
                if (typeof args[1] === "string") playerName = args[1];
                if (typeof args[2] === "number") iconId = args[2];
                if (!playerName && typeof args[0] === "string") playerName = args[0];
            }

            playerName = playerName ?? "";
            lobbyId = lobbyId ?? "";

            this.onPlayerJoined?.(lobbyId, playerName, iconId);
        });

        this.connection.on("PlayersState", (names: string[]) => {
            this.onPlayersState?.(names);
        });

        // Normalize backend role names to legacy frontend expectations
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

        // explicit GoToFinal handler for reliable navigation
        this.connection.on("GoToFinal", () => {
            if (this.onGoToFinal) {
                try { this.onGoToFinal(); } catch { /* ignore */ }
            } else {
                const callbacks = this.rawHandlers.get("GoToFinal");
                if (callbacks) {
                    for (const cb of callbacks) {
                        try { cb(); } catch { /* ignore individual errors */ }
                    }
                }
            }
        });

        // drawing preview inbound events
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

        // attach any raw handlers previously registered (idempotent set prevents duplicates)
        for (const [eventName, callbacks] of this.rawHandlers.entries()) {
            for (const cb of callbacks) {
                try {
                    this.connection.on(eventName, cb);
                } catch {
                    // ignore attach errors for robustness
                }
            }
        }

        await this.connection.start();
    }

    /**
     * Add this connection as a player in a lobby.
     * This function is idempotent for the (connection, lobbyId) pair to avoid
     * multiple AddPlayerToLobby invocations from the same client/connection.
     *
     * If you need to force adding again (for example after a server-side remove),
     * pass { force: true }.
     */
    async addPlayerToLobby(lobbyId: string, playerName: string, iconId = 0, options?: { force?: boolean }) {
        if (!this.connection) await this.start();

        if (!options?.force && this.joinedLobbies.has(lobbyId)) {
            // already added on this connection - skip duplicate invocation
            console.debug(`[hub] addPlayerToLobby skipped (already joined)`, lobbyId, playerName);
            return;
        }

        await this.connection!.invoke("AddPlayerToLobby", lobbyId, playerName, iconId);
        this.joinedLobbies.add(lobbyId);
    }

    /**
     * Ask the hub/server for current players in a lobby.
     * Fallback when REST endpoint is not present.
     * Returns array of names or null on error.
     */
    async getPlayers(lobbyId: string): Promise<string[] | null> {
        if (!this.connection) await this.start();
        try {
            // server should implement a hub method "GetPlayers" that returns string[]
            const result = await this.connection!.invoke<string[]>("GetPlayers", lobbyId);
            return result ?? null;
        } catch (err) {
            console.warn("[hub] GetPlayers failed", err);
            return null;
        }
    }

    /**
     * Optionally allow leaving a lobby (clears internal tracking) so the client can rejoin later.
     * Not strictly required, but useful for robustness.
     */
    async removePlayerFromLobby(lobbyId: string) {
        if (!this.connection) return;
        try {
            await this.connection!.invoke("RemovePlayerFromLobby", lobbyId);
        } catch {
            // ignore server errors - still clear local state
        }
        this.joinedLobbies.delete(lobbyId);
    }

    async assignRoles(lobbyId: string) {
        if (!this.connection) await this.start();
        return await this.connection!.invoke<boolean>("AssignRoles", lobbyId);
    }

    async sendChatMessage(lobbyId: string, message: string, playerName: string) {
        if (!this.connection) await this.start();
        await this.connection!.invoke("SendLobbyMessage", lobbyId, message, playerName);
    }

    // ask server to broadcast GoToFinal to the lobby
    async goToFinal(lobbyId: string) {
        if (!this.connection) await this.start();
        try {
            await this.connection!.invoke("GoToFinal", lobbyId);
        } catch (err) {
            console.warn("[hub] goToFinal failed", err);
            throw err;
        }
    }

    // Outbound drawing methods invoked by the drawer
    async beginStroke(lobbyId: string, strokeId: string, color: string, width: number, tool: string) {
        if (!this.connection) await this.start();
        await this.connection!.invoke("BeginStroke", lobbyId, strokeId, color, width, tool);
    }

    async addStrokePoints(lobbyId: string, strokeId: string, points: { x: number; y: number }[]) {
        if (!this.connection) await this.start();
        await this.connection!.invoke("AddStrokePoints", lobbyId, strokeId, points);
    }

    async endStroke(lobbyId: string, strokeId: string) {
        if (!this.connection) await this.start();
        await this.connection!.invoke("EndStroke", lobbyId, strokeId);
    }

    async clearCanvas(lobbyId: string) {
        if (!this.connection) await this.start();
        await this.connection!.invoke("ClearCanvas", lobbyId);
    }

    // public registration helpers for the UI
    onPlayerJoinedHandler(cb: PlayerJoinedHandler) { this.onPlayerJoined = cb; }
    onPlayersStateHandler(cb: (names: string[]) => void) { this.onPlayersState = cb; }
    onAssignedRoleHandler(cb: AssignedRoleHandler) { this.onAssignedRole = cb; }
    onReceiveImageHandler(cb: ReceiveImageHandler) { this.onReceiveImage = cb; }
    onRolesAssignedHandler(cb: RolesAssignedHandler) { this.onRolesAssigned = cb; }
    onReceiveMessageHandler(cb: ReceiveMessageHandler) { this.onReceiveMessage = cb; }
    onGoToFinalHandler(cb: GoToFinalHandler) { this.onGoToFinal = cb; }

    // drawing inbound handlers
    onStrokeStartedHandler(cb: StrokeStartedHandler) { this.onStrokeStarted = cb; }
    onStrokePointsHandler(cb: StrokePointsHandler) { this.onStrokePoints = cb; }
    onStrokeEndedHandler(cb: StrokeEndedHandler) { this.onStrokeEnded = cb; }
    onCanvasClearedHandler(cb: CanvasClearedHandler) { this.onCanvasCleared = cb; }

    /**
     * Register arbitrary raw handlers.
     * Registration is idempotent per callback and callbacks are persisted
     * so they will be attached when the connection is started.
     */
    registerRawHandler(eventName: string, cb: (...args: any[]) => void) {
        // store in map first (idempotent)
        const set = this.rawHandlers.get(eventName) ?? new Set<(...args: any[]) => void>();
        if (!set.has(cb)) {
            set.add(cb);
            this.rawHandlers.set(eventName, set);
        }

        // if connection already exists, attach immediately (SignalR will allow multiple attaches;
        // we prevent duplicates via the Set above)
        if (this.connection) {
            try {
                this.connection.on(eventName, cb);
            } catch {
                // ignore attach errors
            }
        }
    }
}

export default new LobbyHubClient();