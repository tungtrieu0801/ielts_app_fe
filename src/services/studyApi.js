import axiosClient from "../config/axios.js";

export const getStudySession = (setId) =>
    axiosClient.get(`/study/${setId}/session`).then((r) => r.data);

export const batchSubmit = (answers) =>
    axiosClient.post("/study/batch-submit", { answers }).then((r) => r.data);

export const getStudyStats = () =>
    axiosClient.get("/study/stats").then((r) => r.data.data);

export const getHeatmap = () =>
    axiosClient.get("/study/heatmap").then((r) => r.data.data);

export const getStreakInfo = () =>
    axiosClient.get("/study/streak").then((r) => r.data.data);

export const getSchedule = () =>
    axiosClient.get("/study/schedule").then((r) => r.data.data);
