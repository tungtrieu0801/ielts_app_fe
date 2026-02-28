import React from 'react';
import { Box, Flex } from '@chakra-ui/react';
import Sidebar from "../components/Slidebar.jsx";

const DashboardLayout = ({ children }) => {
    return (
        <Flex h="100vh" bg="gray.50" fontFamily="sans-serif">
            {/* Sidebar cố định bên trái (Rộng 250px) */}
            <Sidebar />

            {/* Nội dung chính: Đẩy sang phải 250px (ml="250px") để không bị đè */}
            <Box flex="1" ml="250px" h="100vh" overflowY="auto">
                <Box p={8}>
                    {children}
                </Box>
            </Box>
        </Flex>
    );
};

export default DashboardLayout;