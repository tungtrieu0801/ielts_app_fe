import { create } from "zustand";
import * as vocab from "../services/vocabularyApi.js";

export const useVocabularyStore = create((set, get) => ({
    wordSets: [],
    currentSet: null,
    words: [],
    totalWords: 0,
    loading: false,
    error: null,

    // --- WordSets ---
    fetchWordSets: async () => {
        set({ loading: true, error: null });
        try {
            const data = await vocab.getWordSets();
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
