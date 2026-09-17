import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const PRESET_WALLPAPERS = [
    {
        id: "none",
        name: "Mặc định (Không hình nền)",
        url: "",
        thumb: ""
    },
    {
        id: "cosmic",
        name: "Vũ trụ huyền ảo (Cosmic Galaxy)",
        url: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=1920&auto=format&fit=crop",
        thumb: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=300&auto=format&fit=crop"
    },
    {
        id: "nature",
        name: "Rừng xanh yên bình (Emerald Forest)",
        url: "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1920&auto=format&fit=crop",
        thumb: "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=300&auto=format&fit=crop"
    },
    {
        id: "sunset",
        name: "Hoàng hôn rực rỡ (Cyberpunk Sunset)",
        url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1920&auto=format&fit=crop",
        thumb: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=300&auto=format&fit=crop"
    },
    {
        id: "pastel",
        name: "Tranh mờ Pastel (Abstract Gradient)",
        url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1920&auto=format&fit=crop",
        thumb: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=300&auto=format&fit=crop"
    },
    {
        id: "ocean",
        name: "Đại dương sâu thẫm (Deep Ocean)",
        url: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=1920&auto=format&fit=crop",
        thumb: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=300&auto=format&fit=crop"
    }
];

export const useUIStore = create(
    persist(
        (set) => ({
            currentPalette: 'warm', // 'warm' | 'navy'
            bgPreset: 'none', // 'none' | preset id | 'custom'
            bgImage: '',
            bgBlur: 8, // 0..20 px
            bgOverlay: 0.25, // 0..0.6 opacity

            setPalette: (palette) => set({ currentPalette: palette }),
            setBgPreset: (presetId, url = '') => set({ bgPreset: presetId, bgImage: url }),
            setBgImage: (url) => set({ bgImage: url, bgPreset: url ? 'custom' : 'none' }),
            setBgBlur: (blur) => set({ bgBlur: blur }),
            setBgOverlay: (overlay) => set({ bgOverlay: overlay }),
            resetBg: () => set({ bgPreset: 'none', bgImage: '', bgBlur: 8, bgOverlay: 0.25 }),
        }),
        {
            name: 'ielts-vocab-ui-storage',
        }
    )
);

