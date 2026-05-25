import axiosClient from "../config/axios.js";

// Fetch all speaking topics (optional partType: 1, 2, or 3)
export const getTopics = (partType = null) => {
    const params = {};
    if (partType) params.partType = partType;
    return axiosClient.get("/speaking/topics", { params }).then((r) => r.data);
};

// Fetch single speaking topic by ID
export const getTopicById = (id) => {
    return axiosClient.get(`/speaking/topics/${id}`).then((r) => r.data);
};

// Fetch random speaking topic
export const getRandomTopic = (partType = null) => {
    const params = {};
    if (partType) params.partType = partType;
    return axiosClient.get("/speaking/topics/random", { params }).then((r) => r.data);
};

// Create a new speaking topic (Admin-only)
export const createTopic = (data) => {
    return axiosClient.post("/speaking/topics", data).then((r) => r.data);
};

// Update an existing speaking topic (Admin-only)
export const updateTopic = (id, data) => {
    return axiosClient.put(`/speaking/topics/${id}`, data).then((r) => r.data);
};

// Delete a speaking topic (Admin-only)
export const deleteTopic = (id) => {
    return axiosClient.delete(`/speaking/topics/${id}`).then((r) => r.data);
};

// Submit a speaking attempt (preparation draft script)
export const submitAttempt = (topicId, data) => {
    return axiosClient.post(`/speaking/topics/${topicId}/attempts`, data).then((r) => r.data);
};

// Fetch preparation attempts history for the logged-in user
export const getAttempts = () => {
    return axiosClient.get("/speaking/attempts").then((r) => r.data);
};
