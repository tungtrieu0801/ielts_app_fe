import React from 'react';
import { Box, Flex, Text, IconButton } from '@chakra-ui/react';
import { FiMenu } from 'react-icons/fi';
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

                {/* 4. Nội dung của từng trang (HomePage, VocabularyPage...) */}
                <Box flex="1" overflowY="auto" p={{ base: 4, md: 8 }}>
                    {children}
                </Box>
            </Flex>

        </Flex>
    );
};

export default BaseLayout;