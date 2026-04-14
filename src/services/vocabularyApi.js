import axiosClient from "../config/axios.js";

// Word Sets CRUD
export const getWordSets = () =>
    axiosClient.get("/wordsets").then((r) => r.data.data);

export const createWordSet = (data) =>
    axiosClient.post("/wordsets", data).then((r) => r.data.data);

export const updateWordSet = (id, data) =>
    axiosClient.put(`/wordsets/${id}`, data).then((r) => r.data.data);

export const deleteWordSet = (id) =>
    axiosClient.delete(`/wordsets/${id}`).then((r) => r.data);

// Words CRUD
export const getWords = (setId, params = {}) =>
    axiosClient.get(`/wordsets/${setId}/words`, { params }).then((r) => r.data);

export const createWord = (setId, data) =>
    axiosClient.post(`/wordsets/${setId}/words`, data).then((r) => r.data.data);

export const bulkCreateWords = (setId, words) =>
    axiosClient.post(`/wordsets/${setId}/words/bulk`, { words }).then((r) => r.data);

export const updateWord = (setId, wordId, data) =>
    axiosClient.put(`/wordsets/${setId}/words/${wordId}`, data).then((r) => r.data.data);

export const deleteWord = (setId, wordId) =>
    axiosClient.delete(`/wordsets/${setId}/words/${wordId}`).then((r) => r.data);
