import axiosClient from "../config/axios.js";

export const getRanking = (period = "day") =>
    axiosClient.get(`/ranking?period=${period}`);
