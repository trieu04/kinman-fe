import { useEffect } from "react";
import { io, Socket } from "socket.io-client";

interface RealtimeMessage {
    type: "expense-added" | "expense-updated" | "expense-deleted" | "group-updated" | "debt-settled";
    data: any;
    timestamp: number;
    userId?: string;
}

class RealtimeService {
    private socket: Socket | null = null;
    private url: string;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 3000;
    private listeners: Map<string, Set<(data: any) => void>> = new Map();

    constructor(wsUrl: string = import.meta.env.VITE_WS_URL || "http://localhost:3000") {
        this.url = wsUrl;
    }

    connect(token: string) {
        if (this.socket?.connected) return;

        try {
            this.socket = io(this.url, {
                query: { token },
                reconnection: true,
                reconnectionDelay: this.reconnectDelay,
                reconnectionDelayMax: 10000,
                reconnectionAttempts: this.maxReconnectAttempts,
            });

            this.socket.on("connect", () => {
                console.log("✅ Socket.IO connected");
                this.reconnectAttempts = 0;
            });

            this.socket.on("message", (message: RealtimeMessage) => {
                try {
                    this.emit(message.type, message.data);
                } catch (e) {
                    console.error("Error processing message:", e);
                }
            });

            // Listen to all emitted events
            this.socket.onAny((eventName, ...args) => {
                console.log("Event received:", eventName, args);
                if (["expense-added", "expense-updated", "expense-deleted", "group-updated", "debt-settled"].includes(eventName)) {
                    this.emit(eventName, args[0]);
                }
            });

            this.socket.on("error", (error) => {
                console.error("Socket.IO error:", error);
                this.handleReconnect();
            });

            this.socket.on("disconnect", () => {
                console.log("❌ Socket.IO disconnected");
                this.handleReconnect();
            });
        } catch (e) {
            console.error("Failed to connect WebSocket:", e);
            this.handleReconnect();
        }
    }

    private handleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            setTimeout(() => {
                const token = localStorage.getItem("accessToken");
                if (token) this.connect(token);
            }, this.reconnectDelay * this.reconnectAttempts);
        }
    }

    subscribeToGroup(groupId: string) {
        if (!groupId) return;
        this.socket?.emit("subscribe-group", groupId);
    }

    unsubscribeFromGroup(groupId: string) {
        if (!groupId) return;
        this.socket?.emit("unsubscribe-group", groupId);
    }

    subscribe(eventType: string, callback: (data: any) => void) {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, new Set());
        }
        this.listeners.get(eventType)!.add(callback);

        // Return unsubscribe function
        return () => {
            this.listeners.get(eventType)?.delete(callback);
        };
    }

    private emit(eventType: string, data: any) {
        this.listeners.get(eventType)?.forEach((callback) => callback(data));
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}

export const realtimeService = new RealtimeService();

/**
 * Hook to automatically sync state with WebSocket events
 * Components should listen to these events and refetch data as needed
 */
export function useRealtimeSync() {
    useEffect(() => {
        // Subscribe to events and trigger window events for components to listen
        const unsubscribeExpenseAdded = realtimeService.subscribe("expense-added", (data) => {
            window.dispatchEvent(new CustomEvent("realtime:expense-added", { detail: data }));
        });

        const unsubscribeExpenseUpdated = realtimeService.subscribe("expense-updated", (data) => {
            window.dispatchEvent(new CustomEvent("realtime:expense-updated", { detail: data }));
        });

        const unsubscribeExpenseDeleted = realtimeService.subscribe("expense-deleted", (data) => {
            window.dispatchEvent(new CustomEvent("realtime:expense-deleted", { detail: data }));
        });

        const unsubscribeGroupUpdated = realtimeService.subscribe("group-updated", (data) => {
            window.dispatchEvent(new CustomEvent("realtime:group-updated", { detail: data }));
        });

        const unsubscribeDebtSettled = realtimeService.subscribe("debt-settled", (data) => {
            window.dispatchEvent(new CustomEvent("realtime:debt-settled", { detail: data }));
        });

        return () => {
            unsubscribeExpenseAdded();
            unsubscribeExpenseUpdated();
            unsubscribeExpenseDeleted();
            unsubscribeGroupUpdated();
            unsubscribeDebtSettled();
        };
    }, []);
}
