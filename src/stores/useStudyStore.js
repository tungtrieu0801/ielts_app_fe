import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as studyApi from "../services/studyApi.js";

/**
 * useStudyStore — manages the session lifecycle with batch submission.
 *
 * Flow:
 *  1. startSession(setId)  →  fetches cards from BE
 *  2. User answers each card → recorded locally in `answers` map: { cardId → quality }
 *  3. nextCard() / prevCard() to navigate (cards can be answered in any order)
 *  4. submitSession() → POST /study/batch-submit with all answers
 *  5. sessionComplete becomes true → StudyComplete popup
 */
export const useStudyStore = create(
    persist(
        (set, get) => ({
            // ── Session state ─────────────────────────────────────────────────
            currentSetId: null,
            queue: [],           // array of card objects (word + srs metadata)
            currentIndex: 0,     // which card is shown
            mode: "flashcard",   // "flashcard" | "fill"
            loading: false,
            submitting: false,
            sessionComplete: false,
            submitResult: null,  // { reviewed, summary: { AGAIN, HARD, GOOD, EASY } }
            nextReviewAt: null,  // earliest upcoming card's nextReview

            // ── Per-card answers buffer ───────────────────────────────────────
            // Map of cardId → "AGAIN" | "HARD" | "GOOD" | "EASY"
            answers: {},

            // ── Stats & streak (persisted) ────────────────────────────────────
            streakInfo: null,
            stats: null,

            // ─── Actions ─────────────────────────────────────────────────────

            startSession: async (setId) => {
                set({
                    loading: true,
                    sessionComplete: false,
                    submitResult: null,
                    answers: {},
                    currentIndex: 0,
                    currentSetId: setId,
                    nextReviewAt: null,
                });
                try {
                    const res = await studyApi.getStudySession(setId);
                    set({
                        queue: res.data ?? [],
                        nextReviewAt: res.nextReviewAt ?? null,
                        loading: false,
                    });
                } catch (e) {
                    set({ loading: false });
                    throw e;
                }
            },

            startGlobalSession: async () => {
                set({
                    loading: true,
                    sessionComplete: false,
                    submitResult: null,
                    answers: {},
                    currentIndex: 0,
                    currentSetId: "global",
                    nextReviewAt: null,
                });
                try {
                    const res = await studyApi.getGlobalStudySession();
                    set({
                        queue: res.data ?? [],
                        nextReviewAt: res.nextReviewAt ?? null,
                        loading: false,
                    });
                } catch (e) {
                    set({ loading: false });
                    throw e;
                }
            },

            /** Record the user's answer for the current card and advance to next. */
            answerCard: (cardId, quality) => {
                const { answers, currentIndex, queue } = get();
                set({
                    answers: { ...answers, [cardId]: quality },
                });
                // Auto-advance if not on the last card
                if (currentIndex < queue.length - 1) {
                    set({ currentIndex: currentIndex + 1 });
                }
            },

            goToCard: (index) => {
                const { queue } = get();
                if (index >= 0 && index < queue.length) {
                    set({ currentIndex: index });
                }
            },

            setMode: (mode) => set({ mode }),

            /** Submit all buffered answers to the backend in a single request. */
            submitSession: async () => {
                const { answers } = get();
                const entries = Object.entries(answers).map(([cardId, quality]) => ({
                    cardId,
                    quality,
                }));

                if (entries.length === 0) return;

                set({ submitting: true });
                try {
                    const result = await studyApi.batchSubmit(entries);
                    set({
                        submitting: false,
                        sessionComplete: true,
                        submitResult: result,
                    });
                } catch (e) {
                    set({ submitting: false });
                    throw e;
                }
            },

            resetSession: () => {
                // Cancel any pending speech to avoid old word playing over new session
                if (window.speechSynthesis) window.speechSynthesis.cancel();
                set({
                    queue: [],
                    currentIndex: 0,
                    sessionComplete: false,
                    submitResult: null,
                    answers: {},
                    currentSetId: null,
                });
            },

            // ── Stats/streak fetchers ─────────────────────────────────────────
            fetchStreakInfo: async () => {
                try {
                    const data = await studyApi.getStreakInfo();
                    set({ streakInfo: data });
                } catch (_) {}
            },

            fetchStats: async () => {
                try {
                    const data = await studyApi.getStudyStats();
                    set({ stats: data });
                } catch (_) {}
            },
        }),
        {
            name: "study-storage",
            partialize: (state) => ({
                currentSetId: state.currentSetId,
                mode: state.mode,
                streakInfo: state.streakInfo,
                stats: state.stats,
                // Don't persist queue/answers — always fresh from API
            }),
        }
    )
);
