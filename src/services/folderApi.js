import axiosClient from "../config/axios.js";

export const getFolders = () =>
    axiosClient.get("/folders").then(r => r.data.data);

export const createFolder = (payload) =>
    axiosClient.post("/folders", payload).then(r => r.data.data);

export const updateFolder = (id, payload) =>
    axiosClient.put(`/folders/${id}`, payload).then(r => r.data.data);

export const deleteFolder = (id) =>
    axiosClient.delete(`/folders/${id}`).then(r => r.data);
