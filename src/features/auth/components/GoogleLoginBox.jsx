import { Box, Button, Heading, VStack, Text, Flex } from "@chakra-ui/react";
import { FcGoogle } from "react-icons/fc";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../stores/useAuthStore.js";
import { ColorModeButton } from "../../../components/ui/color-mode.jsx";

export const GoogleLoginBox = () => {
    const navigate = useNavigate();
    const token = useAuthStore((s) => s.token);

    useEffect(() => {
        if (token) navigate("/home");
    }, [token]);

    const handleLogin = () => {
        const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
        window.location.href = `${baseUrl}/auth/google`;
    };

    return (
        <Box
            className="login-card"
            p={10}
            w="full"
            maxW="420px"
            // Dùng Chakra semantic tokens — tự động đổi theo dark/light class trên <html>
            bg="bg.panel"
            shadow="2xl"
            borderRadius="3xl"
            borderWidth="1px"
            borderColor="border.muted"
            position="relative"
        >
            {/* Dark mode toggle */}
            <Box position="absolute" top={4} right={4}>
                <ColorModeButton />
            </Box>

            <VStack gap={7} align="stretch">
                {/* Logo + Brand */}
                <VStack gap={2} textAlign="center" pt={2}>
                    <Box
                        w="56px" h="56px" borderRadius="2xl"
                        bg="brand.muted"
                        display="flex" alignItems="center" justifyContent="center"
                        fontSize="2xl"
                        borderWidth="1px"
                        borderColor="border.muted"
                        mb={1}
                    >
                        🎯
                    </Box>
                    <Heading size="xl" fontWeight="extrabold" color="brand.text">
                        IELTS Vocab
                    </Heading>
                    <Text color="fg.muted" fontSize="sm">
                        Hệ thống học từ vựng thông minh với SRS
                    </Text>
                </VStack>

                {/* Feature bullets */}
                <VStack gap={2} align="stretch">
                    {[
                        { icon: '🧠', text: 'Thuật toán SRS tối ưu lịch ôn tập' },
                        { icon: '🃏', text: 'Flashcard lật 3D mượt mà' },
                        { icon: '📊', text: 'Theo dõi tiến độ học tập' },
                        { icon: '📁', text: 'Import từ vựng từ file Excel' },
                    ].map(({ icon, text }) => (
                        <Flex
                            key={text}
                            align="center"
                            gap={3}
                            px={3}
                            py={2}
                            borderRadius="lg"
                            bg="bg.subtle"
                        >
                            <Box fontSize="md" flexShrink={0}>{icon}</Box>
                            <Text fontSize="sm" color="fg.muted">{text}</Text>
                        </Flex>
                    ))}
                </VStack>

                {/* Login button */}
                <Button
                    w="full"
                    onClick={handleLogin}
                    h="52px"
                    borderRadius="xl"
                    borderWidth="1.5px"
                    borderColor="border.strong"
                    bg="bg.elevated"
                    color="fg"
                    fontSize="md"
                    fontWeight="600"
                    gap={3}
                    _hover={{
                        bg: "bg.subtle",
                        borderColor: "brand.solid",
                        transform: "translateY(-1px)",
                        shadow: "md",
                    }}
                    transition="all 0.2s ease"
                >
                    <FcGoogle size={22} />
                    Đăng nhập với Google
                </Button>

                {/* Dev bypass — chỉ hiện trong môi trường development */}
                {import.meta.env.DEV && (
                    <Button
                        w="full"
                        onClick={() => { 
                            const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
                            window.location.href = `${baseUrl}/auth/dev-login`; 
                        }}
                        h="44px"
                        borderRadius="xl"
                        borderWidth="1.5px"
                        borderStyle="dashed"
                        borderColor="orange.300"
                        bg="transparent"
                        color="orange.500"
                        fontSize="sm"
                        fontWeight="600"
                        gap={2}
                        _hover={{ bg: "warning.bg", transform: "translateY(-1px)" }}
                        transition="all 0.2s ease"
                    >
                        ⚡ Dev Login (Bypass Google)
                    </Button>
                )}

                <Text textAlign="center" fontSize="xs" color="fg.subtle">
                    Bằng cách đăng nhập, bạn đồng ý với{' '}
                    <Box as="span" color="brand.text" cursor="pointer" _hover={{ textDecoration: 'underline' }}>
                        Điều khoản sử dụng
                    </Box>
                </Text>
            </VStack>
        </Box>
    );
};