import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Box, Flex, Text, SimpleGrid, Badge, Icon, Heading } from '@chakra-ui/react';
import { FiPlus, FiZap, FiAward, FiUsers } from 'react-icons/fi';
import { FaFire } from 'react-icons/fa';

const Home = () => {
    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-10">

                {/* --- KHU VỰC 1: BANNER, THỐNG KÊ & CHUỖI NGÀY --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Ảnh Banner (Dùng ảnh tạm mèo giống của bạn) */}
                    <Box borderRadius="2xl" overflow="hidden" h="160px">
                        <img
                            src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                            alt="Banner"
                            className="w-full h-full object-cover"
                        />
                    </Box>

                    {/* Thống kê từ vựng */}
                    <SimpleGrid columns={2} gap={4} p={4} bg="white" borderRadius="2xl" shadow="sm" borderWidth="1px">
                        {['Tổng từ', 'Đã thuộc', 'Tiến độ', 'Đang học'].map((label, idx) => (
                            <Flex key={idx} direction="column" align="center" justify="center" p={2} bg="gray.50" borderRadius="lg">
                                <Text fontSize="2xl" fontWeight="bold" color={idx === 2 ? 'blue.500' : 'gray.700'}>
                                    {idx === 2 ? '0%' : '0'}
                                </Text>
                                <Text fontSize="sm" color="gray.500">{label}</Text>
                            </Flex>
                        ))}
                    </SimpleGrid>

                    {/* Chuỗi ngày học (Streak) */}
                    <Box bg="orange.400" borderRadius="2xl" p={5} shadow="sm" color="white" position="relative" overflow="hidden">
                        <Flex align="center" mb={4}>
                            <Icon as={FaFire} boxSize={5} mr={2} color="yellow.200" />
                            <Text fontWeight="bold">CHUỖI NGÀY HỌC</Text>
                        </Flex>
                        <Flex align="baseline">
                            <Text fontSize="5xl" fontWeight="900" lineHeight="1">1</Text>
                            <Text ml={2} fontWeight="medium">ngày</Text>
                        </Flex>
                        <Flex justify="space-between" mt={4}>
                            {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day, i) => (
                                <Flex key={i} direction="column" align="center">
                                    <Box w="8px" h="8px" bg={i === 1 ? 'white' : 'whiteAlpha.400'} borderRadius="full" mb={1} />
                                    <Text fontSize="xs" color={i === 1 ? 'white' : 'whiteAlpha.700'}>{day}</Text>
                                </Flex>
                            ))}
                        </Flex>
                    </Box>
                </div>

                {/* --- KHU VỰC 2: TRUY CẬP NHANH --- */}
                <Box>
                    <Text textAlign="center" fontWeight="bold" fontSize="lg" mb={4}>Truy cập nhanh</Text>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { icon: FiPlus, title: 'Thêm từ', desc: 'Tạo từ vựng cá nhân', color: 'blue.500' },
                            { icon: FiZap, title: 'Luyện tập', desc: 'Flashcard & Games', color: 'purple.500' },
                            { icon: FiAward, title: 'Xếp hạng', desc: 'Xem thành tích', color: 'orange.500' },
                            { icon: FiUsers, title: 'Cộng đồng', desc: 'Tham gia nhóm FB', color: 'teal.500' },
                        ].map((item, idx) => (
                            <Flex key={idx} p={4} bg="white" borderRadius="2xl" borderWidth="1px" shadow="sm" align="center" _hover={{ shadow: 'md', cursor: 'pointer' }}>
                                <Flex bg="gray.50" p={3} borderRadius="full" mr={3}>
                                    <Icon as={item.icon} boxSize={5} color={item.color} />
                                </Flex>
                                <Box>
                                    <Text fontWeight="bold" fontSize="sm">{item.title}</Text>
                                    <Text fontSize="xs" color="gray.500">{item.desc}</Text>
                                </Box>
                            </Flex>
                        ))}
                    </div>
                </Box>

                {/* --- KHU VỰC 3: LỘ TRÌNH HỌC --- */}
                <Box>
                    <Text textAlign="center" fontWeight="bold" fontSize="xl" mb={6}>LỘ TRÌNH HỌC</Text>

                    {/* Tags lọc */}
                    <Flex justify="center" flexWrap="wrap" gap={2} mb={8}>
                        {['Tất cả', 'THPT', 'Sách IELTS', 'IELTS', 'TOEIC', 'Người nổi tiếng khuyên dùng'].map((tag, idx) => (
                            <Badge
                                key={idx}
                                px={4} py={2}
                                borderRadius="full"
                                bg={idx === 0 ? 'green.500' : 'white'}
                                color={idx === 0 ? 'white' : 'gray.600'}
                                borderWidth="1px"
                                textTransform="none"
                                fontWeight={idx === 0 ? 'bold' : 'normal'}
                                cursor="pointer"
                            >
                                {tag}
                            </Badge>
                        ))}
                    </Flex>

                    {/* Danh sách khóa học */}
                    <Box mb={6}>
                        <Flex align="center" mb={4}>
                            <Heading size="md" mr={2}>THPT</Heading>
                            <Text fontSize="sm" color="gray.500">5 lộ trình</Text>
                        </Flex>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {['Anh 10 Global Success', 'Anh 11 Global Success', 'Anh 12 Global Success', '1000 TỪ VỰNG TRỌNG ĐIỂM 2025'].map((course, idx) => (
                                <Box key={idx} p={4} bg="white" borderRadius="xl" borderWidth="1px" shadow="sm" h="140px" display="flex" flexDirection="column" justifyContent="space-between">
                                    <Text fontWeight="bold" noOfLines={2}>{course}</Text>
                                    <Badge w="fit-content" colorScheme="gray" borderRadius="md">📚 10 bộ từ</Badge>
                                </Box>
                            ))}
                        </div>
                    </Box>
                </Box>

            </div>
        </DashboardLayout>
    );
};

export default Home;