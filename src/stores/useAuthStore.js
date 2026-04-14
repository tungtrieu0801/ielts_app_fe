import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            token: null,
            colorMode: 'light', // Lưu preference per-user

            setAuth: (user, token) => {
                set({ user, token });
                if (token) localStorage.setItem('token', token);
            },

            logout: () => {
                set({ user: null, token: null });
                localStorage.removeItem('token');
            },

            setColorModePreference: (mode) => {
                set({ colorMode: mode });
            },
        }),
        {
            name: 'auth-storage',
            // Chỉ persist những field cần thiết
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                colorMode: state.colorMode,
            }),
        }
    )
);