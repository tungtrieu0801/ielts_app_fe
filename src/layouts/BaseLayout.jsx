import React from 'react';
import {Box, Flex, Text, IconButton, Button} from '@chakra-ui/react';
import {FiBell, FiMenu, FiSearch} from 'react-icons/fi';
import { ColorModeButton } from "../components/ui/color-mode.jsx";

import {
    DrawerBackdrop,
    DrawerBody,
    DrawerCloseTrigger,
    DrawerContent,
    DrawerRoot,
    DrawerTrigger,
} from "../components/ui/drawer.jsx";
import Sidebar from "../shared/components/Slidebar.jsx";
import {FaFire} from "react-icons/fa";

const BaseLayout = ({ children }) => {
    return (
        <Flex h="100vh" bg="bg.main" transition="background 0.3s ease">

            {/*Sidebar cho Desktop (Mặc định hiện, ẩn trên màn hình nhỏ)*/}
            <Box display={{ base: "none", md: "block" }}>
                <Sidebar />
            </Box>

            <Flex flex="1" direction="column" h="100vh" overflow="hidden">

                {/*  Top Bar cho Mobile (Chỉ hiện trên màn hình nhỏ) */}
                <Flex
                    display={{ base: "flex", md: "none" }}
                    w="100%"
                    p={4}
                    align="center"
                    justify="space-between"
                    bg="bg.panel"
                    borderBottomWidth="1px"
                    borderColor="border.muted"
                >
                    <Flex align="center" gap={3}>
                        {/* Drawer bắt đầu từ đây */}
                        <DrawerRoot placement="start">
                            <DrawerBackdrop /> {/*l Lớp màn phủ khi sidebar mở ra làm mờ phía sau */}
                            <DrawerTrigger asChild>
                                {/* Nút bấm trồi ra Sidebar */}
                                <IconButton variant="ghost" size="sm" aria-label="Open Menu">
                                    <FiMenu size={20} />
                                </IconButton>
                            </DrawerTrigger>

                            <DrawerContent bg="bg.panel">
                                <DrawerCloseTrigger />
                                <DrawerBody p={0}>
                                    {/* Nhúng thẳng Sidebar vào bên trong Drawer */}
                                    <Sidebar />
                                </DrawerBody>
                            </DrawerContent>
                        </DrawerRoot>

                        <Text fontSize="xl" fontWeight="bold" color="purple.500">
                            Ahihi
                        </Text>
                    </Flex>

                    {/* Nút đổi màu trên Mobile */}
                    <ColorModeButton />
                </Flex>

                <Flex
                    display={{ base: "none", md: "flex" }} // Chỉ hiện trên màn lớn
                    w="100%"
                    px={8}
                    py={4}
                    align="center"
                    justify="flex-end" // Đẩy tất cả sang bên phải
                    bg="bg.main"
                    borderBottomWidth="1px"
                    borderColor="border.muted"
                    gap={6} // Khoảng cách giữa các cụm icon
                >
                    {/* Nút Tìm kiếm */}
                    <IconButton variant="ghost" rounded="full" aria-label="Search" color="fg.muted" _hover={{ color: "fg" }}>
                        <FiSearch size={22} />
                    </IconButton>

                    {/* Nút Thông báo có chấm đỏ */}
                    <Box position="relative">
                        <IconButton variant="ghost" rounded="lg" aria-label="Notifications" color="fg.muted" bg="bg.panel" _hover={{ bg: "gray.100", _dark: { bg: "whiteAlpha.200" } }}>
                            <FiBell size={22} />
                        </IconButton>
                        {/* Chấm đỏ Notification Badge */}
                        <Box
                            position="absolute"
                            top="1"
                            right="1.5"
                            w="2.5"
                            h="2.5"
                            bg="red.500"
                            borderRadius="full"
                            border="2px solid"
                            borderColor="bg.main" // Tạo viền cắt với nền để nhìn rõ hơn
                        />
                    </Box>

                    {/* Bộ đếm Streak (Ngọn lửa) */}
                    <Flex align="center" gap={2}>
                        <Box as={FaFire} color="orange.400" fontSize="xl" />
                        <Text fontWeight="bold" fontSize="lg" color="fg">
                            0
                        </Text>
                    </Flex>

                    {/* Nút Premium */}
                    <Button
                        variant="subtle"
                        bg="orange.500" // Màu nền (bạn có thể đổi thành trong suốt kèm viền nếu thích)
                        color="white"
                        _dark={{
                            bg: "orange.900", // Ở dark mode màu nền tối lại
                            color: "orange.300", // Chữ sáng lên
                        }}
                        borderRadius="xl" // Bo góc giống ảnh
                        fontWeight="bold"
                        px={6}
                        _hover={{ transform: "scale(1.05)" }} // Thêm tí hiệu ứng khi di chuột
                        transition="all 0.2s"
                    >
                        Premium
                    </Button>
                </Flex>

                {/* 4. Nội dung của từng trang (HomePage, VocabularyPage...) */}
                <Box flex="1" overflowY="auto" p={{ base: 4, md: 8 }}>
                    {children}
                </Box>
            </Flex>

        </Flex>
    );
};

export default BaseLayout;