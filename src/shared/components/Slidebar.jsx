import React from 'react';
import { Box, Flex, Text, VStack } from '@chakra-ui/react';
import { FiHome, FiList } from 'react-icons/fi';
import { Link, useLocation } from 'react-router-dom';
import {ColorModeButton} from "../../components/ui/color-mode.jsx";

const menuItems = [
    { name: 'Trang chủ', icon: FiHome, path: '/home' },
    { name: 'Từ vựng', icon: FiList, path: '/vocabulary' },
];

const Sidebar = () => {

    const location = useLocation(); //Xác định chính xác component đang ở url nào.

    return (
        <Box
            w={{ base: "full", md: "250px" }} // ở màn base (mobile) thì hiển thị full, md màn lớn thì 250px
            h="100vh"
            bg="bg.panel"  // Sử dụng màu nền thích ứng: Trắng ở Light, Xám đen ở Dark
            borderRightWidth="1px"
            borderColor="border.muted"
            flexDirection="column"
            justifyContent="space-between"
            transition="background 0.3s ease" // Chuyển màu từ từ
        >
            <Box p={4}>
                <Flex align="center" justify="space-between" mb={8} px={4}>
                    <Text fontSize="2xl" fontWeight="bold" color="purple.500">
                        Ahihi
                    </Text>
                    <ColorModeButton />
                </Flex>

                {/* Menu */}
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
                                // Logic màu sắc thích ứng
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

            {/* User Profile */}
            <Box p={4}>
                <Box borderTopWidth="1px" borderColor="border.muted" my={4} />

                <Flex align="center" p={2}>
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
                        T
                    </Box>
                    <Box>
                        <Text fontSize="sm" fontWeight="bold" color="fg">
                            Tùng Triệu
                        </Text>
                        <Text fontSize="xs" color="fg.muted">
                            Nhân tài cõi sỏi
                        </Text>
                    </Box>
                </Flex>
            </Box>
        </Box>
    );
};

export default Sidebar;