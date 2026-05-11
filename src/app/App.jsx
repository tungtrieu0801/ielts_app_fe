import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from "../features/auth/pages/LoginPage.jsx";
import AppRoutes from "./AppRoutes.jsx";
import { useAuthStore } from '../stores/useAuthStore';
import { useSocketStore } from '../stores/useSocketStore';
import { useGameStore } from '../stores/useGameStore';

function App() {
    const token = useAuthStore(s => s.token);
    const user = useAuthStore(s => s.user);
    const { connect, disconnect, socket } = useSocketStore();
    const { initListeners, clearListeners } = useGameStore();

    React.useEffect(() => {
        if (token) {
            connect(token);
        } else {
            disconnect();
        }
    }, [token, connect, disconnect]);

    // Initialize game listeners when socket is ready
    React.useEffect(() => {
        if (socket) {
            initListeners(socket);
            
            const handleConnect = () => {
                if (user?._id) socket.emit("user_online", user._id);
            };

            // Emit immediately if already connected
            if (socket.connected) {
                handleConnect();
            }

            // Re-emit when socket auto-reconnects
            socket.on("connect", handleConnect);

            return () => {
                socket.off("connect", handleConnect);
                clearListeners();
            };
        }
    }, [socket, initListeners, clearListeners, user?._id]);

    return (
        <BrowserRouter>
            <AppRoutes />
        </BrowserRouter>
    );
}

export default App;