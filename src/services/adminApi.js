import axiosClient from "../config/axios.js";

export const getAdminDashboardData = () =>
    axiosClient.get("/admin/dashboard").then(res => res.data);
