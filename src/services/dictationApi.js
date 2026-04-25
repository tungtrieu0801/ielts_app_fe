import axiosClient from "../config/axios.js";

export const prepareText = (text) =>
    axiosClient.post("/dictation/prepare-text", { text });

export const prepareYoutube = (url) =>
    axiosClient.post("/dictation/prepare-youtube", { url });

export const getSharedLibrary = () =>
    axiosClient.get("/dictation/shared-library");
