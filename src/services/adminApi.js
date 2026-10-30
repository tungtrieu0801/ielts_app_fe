import axiosClient from "../config/axios.js";

export const getAdminDashboardData = () =>
    axiosClient.get("/admin/dashboard").then(res => res.data);

export const getUserVideos = (userId) =>
    axiosClient.get(`/admin/users/${userId}/videos`).then(res => res.data);

export const getAdminVideos = () =>
    axiosClient.get("/admin/videos").then(res => res.data);

export const deleteAdminVideo = (videoId) =>
    axiosClient.delete(`/admin/videos/${videoId}`).then(res => res.data);

/**
 * Export toàn bộ database ra file JSON và tải về.
 * Sử dụng blob download để trigger trình duyệt tải file.
 */
export const exportDatabaseBackup = async () => {
    const response = await axiosClient.get("/admin/backup/export", {
        responseType: "blob",
    });

    // Extract filename from Content-Disposition header
    const disposition = response.headers["content-disposition"];
    let filename = "ielts_backup.json";
    if (disposition) {
        const match = disposition.match(/filename="?([^"]+)"?/);
        if (match) filename = match[1];
    }

    // Trigger browser download
    const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

    return filename;
};

/**
 * Import dữ liệu từ file JSON backup vào MongoDB (upsert).
 * @param {object} backupData - Parsed JSON object từ file backup
 */
export const importDatabaseBackup = (backupData) =>
    axiosClient.post("/admin/backup/import", backupData, {
        headers: { "Content-Type": "application/json" },
        timeout: 120000, // 2 minutes for large imports
    }).then(res => res.data);
