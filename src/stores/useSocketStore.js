import { create } from "zustand";
import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const socketURL = API_URL.replace(/\/api\/?$/, "");

export const useSocketStore = create((set, get) => ({
    socket: null,
    connected: false,

    connect: (token) => {
        if (!token) return;
        
        const existingSocket = get().socket;
        if (existingSocket?.connected) return;

        // Cleanup old socket if exists
        if (existingSocket) {
            existingSocket.disconnect();
        }

        const socket = io(socketURL, {
            path: "/socket.io",
            auth: { token },
            withCredentials: true,
            transports: ["websocket", "polling"], // Allow polling fallback if websocket drops
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 3000,
            timeout: 20000,
        });

        socket.on("connect", () => {
            set({ connected: true });
            console.log("✅ Global socket connected:", socket.id);
        });

        socket.on("disconnect", (reason) => {
            set({ connected: false });
            console.log("⚠️ Global socket disconnected:", reason);
            if (reason === "io server disconnect") {
                // If disconnected by server, manually reconnect
                socket.connect();
            }
        });

        socket.io?.on("reconnect", (attempt) => {
            set({ connected: true });
            console.log("🔄 Global socket reconnected after", attempt, "attempts");
        });

        set({ socket });
    },

    ensureConnected: (token) => {
        const { socket, connected, connect } = get();
        if (!socket || !connected) {
            connect(token);
        }
    },

    disconnect: () => {
        const { socket } = get();
        if (socket) {
            socket.disconnect();
            set({ socket: null, connected: false });
        }
    }
}));
