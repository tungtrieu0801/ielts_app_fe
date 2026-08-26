import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from "../features/auth/pages/LoginPage.jsx";
import AppRoutes from "./AppRoutes.jsx";
import { useAuthStore } from '../stores/useAuthStore';
import { useSocketStore } from '../stores/useSocketStore';
import { useGameStore } from '../stores/useGameStore';

import ChatNotificationListener from '../features/home/components/ChatNotificationListener.jsx';

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

    // Auto re-verify socket connection when switching back to tab
    React.useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && token) {
                const s = useSocketStore.getState().socket;
                if (!s || !s.connected) {
                    console.log("⚡ Tab visible again: Re-connecting socket...");
                    connect(token);
                } else if (user?._id) {
                    s.emit("user_online", user._id);
                }
            }
        };

        window.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleVisibilityChange);
        return () => {
            window.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleVisibilityChange);
        };
    }, [token, connect, user?._id]);

    return (
        <BrowserRouter>
            <ChatNotificationListener />
            <AppRoutes />
        </BrowserRouter>
    );
}

export default App;