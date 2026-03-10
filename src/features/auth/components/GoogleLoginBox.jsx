import { Box, Button, Heading, VStack, Text, Image } from "@chakra-ui/react";
import { FcGoogle } from "react-icons/fc";
import { useState, useEffect } from "react";
import axiosClient from "../../../config/axios.js";

export const GoogleLoginBox = () => {
    const [userProfile, setUserProfile] = useState(null);

    // 1. Kiểm tra xem đã có token trong localStorage chưa để lấy profile
    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    // Bạn nên có 1 route ở backend: GET /auth/me để lấy profile từ token
                    const res = await axiosClient.get("/auth/me");
                    setUserProfile(res.data.user);
                } catch (err) {
                    console.log("Fetch profile error:", err);
                    localStorage.removeItem("token");
                }
            }
        };
        fetchProfile();
    }, []);

    // 2. Hàm xử lý đăng nhập: Chuyển hướng trình duyệt
    const handleLogin = () => {
        // Thay url này bằng đúng endpoint backend của bạn
        window.location.href = "http://localhost:5000/auth/google";
    };

    const logOut = () => {
        localStorage.removeItem("token");
        setUserProfile(null);
        // Có thể gọi thêm logout ở backend nếu cần
    };

    return (
        <Box p={8} maxWidth="400px" bg="white" shadow="md" borderRadius={8} borderWidth={1}>
            <VStack spacing={6} align="stretch">
                {userProfile ? (
                    <VStack spacing={4} textAlign="center">
                        <Image
                            src={userProfile.picture}
                            alt="Avatar"
                            borderRadius="full"
                            boxSize="80px"
                        />
                        <Box>
                            <Heading size="md">{userProfile.name}</Heading>
                            <Text color="gray.500">{userProfile.email}</Text>
                        </Box>
                        <Button colorPalette="red" variant="outline" onClick={logOut} w="full">
                            Đăng xuất
                        </Button>
                    </VStack>
                ) : (
                    <>
                        <Box textAlign="center">
                            <Heading size="lg" mb={2}>Hello</Heading>
                            <Text color="gray.500">Đăng nhập để học từ vựng</Text>
                        </Box>
                        <Button w="full" variant="outline" onClick={handleLogin} size="lg">
                            <FcGoogle style={{ marginRight: "8px" }} />
                            Đăng nhập với Google
                        </Button>
                    </>
                )}
            </VStack>
        </Box>
    );
};