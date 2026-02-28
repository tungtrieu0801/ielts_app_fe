import React from 'react';
import { Box, Flex, Text, VStack } from '@chakra-ui/react'; // Đã xóa Avatar và Divider
import { FiHome, FiBook, FiList, FiPlay, FiShoppingBag, FiAward } from 'react-icons/fi';

const menuItems = [
    { name: 'Trang chủ', icon: FiHome, active: true },
    { name: 'Bộ từ vựng', icon: FiBook },
    { name: 'Từ vựng', icon: FiList },
    { name: 'Game phản xạ', icon: FiPlay },
    { name: 'Cửa hàng', icon: FiShoppingBag },
    { name: 'Xếp hạng', icon: FiAward },
];

const Sidebar = () => {
    return (
        <Box w="250px" h="100vh" bg="white" borderRightWidth="1px" className="flex flex-col justify-between fixed">
            <Box p={4}>
                {/* Logo */}
                <Text fontSize="2xl" fontWeight="bold" color="purple.600" mb={8} px={4}>
                    ha-ngu-vcl.com
                </Text>

                {/* Menu */}
                <VStack align="stretch" spacing={2}>
                    {menuItems.map((item) => (
                        <Flex
                            key={item.name}
                            align="center"
                            p={3}
                            mx={2}
                            borderRadius="lg"
                            bg={item.active ? 'blue.50' : 'transparent'}
                            color={item.active ? 'blue.600' : 'gray.600'}
                            _hover={{ bg: 'gray.100', cursor: 'pointer' }}
                            transition="all 0.2s"
                        >
                            <Box as={item.icon} mr={3} fontSize="lg" />
                            <Text fontWeight={item.active ? 'bold' : 'medium'}>{item.name}</Text>
                        </Flex>
                    ))}
                </VStack>
            </Box>

            {/* User Profile */}
            <Box p={4}>
                {/* Dùng thẻ hr của HTML và Tailwind thay cho Divider */}
                <hr className="my-4 border-gray-200" />

                <Flex align="center" p={2}>
                    {/* Dùng thẻ div thuần vẽ hình tròn thay cho Avatar */}
                    <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold mr-3 text-sm">
                        T
                    </div>
                    <Box>
                        <Text fontSize="sm" fontWeight="bold">Tùng Triệu</Text>
                        <Text fontSize="xs" color="gray.500">Nhân tài cõi sỏi</Text>
                    </Box>
                </Flex>
            </Box>
        </Box>
    );
};

export default Sidebar;