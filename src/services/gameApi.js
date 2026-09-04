import axiosClient from "../config/axios.js";

export const getSurvivalQuestions = (limit = 10, levels = "") =>
    axiosClient.get("/game/api/survival/questions", { params: { limit, levels } }).then((r) => r.data);

export const submitSurvivalScore = (score, results, saveWords = false) =>
    axiosClient.post("/game/api/survival/score", { score, results, saveWords }).then((r) => r.data);

export const getSurvivalLeaderboard = () =>
    axiosClient.get("/game/api/survival/leaderboard").then((r) => r.data.data);

export const getSurvivalStats = () =>
    axiosClient.get("/game/api/survival/stats").then((r) => r.data.data);
