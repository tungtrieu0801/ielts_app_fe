import { create } from "zustand";
import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const socketURL = API_URL.replace(/\/api\/?$/, "");

export const useSocketStore = create((set, get) => ({
    socket: null,
    connected: false,

    connect: (token) => {
        if (!token) return;
        if (get().socket?.connected) return;

        // Cleanup old socket if exists
        if (get().socket) get().socket.disconnect();

        const socket = io(socketURL, {
            path: "/socket.io",
            auth: { token },
            withCredentials: true,
            transports: ["websocket"]
        });

        socket.on("connect", () => {
            set({ connected: true });
            console.log("✅ Global socket connected:", socket.id);
        });

        socket.on("disconnect", (reason) => {
            set({ connected: false });
            console.log("⚠️ Global socket disconnected:", reason);
        });

        set({ socket });
    },

    disconnect: () => {
        const { socket } = get();
        if (socket) {
            socket.disconnect();
            set({ socket: null, connected: false });
        }
    }
}));
