import {googleLogout, useGoogleLogin} from "@react-oauth/google";
import {Box, Button, Heading, VStack, Text, Image} from "@chakra-ui/react";
import {FcGoogle} from "react-icons/fc";
import {useState} from "react";
import {VITE_GOOGLE_USER_DETAIL} from "../../../config/env.js";

export const GoogleLoginBox = () => {

    // State lưu thông tin user
    const [userProfile, setUserProfile] = useState(null);

    const login = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            console.log('Access Token: ', tokenResponse.access_token);
            try {
                const res = await fetch(VITE_GOOGLE_USER_DETAIL, {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}`}
                    });
                const data = await res.json();
                setUserProfile(data);
                console.log("User data: ", data);
            } catch (error) {
                console.log(error);
            }
        },
        onError: (err) => console.log('Lỗi: ', err),
    })

    const logOut = async () => {
        googleLogout();
        setUserProfile(null);
    }

    return (
        <Box p={8} maxWidth="400px" bg="white" shadow="md" borderRadius={8} borderWidth={1}>
            <VStack spacing={6} align="stretch">
                {/* HIỂN THỊ THEO ĐIỀU KIỆN */}
                {userProfile ? (
                    // Nếu ĐÃ có userProfile -> Hiện thông tin
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
                    // Nếu CHƯA có userProfile -> Hiện form Login
                    <>
                        <Box textAlign="center">
                            <Heading size="lg" mb={2}>Hello</Heading>
                            <Text color="gray.500">Đăng nhập để học từ vựng</Text>
                        </Box>
                        <Button w="full" variant="outline" onClick={() => login()} size="lg">
                            <FcGoogle style={{ marginRight: '8px' }} /> Đăng nhập với Google
                        </Button>
                    </>
                )}
            </VStack>
        </Box>
    )
}