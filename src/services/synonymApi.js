import axiosClient from "../config/axios.js";

export const importSynonyms = async (words) => {
    const res = await axiosClient.post('/synonyms/import', { words });
    return res.data;
};

export const getClusters = async ({ showAll, page = 1, limit = 20, search = "" }) => {
    const res = await axiosClient.get('/synonyms/clusters', {
        params: { showAll, page, limit, search }
    });
    return res.data;
};

export const getNextCluster = async (showAll) => {
    const res = await axiosClient.get('/synonyms/next-cluster', {
        params: { showAll }
    });
    return res.data;
};

export const getClusterForStudy = async (clusterName, showAll) => {
    const res = await axiosClient.get('/synonyms/cluster', {
        params: { clusterName, showAll }
    });
    return res.data;
};

export const getWordsByCluster = async (clusterName, { page = 1, limit = 12 } = {}) => {
    const res = await axiosClient.get('/synonyms/cluster/words', {
        params: { clusterName, page, limit }
    });
    return res.data;
};

export const deleteCluster = async (clusterName) => {
    const res = await axiosClient.delete('/synonyms/cluster', {
        params: { clusterName }
    });
    return res.data;
};

export const saveProgress = async (data) => {
    const res = await axiosClient.post('/synonyms/progress', data);
    return res.data;
};

export const getProgressOverview = async () => {
    const res = await axiosClient.get('/synonyms/progress');
    return res.data;
};

export const updateSynonymWord = async (id, data) => {
    const res = await axiosClient.put(`/synonyms/words/${id}`, data);
    return res.data;
};

export const deleteSynonymWord = async (id) => {
    const res = await axiosClient.delete(`/synonyms/words/${id}`);
    return res.data;
};