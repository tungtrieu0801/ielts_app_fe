import axios from "axios";

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor — gắn token vào mỗi request
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor — xử lý 401 (token hết hạn)
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            // Xóa auth-storage trong zustand persist
            localStorage.removeItem("auth-storage");
            window.location.href = "/";
        }
        return Promise.reject(error);
    }
);

export default axiosClient;