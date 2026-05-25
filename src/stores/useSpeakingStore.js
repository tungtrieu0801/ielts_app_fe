import { create } from "zustand";
import * as speakingApi from "../services/speakingApi.js";

export const useSpeakingStore = create((set, get) => ({
    topics: [],
    attempts: [],
    loading: false,
    error: null,

    // Fetch topics (optional partType filter)
    fetchTopics: async (partType = null) => {
        set({ loading: true, error: null });
        try {
            const data = await speakingApi.getTopics(partType);
            set({ topics: data.topics || [], loading: false });
        } catch (err) {
            console.error("Error fetching speaking topics:", err);
            set({ error: err.response?.data?.message || "Failed to load speaking topics", loading: false });
        }
    },

    // Fetch preparation attempt logs
    fetchAttempts: async () => {
        set({ loading: true, error: null });
        try {
            const data = await speakingApi.getAttempts();
            set({ attempts: data.attempts || [], loading: false });
        } catch (err) {
            console.error("Error fetching speaking attempts:", err);
            set({ error: err.response?.data?.message || "Failed to load preparation logs", loading: false });
        }
    },

    // Add new speaking topic (Admin-only)
    addTopic: async (topicData) => {
        set({ loading: true, error: null });
        try {
            const res = await speakingApi.createTopic(topicData);
            await get().fetchTopics();
            set({ loading: false });
            return res;
        } catch (err) {
            console.error("Error adding speaking topic:", err);
            set({ error: err.response?.data?.message || "Failed to add speaking topic", loading: false });
            throw err;
        }
    },

    // Update existing speaking topic (Admin-only)
    editTopic: async (id, topicData) => {
        set({ loading: true, error: null });
        try {
            const res = await speakingApi.updateTopic(id, topicData);
            await get().fetchTopics();
            set({ loading: false });
            return res;
        } catch (err) {
            console.error("Error updating speaking topic:", err);
            set({ error: err.response?.data?.message || "Failed to update speaking topic", loading: false });
            throw err;
        }
    },

    // Delete speaking topic (Admin-only)
    removeTopic: async (id) => {
        set({ loading: true, error: null });
        try {
            const res = await speakingApi.deleteTopic(id);
            await get().fetchTopics();
            set({ loading: false });
            return res;
        } catch (err) {
            console.error("Error deleting speaking topic:", err);
            set({ error: err.response?.data?.message || "Failed to delete speaking topic", loading: false });
            throw err;
        }
    },

    // Submit prepared outline draft
    submitPractice: async (topicId, draftText, seconds) => {
        set({ loading: true, error: null });
        try {
            const res = await speakingApi.submitAttempt(topicId, {
                draftText,
                timeSpentSeconds: seconds,
            });
            await get().fetchAttempts();
            set({ loading: false });
            return res; // Returns { attempt, sampleAnswer }
        } catch (err) {
            console.error("Error submitting speaking practice:", err);
            set({ error: err.response?.data?.message || "Failed to log preparation", loading: false });
            throw err;
        }
    },
}));
