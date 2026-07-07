import axiosClient from "../config/axios.js";

export const getSurvivalQuestions = (limit = 10) =>
    axiosClient.get("/game/api/survival/questions", { params: { limit } }).then((r) => r.data);

export const submitSurvivalScore = (score, results) =>
    axiosClient.post("/game/api/survival/score", { score, results }).then((r) => r.data);

export const getSurvivalLeaderboard = () =>
    axiosClient.get("/game/api/survival/leaderboard").then((r) => r.data.data);

export const getSurvivalStats = () =>
    axiosClient.get("/game/api/survival/stats").then((r) => r.data.data);
