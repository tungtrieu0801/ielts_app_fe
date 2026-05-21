import axiosClient from "../config/axios.js";

export const getStudySession = (setId, excludeIds = [], limit = 20) => {
    const params = { limit };
    if (excludeIds && excludeIds.length > 0) {
        params.excludeIds = excludeIds.join(",");
    }
    return axiosClient.get(`/study/${setId}/session`, { params }).then((r) => r.data);
};

export const getGlobalStudySession = (limit = 20) =>
    axiosClient.get("/study/global-session", { params: { limit } }).then((r) => r.data);

export const batchSubmit = (answers, isSetStudy = false) =>
    axiosClient.post("/study/batch-submit", { answers, isSetStudy }).then((r) => r.data);

export const getStudyStats = () =>
    axiosClient.get("/study/stats").then((r) => r.data.data);

export const getHeatmap = () =>
    axiosClient.get("/study/heatmap").then((r) => r.data.data);

export const getStreakInfo = () =>
    axiosClient.get("/study/streak").then((r) => r.data.data);

export const getSchedule = () =>
    axiosClient.get("/study/schedule").then((r) => r.data.data);

export const getRanking = () =>
    axiosClient.get("/study/ranking").then((r) => r.data.data);

export const getSetStats = (setId) =>
    axiosClient.get(`/study/${setId}/stats`).then((r) => r.data.data);
