import { useEffect, useCallback } from "react";
import { realtimeService } from "@/services/realtimeService";
import { useAuthStore } from "@/stores/authStore";

export function useRealtimeConnection() {
    const { isAuthenticated, accessToken } = useAuthStore();

    useEffect(() => {
        if (isAuthenticated && accessToken) {
            realtimeService.connect(accessToken);
        }

        return () => {
            // Keep connection alive - don't disconnect on unmount
            // realtimeService.disconnect();
        };
    }, [isAuthenticated, accessToken]);
}

/**
 * Hook to listen to specific realtime events via custom window events
 * Components can refetch data when these events occur
 * @param eventType - Type of event to listen to (e.g., "realtime:expense-added")
 * @param callback - Function to call when event is received
 */
export function useRealtimeEvent(
    eventType: string,
    callback: (data: any) => void
) {
    const handler = useCallback((event: Event) => {
        if (event instanceof CustomEvent) {
            callback(event.detail);
        }
    }, [callback]);

    useEffect(() => {
        window.addEventListener(eventType, handler);
        return () => {
            window.removeEventListener(eventType, handler);
        };
    }, [eventType, handler]);
}
