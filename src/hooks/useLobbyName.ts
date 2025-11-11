import { useState, useEffect } from "react";
import * as api from "../services/lobbyApi";
import lobbyHub from "../services/lobbyHub";

const STORAGE_KEY = "lobbyName";
const EVENT_NAME = "lobbyNameChanged";

/**
 * useLobbyName - stores username in sessionStorage (per-tab) so different
 * pages/tabs can have different usernames. Uses a custom in-tab event
 * to keep multiple hook instances in-sync within the same tab.
 */
export function useLobbyName(initialName = "") {
    // initialize from sessionStorage when available (per-tab)
    const [name, setNameState] = useState<string>(() => {
        try {
            const saved = sessionStorage.getItem(STORAGE_KEY);
            return saved ?? initialName;
        } catch {
            return initialName;
        }
    });

    const [status, setStatus] = useState("");

    useEffect(() => {
        const handler = (e: Event) => {
            const detail = (e as CustomEvent<string>).detail;
            if (typeof detail === "string") setNameState(detail);
        };
        window.addEventListener(EVENT_NAME, handler as EventListener);

        return () => {
            window.removeEventListener(EVENT_NAME, handler as EventListener);
        };
    }, []);

    const updateName = async (newName: string) => {
        try {
            // update local state immediately (UI reflects change)
            setNameState(newName);

            // persist to sessionStorage (per-tab)
            try {
                sessionStorage.setItem(STORAGE_KEY, newName);
                // notify other hook instances in the same tab
                try {
                    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: newName }));
                } catch {
                    // ignore if dispatch not allowed
                }
            } catch {
                // ignore sessionStorage errors
            }

            // optional server/hub notifications (unchanged)
            const res = await api.updatePlayerName?.(newName);
            if (res?.ok) {
                setStatus("Name updated");
            } else {
                setStatus("Failed to update name");
            }

            await lobbyHub.sendPlayerName?.(newName);
        } catch (err) {
            console.error("Error updating name", err);
            setStatus("Error: " + ((err as any)?.message ?? String(err)));
        }
    };

    return { name, setName: updateName, status };
}
