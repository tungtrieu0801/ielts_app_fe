import { create } from "zustand";
import * as survivalApi from "../services/gameApi.js";

export const useSurvivalStore = create((set, get) => ({
    questions: [],
    highScore: 0,
    leaderboard: [],
    stats: null,
    loading: false,
    error: null,

    fetchQuestions: async (limit = 15) => {
        set({ loading: true, error: null });
        try {
            const res = await survivalApi.getSurvivalQuestions(limit);
            set({ questions: res.data, loading: false });
            return res.data;
        } catch (e) {
            set({ error: e.message, loading: false });
            return [];
        }
    },

    submitScore: async (score, results) => {
        set({ loading: true });
        try {
            const res = await survivalApi.submitSurvivalScore(score, results);
            set({ highScore: res.highScore, loading: false });
            return res;
        } catch (e) {
            set({ error: e.message, loading: false });
            return null;
        }
    },

    fetchLeaderboard: async () => {
        set({ loading: true });
        try {
            const data = await survivalApi.getSurvivalLeaderboard();
            set({ leaderboard: data, loading: false });
        } catch (e) {
            set({ error: e.message, loading: false });
        }
    },

    fetchStats: async () => {
        set({ loading: true });
        try {
            const data = await survivalApi.getSurvivalStats();
            set({ stats: data, loading: false });
        } catch (e) {
            set({ error: e.message, loading: false });
        }
    }
}));
