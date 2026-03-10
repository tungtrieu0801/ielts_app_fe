import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            token: null,

            // Hàm này gọi khi login thành công
            setAuth: (user, token) => {
                set({ user, token });
                if (token) localStorage.setItem('token', token);
            },

            // Hàm logout
            logout: () => {
                set({ user: null, token: null });
                localStorage.removeItem('token');
            },
        }),
        {
            name: 'auth-storage', // Tên key trong LocalStorage
        }
    )
);