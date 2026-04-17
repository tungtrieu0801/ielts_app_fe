import { create } from "zustand";
import * as studyApi from "../services/studyApi.js";

export const useStudyStore = create((set) => ({
    queue: [],          // Danh sách thẻ cần học trong session này
    currentIndex: 0,    // Thẻ hiện tại
    mode: "flashcard",  // "flashcard" | "fill"
    sessionMode: "srs_review",
    stats: null,
    loading: false,
    sessionComplete: false,
    reviewedCount: 0,

    // Heatmap & streak
    heatmap: [],        // [{ date: "YYYY-MM-DD", wordsReviewed, minutesStudied }]
    streakInfo: null,   // { currentStreak, longestStreak, totalStudyDays }

    // Khởi tạo session học cho 1 bộ từ
    startSession: async (setId, mode = "flashcard") => {
        set({ loading: true, sessionComplete: false, reviewedCount: 0 });
        try {
            const res = await studyApi.getStudySession(setId);
            set({
                queue: res.data,
                currentIndex: 0,
                mode,
                sessionMode: res.mode,
                loading: false,
            });
        } catch (e) {
            set({ loading: false });
            throw e;
        }
    },

    // Submit kết quả đánh giá thẻ hiện tại (quality: 0-3)
    submitCard: async (wordId, quality) => {
        await studyApi.submitReview(wordId, quality);
        set((s) => {
            const next = s.currentIndex + 1;
            const done = next >= s.queue.length;
            return {
                currentIndex: next,
                reviewedCount: s.reviewedCount + 1,
                sessionComplete: done,
            };
        });
    },

    // Chuyển mode
    setMode: (mode) => set({ mode }),

    // Lấy thống kê tổng quan
    fetchStats: async () => {
        try {
            const data = await studyApi.getStudyStats();
            set({ stats: data });
        } catch (_) {}
    },

    // Lấy dữ liệu heatmap 365 ngày
    fetchHeatmap: async () => {
        try {
            const data = await studyApi.getHeatmap();
            set({ heatmap: data });
        } catch (_) {}
    },

    // Lấy thông tin streak
    fetchStreakInfo: async () => {
        try {
            const data = await studyApi.getStreakInfo();
            set({ streakInfo: data });
        } catch (_) {}
    },

    resetSession: () =>
        set({ queue: [], currentIndex: 0, sessionComplete: false, reviewedCount: 0 }),
}));
