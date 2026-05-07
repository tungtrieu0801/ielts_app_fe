import axiosClient from "../config/axios.js";

export const prepareText = (text) =>
    axiosClient.post("/dictation/prepare-text", { text });

export const prepareYoutube = (url) =>
    axiosClient.post("/dictation/prepare-youtube", { url });

export const getSharedLibrary = (page = 1, limit = 10) =>
    axiosClient.get(`/dictation/shared-library?page=${page}&limit=${limit}`);

export const saveDictationProgress = (data) =>
    axiosClient.post("/dictation/progress/save", data);
