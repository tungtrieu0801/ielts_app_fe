import axiosClient from "../config/axios.js";

export const getStudySession = (setId, limit = 20) =>
    axiosClient.get(`/study/${setId}/session`, { params: { limit } }).then((r) => r.data);

export const submitReview = (wordId, quality) =>
    axiosClient.post(`/study/${wordId}/review`, { quality }).then((r) => r.data);

export const getStudyStats = () =>
    axiosClient.get("/study/stats").then((r) => r.data.data);
