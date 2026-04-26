import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUIStore = create(
    persist(
        (set) => ({
            currentPalette: 'warm', // 'warm' | 'navy'
            
            setPalette: (palette) => set({ currentPalette: palette }),
        }),
        {
            name: 'ielts-vocab-ui-storage',
        }
    )
);
