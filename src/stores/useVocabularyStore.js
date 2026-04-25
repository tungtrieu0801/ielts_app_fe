import { create } from "zustand";
import * as vocab from "../services/vocabularyApi.js";

export const useVocabularyStore = create((set, get) => ({
    wordSets: [],
    folders: [],
    publicSets: [],
    currentSet: null,
    words: [],
    totalWords: 0,
    loading: false,
    publicLoading: false,
    error: null,

    // --- Folders ---
    fetchFolders: async () => {
        set({ loading: true, error: null });
        try {
            const data = await import("../services/folderApi.js").then(m => m.getFolders());
            set({ folders: data, loading: false });
        } catch (e) {
            set({ error: e.message, loading: false });
        }
    },

    createFolder: async (payload) => {
        const newFolder = await import("../services/folderApi.js").then(m => m.createFolder(payload));
        set((s) => ({ folders: [newFolder, ...s.folders] }));
        return newFolder;
    },

    updateFolder: async (id, payload) => {
        const updated = await import("../services/folderApi.js").then(m => m.updateFolder(id, payload));
        set((s) => ({
            folders: s.folders.map(f => f._id === id ? updated : f)
        }));
    },

    deleteFolder: async (id) => {
        await import("../services/folderApi.js").then(m => m.deleteFolder(id));
        set((s) => ({ folders: s.folders.filter(f => f._id !== id) }));
        // After deleting folder, associated sets are moved to root in backend. 
        // We should refresh both sets and folders.
        await get().fetchFolders();
        await get().fetchWordSets();
    },

    // --- My WordSets ---
    fetchWordSets: async (folderId = null) => {
        set({ loading: true, error: null });
        try {
            const data = await vocab.getWordSets(folderId);
            set({ wordSets: data, loading: false });
        } catch (e) {
            set({ error: e.message, loading: false });
        }
    },

    createWordSet: async (payload) => {
        const newSet = await vocab.createWordSet(payload);
        set((s) => ({ wordSets: [newSet, ...s.wordSets] }));
        return newSet;
    },

    updateWordSet: async (id, payload) => {
        const updated = await vocab.updateWordSet(id, payload);
        set((s) => ({
            wordSets: s.wordSets.map((ws) => (ws._id === id ? updated : ws)),
        }));
    },

    deleteWordSet: async (id) => {
        await vocab.deleteWordSet(id);
        set((s) => ({ wordSets: s.wordSets.filter((ws) => ws._id !== id) }));
    },

    setCurrentSet: (set_) => set({ currentSet: set_ }),

    // --- Public WordSets ---
    fetchPublicSets: async () => {
        set({ publicLoading: true });
        try {
            const data = await vocab.getPublicSets();
            set({ publicSets: data, publicLoading: false });
        } catch (e) {
            set({ publicLoading: false });
        }
    },

    forkWordSet: async (id) => {
        const res = await vocab.forkWordSet(id);
        if (res.data && !res.alreadyForked) {
            // Add forked set to my sets
            set((s) => ({ wordSets: [res.data, ...s.wordSets] }));
        }
        return res;
    },

    // --- Words ---
    fetchWords: async (setId, params) => {
        set({ loading: true, error: null });
        try {
            const res = await vocab.getWords(setId, params);
            set({ words: res.data, totalWords: res.total, loading: false });
        } catch (e) {
            set({ error: e.message, loading: false });
        }
    },

    bulkSaveWords: async (setId, words) => {
        const res = await vocab.bulkCreateWords(setId, words);
        // Refresh word list & wordCount
        await get().fetchWords(setId);
        await get().fetchWordSets();
        return res;
    },

    deleteWord: async (setId, wordId) => {
        await vocab.deleteWord(setId, wordId);
        set((s) => ({ words: s.words.filter((w) => w._id !== wordId) }));
        await get().fetchWordSets();
    },

    updateWord: async (setId, wordId, payload) => {
        const updated = await vocab.updateWord(setId, wordId, payload);
        set((s) => ({
            words: s.words.map((w) => (w._id === wordId ? updated : w)),
        }));
    },
}));
