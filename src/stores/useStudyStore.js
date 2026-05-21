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
            sessionHistory: {},  // detailed answer stats for each card: { cardId -> { english, vietnamese, correct, timeMs, mode } }
            completedSetCardIds: [], // Track studied cardIds for wordset sessions to avoid duplicates
            wordsPerSession: 20, // number of words to learn per session

            // ── Per-card answers buffer ───────────────────────────────────────
            // Map of cardId → "AGAIN" | "HARD" | "GOOD" | "EASY"
            answers: {},

            // ── Stats & streak (persisted) ────────────────────────────────────
            streakInfo: null,
            stats: null,

            // ─── Actions ─────────────────────────────────────────────────────

            startSession: async (setId, isContinue = false) => {
                const nextExcludeIds = isContinue ? (get().completedSetCardIds || []) : [];
                set({
                    loading: true,
                    sessionComplete: false,
                    submitResult: null,
                    answers: {},
                    sessionHistory: {},
                    currentIndex: 0,
                    currentSetId: setId,
                    nextReviewAt: null,
                    completedSetCardIds: nextExcludeIds,
                });
                try {
                    const limit = get().wordsPerSession || 20;
                    const res = await studyApi.getStudySession(setId, nextExcludeIds, limit);
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
                    sessionHistory: {},
                    currentIndex: 0,
                    currentSetId: "global",
                    nextReviewAt: null,
                    completedSetCardIds: [],
                });
                try {
                    const limit = get().wordsPerSession || 20;
                    const res = await studyApi.getGlobalStudySession(limit);
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
            answerCard: (cardId, quality, details = null) => {
                const { answers, currentIndex, queue, mode, sessionHistory } = get();
                const card = queue.find(c => c.cardId === cardId) || queue[currentIndex];

                const newHistory = { ...sessionHistory };
                if (card) {
                    newHistory[cardId] = {
                        english: card.english,
                        vietnamese: card.vietnamese,
                        mode,
                        quality,
                        isCorrect: details?.isCorrect ?? (quality !== "AGAIN"),
                        timeMs: mode === "flashcard" ? null : (details?.timeMs ?? null),
                    };
                }

                set({
                    answers: { ...answers, [cardId]: quality },
                    sessionHistory: newHistory,
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
                const { answers, currentSetId, completedSetCardIds } = get();
                const entries = Object.entries(answers).map(([cardId, quality]) => ({
                    cardId,
                    quality,
                }));

                if (entries.length === 0) return;

                set({ submitting: true });
                try {
                    const isSetStudy = currentSetId !== "global";
                    const result = await studyApi.batchSubmit(entries, isSetStudy);
                    
                    const cardIds = Object.keys(answers);
                    const updatedExcludeList = isSetStudy
                        ? [...(completedSetCardIds || []), ...cardIds]
                        : [];

                    set({
                        completedSetCardIds: updatedExcludeList,
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
                    sessionHistory: {},
                    currentSetId: null,
                    completedSetCardIds: [],
                });
            },

            setWordsPerSession: (count) => set({ wordsPerSession: count }),

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
                completedSetCardIds: state.completedSetCardIds,
                wordsPerSession: state.wordsPerSession,
                // Don't persist queue/answers — always fresh from API
            }),
        }
    )
);
