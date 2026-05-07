import axiosClient from "../config/axios.js";

export const prepareText = (data) =>
    axiosClient.post("/dictation/prepare-text", data);

export const prepareYoutube = (data) =>
    axiosClient.post("/dictation/prepare-youtube", data);

export const getSharedLibrary = (userId, page = 1, limit = 10) =>
    axiosClient.get(`/dictation/shared-library?userId=${userId}&page=${page}&limit=${limit}`);

export const saveDictationProgress = (data) =>
    axiosClient.post("/dictation/progress/save", data);
