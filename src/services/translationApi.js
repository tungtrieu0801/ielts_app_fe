import axiosClient from "../config/axios.js";

export const createTranslationSession = (data) =>
    axiosClient.post("/translation", data).then((res) => res.data);

export const getTranslationSessions = () =>
    axiosClient.get("/translation").then((res) => res.data);

export const getTranslationSessionById = (id) =>
    axiosClient.get(`/translation/${id}`).then((res) => res.data);

export const updateTranslationSession = (id, data) =>
    axiosClient.put(`/translation/${id}`, data).then((res) => res.data);

export const deleteTranslationSession = (id) =>
    axiosClient.delete(`/translation/${id}`).then((res) => res.data);

export const lookupWordApi = (word) =>
    axiosClient.get(`/translation/lookup-word?word=${encodeURIComponent(word)}`).then((res) => res.data);
