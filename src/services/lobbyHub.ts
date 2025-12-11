import * as signalR from "@microsoft/signalr";

const API_URL = (import.meta.env.VITE_API_URL as string) ?? "https://localhost:7179";

export type PlayerJoinedHandler = (lobbyId: string, playerName: string, iconId?: number) => void;
export type AssignedRoleHandler = (role: string) => void;
export type ReceiveImageHandler = (imageUrl: string) => void;
export type RolesAssignedHandler = (describerName: string, drawerName: string) => void;
export type ReceiveMessageHandler = (message: string, playerName: string, iconId: number) => void;

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
        
            if (typeof args[0] === "string") lobbyId = args[0];
            if (typeof args[1] === "string") playerName = args[1];
            if (typeof args[2] === "number") iconId = args[2];

            // normalize empty/undefined to empty string so UI doesn't push undefined
            playerName = playerName ?? "";
            lobbyId = lobbyId ?? "";

            this.onPlayerJoined?.(lobbyId, playerName, iconId);
        });

        this.connection.on("PlayersState", (names: string[]) => {
            this.onPlayersState?.(names);
        });

        this.connection.on("AssignedRole", (role: string) => this.onAssignedRole?.(role));
        this.connection.on("ReceiveImage", (imageUrl: string) => this.onReceiveImage?.(imageUrl));
        this.connection.on("RolesAssigned", (describer: string, drawer: string) => this.onRolesAssigned?.(describer, drawer));

        this.connection.on("LobbyMessage", (message: string, playerName: string, iconId: number) => {
            console.debug("Message to lobby:", message, playerName, iconId);
            this.onReceiveMessage?.(message, playerName, iconId);
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
    async addPlayerToLobby(lobbyId: string, playerName: string, iconId: number, options?: { force?: boolean }) {
        if (!this.connection) await this.start();

        if (!options?.force && this.joinedLobbies.has(lobbyId)) {
            // already added on this connection - skip duplicate invocation
            console.debug(`[hub] addPlayerToLobby skipped (already joined)`, lobbyId, playerName, iconId);
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

    async sendChatMessage(lobbyId: string, message: string, playerName: string, iconId: number) {
        if (!this.connection) await this.start();
        console.debug("Sent this message:", lobbyId, message, playerName, iconId);
        await this.connection!.invoke("SendLobbyMessage", lobbyId, message, playerName, iconId);
        
    }

    // public registration helpers for the UI
    onPlayerJoinedHandler(cb: PlayerJoinedHandler) { this.onPlayerJoined = cb; }
    onPlayersStateHandler(cb: (names: string[]) => void) { this.onPlayersState = cb; }
    onAssignedRoleHandler(cb: AssignedRoleHandler) { this.onAssignedRole = cb; }
    onReceiveImageHandler(cb: ReceiveImageHandler) { this.onReceiveImage = cb; }
    onRolesAssignedHandler(cb: RolesAssignedHandler) { this.onRolesAssigned = cb; }
    onReceiveMessageHandler(cb: ReceiveMessageHandler) { this.onReceiveMessage = cb; }
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