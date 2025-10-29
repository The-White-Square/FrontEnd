import * as signalR from "@microsoft/signalr";

const API_URL = (import.meta.env.VITE_API_URL as string) ?? "https://localhost:7179";

export type PlayerJoinedHandler = (lobbyId: string, playerName: string, iconId?: number) => void;
export type AssignedRoleHandler = (role: string) => void;
export type ReceiveImageHandler = (imageUrl: string) => void;
export type RolesAssignedHandler = (describerName: string, drawerName: string) => void;

class LobbyHubClient {
    private connection?: signalR.HubConnection;
    private onPlayerJoined?: PlayerJoinedHandler;
    private onPlayersState?: (names: string[]) => void;
    private onAssignedRole?: AssignedRoleHandler;
    private onReceiveImage?: ReceiveImageHandler;
    private onRolesAssigned?: RolesAssignedHandler;

    // persist last joined lobby info so we can re-join groups after reconnect
    private lastLobbyId?: string;
    private lastPlayerName?: string;
    private lastIconId?: number;

    // start the connection and attach all known handlers
    async start() {
        if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) return;

        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(`${API_URL}/hubs/lobby`)
            .withAutomaticReconnect()
            .build();

        // tolerant PlayerJoined handler: accept both shapes sent from server
        this.connection.on("PlayerJoined", (...args: any[]) => {
            // Possible shapes:
            // 1) [ username ]                         -> sent by LobbyController
            // 2) [ lobbyId, playerName, iconId ]      -> sent by LobbyHub
            // 3) other variations (defensive)
            let lobbyId: string = "";
            let playerName: string = "";
            let iconId: number | undefined = undefined;

            if (args.length === 1 && typeof args[0] === "string") {
                // controller sent just the username
                playerName = args[0];
            } else {
                // try to map to expected positions
                if (typeof args[0] === "string") lobbyId = args[0];
                if (typeof args[1] === "string") playerName = args[1];
                if (typeof args[2] === "number") iconId = args[2];
                // fallback: if playerName still empty and first arg seems like name, use it
                if (!playerName && typeof args[0] === "string") playerName = args[0];
            }

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

        // re-join lobby group when the connection is re-established (on reconnect)
        this.connection.onreconnected(async (connectionId?: string) => {
            console.debug("[hub] reconnected, connectionId=", connectionId);
            try {
                if (this.lastLobbyId && this.lastPlayerName) {
                    // re-invoke AddPlayerToLobby so server adds this connection to the group and updates ConnectionId
                    await this.connection!.invoke("AddPlayerToLobby", this.lastLobbyId, this.lastPlayerName, this.lastIconId ?? 0);
                    console.debug("[hub] re-joined lobby", this.lastLobbyId);
                }
            } catch (err) {
                console.error("Failed to re-join lobby after reconnect", err);
            }
        });

        await this.connection.start();
    }

    async addPlayerToLobby(lobbyId: string, playerName: string, iconId = 0) {
        // store joining info for reconnects
        this.lastLobbyId = lobbyId;
        this.lastPlayerName = playerName;
        this.lastIconId = iconId;

        if (!this.connection) await this.start();
        await this.connection!.invoke("AddPlayerToLobby", lobbyId, playerName, iconId);
    }

    async assignRoles(lobbyId: string) {
        if (!this.connection) await this.start();
        return await this.connection!.invoke<boolean>("AssignRoles", lobbyId);
    }

    // public registration helpers for the UI
    onPlayerJoinedHandler(cb: PlayerJoinedHandler) { this.onPlayerJoined = cb; }
    onPlayersStateHandler(cb: (names: string[]) => void) { this.onPlayersState = cb; }
    onAssignedRoleHandler(cb: AssignedRoleHandler) { this.onAssignedRole = cb; }
    onReceiveImageHandler(cb: ReceiveImageHandler) { this.onReceiveImage = cb; }
    onRolesAssignedHandler(cb: RolesAssignedHandler) { this.onRolesAssigned = cb; }

    // utility to register arbitrary raw handlers if needed
    registerRawHandler(eventName: string, cb: (...args: any[]) => void) {
        if (!this.connection) return;
        this.connection.on(eventName, cb);
    }
}

export default new LobbyHubClient();