import axiosClient from "../config/axios.js";

// ─── Import Excel ───────────────────────────────────────────────────
export const importSynonyms = (words) =>
    axiosClient.post("/synonyms/import", { words }).then((r) => r.data);

// ─── Clusters ───────────────────────────────────────────────────────
export const getClusters = (params = {}) =>
    axiosClient.get("/synonyms/clusters", { params }).then((r) => r.data);

// ─── Study ──────────────────────────────────────────────────────────
export const getNextCluster = (showAll = false) =>
    axiosClient.get("/synonyms/next-cluster", { params: { showAll } }).then((r) => r.data);

export const getClusterForStudy = (clusterName, showAll = false) =>
    axiosClient.get(`/synonyms/cluster/${encodeURIComponent(clusterName)}`, { params: { showAll } }).then((r) => r.data);

// ─── Progress ───────────────────────────────────────────────────────
export const saveProgress = (data) =>
    axiosClient.post("/synonyms/progress", data).then((r) => r.data);

export const getProgressOverview = () =>
    axiosClient.get("/synonyms/progress").then((r) => r.data);

// ─── Word Management ────────────────────────────────────────────────
export const getWordsByCluster = (clusterName, params = {}) =>
    axiosClient.get(`/synonyms/cluster/${encodeURIComponent(clusterName)}/words`, { params }).then((r) => r.data);

export const updateSynonymWord = (wordId, data) =>
    axiosClient.put(`/synonyms/words/${wordId}`, data).then((r) => r.data);

export const deleteSynonymWord = (wordId) =>
    axiosClient.delete(`/synonyms/words/${wordId}`).then((r) => r.data);

export const deleteCluster = (clusterName) =>
    axiosClient.delete(`/synonyms/cluster/${encodeURIComponent(clusterName)}`).then((r) => r.data);
