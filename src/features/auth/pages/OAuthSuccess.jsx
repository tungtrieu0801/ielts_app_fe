import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosClient from "../../../config/axios";
import {useAuthStore} from "../../../stores/useAuthStore.js";

export const OAuthSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);

    useEffect(() => {
        const token = searchParams.get("token");
        if (token) {
            // Lưu tạm token vào local để axiosClient có thể dùng gửi request profile
            localStorage.setItem("token", token);

            // Lấy profile ngay lập tức để lưu vào Store
            axiosClient.get("/auth/me")
                .then(res => {
                    setAuth(res.data.user, token); // Lưu cả user và token vào Zustand
                    navigate("/home");
                })
                .catch(() => navigate("/login"));
        }
    }, [searchParams, setAuth, navigate]);

    return <div>Đang hoàn tất đăng nhập...</div>;
};