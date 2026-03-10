import React from 'react';
import { Box, Flex, Text, VStack, Image, Button } from '@chakra-ui/react';
import { FiHome, FiList, FiLogOut } from 'react-icons/fi';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ColorModeButton } from "../../components/ui/color-mode.jsx";
import {useAuthStore} from "../../stores/useAuthStore.js";

const menuItems = [
    { name: 'Trang chủ', icon: FiHome, path: '/home' },
    { name: 'Từ vựng', icon: FiList, path: '/vocabulary' },
];

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Lấy user và hàm logout từ Zustand store
    const { user, logout } = useAuthStore();

    const handleLogout = () => {
        logout(); // Xóa user/token trong store & localStorage
        navigate("/login");
    };

    return (
        <Box
            w={{ base: "full", md: "250px" }}
            h="100vh"
            bg="bg.panel"
            borderRightWidth="1px"
            borderColor="border.muted"
            display="flex"         // Kích hoạt Flexbox
            flexDirection="column" // Sắp xếp theo cột
            justifyContent="space-between" // Đẩy menu lên trên, profile xuống dưới
            transition="background 0.3s ease"
        >
            {/* Top Section: Logo & Menu */}
            <Box p={4}>
                <Flex align="center" justify="space-between" mb={8} px={4}>
                    <Text fontSize="2xl" fontWeight="bold" color="purple.500">
                        Ahihi
                    </Text>
                    <ColorModeButton />
                </Flex>

                <VStack align="stretch" gap={2}>
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;

                        return (
                            <Flex
                                key={item.name}
                                as={Link}
                                to={item.path}
                                align="center"
                                p={3}
                                mx={2}
                                borderRadius="lg"
                                bg={isActive ? "blue.50" : "transparent"}
                                _dark={{ bg: isActive ? "blue.900/30" : "transparent" }}
                                color={isActive ? "blue.600" : "fg.muted"}
                                _hover={{
                                    bg: "gray.100",
                                    _dark: { bg: "whiteAlpha.100" },
                                    transform: "translateX(5px)"
                                }}
                                transition="all 0.2s ease"
                            >
                                <Box as={item.icon} mr={3} fontSize="lg" />
                                <Text fontWeight={isActive ? "bold" : "medium"}>
                                    {item.name}
                                </Text>
                            </Flex>
                        );
                    })}
                </VStack>
            </Box>

            {/* Bottom Section: User Profile */}
            <Box p={4}>
                <Box borderTopWidth="1px" borderColor="border.muted" my={4} />

                <Flex align="center" p={2} mb={2}>
                    {/* Avatar: Ưu tiên ảnh từ Google, nếu không có thì lấy chữ đầu tên */}
                    {user?.picture ? (
                        <Image
                            src={user.picture}
                            alt="Avatar"
                            borderRadius="full"
                            boxSize="32px"
                            mr={3}
                        />
                    ) : (
                        <Box
                            w="8" h="8"
                            borderRadius="full"
                            bg="purple.500"
                            color="white"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            fontWeight="bold"
                            mr={3}
                            fontSize="sm"
                        >
                            {user?.name ? user.name.charAt(0).toUpperCase() : "G"}
                        </Box>
                    )}

                    <Box overflow="hidden">
                        <Text fontSize="sm" fontWeight="bold" color="fg" isTruncated>
                            {user?.name || "Khách"}
                        </Text>
                        <Text fontSize="xs" color="fg.muted" isTruncated>
                            {user?.email || "Chưa đăng nhập"}
                        </Text>
                    </Box>
                </Flex>

                {/* Nút Đăng xuất tiện ích */}
                {user && (
                    <Button
                        onClick={handleLogout}
                        variant="ghost"
                        colorPalette="red"
                        size="sm"
                        w="full"
                        justifyContent="flex-start"
                        leftIcon={<FiLogOut />}
                    >
                        Đăng xuất
                    </Button>
                )}
            </Box>
        </Box>
    );
};

export default Sidebar;