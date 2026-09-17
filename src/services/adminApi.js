import axiosClient from "../config/axios.js";

export const getAdminDashboardData = () =>
    axiosClient.get("/admin/dashboard").then(res => res.data);

export const getUserVideos = (userId) =>
    axiosClient.get(`/admin/users/${userId}/videos`).then(res => res.data);

export const getAdminVideos = () =>
    axiosClient.get("/admin/videos").then(res => res.data);

export const deleteAdminVideo = (videoId) =>
    axiosClient.delete(`/admin/videos/${videoId}`).then(res => res.data);

