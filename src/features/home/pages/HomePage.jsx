import React, { useEffect } from "react";
import { Box, Flex, Text, SimpleGrid, Spinner, Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { FiBook, FiClock, FiAward, FiLayers } from "react-icons/fi";
import BaseLayout from "../../../layouts/BaseLayout.jsx";
import { useStudyStore } from "../../../stores/useStudyStore.js";
import { useVocabularyStore } from "../../../stores/useVocabularyStore.js";

const StatCard = ({ icon: Icon, label, value, color, bg }) => (
    <Box
        bg={bg || "bg.panel"}
        borderRadius="2xl"
        p={6}
        borderWidth="1px"
        borderColor="border.muted"
        position="relative"
        overflow="hidden"
        _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
        transition="all 0.2s ease"
    >
        <Box
            position="absolute" top={-4} right={-4}
            w="80px" h="80px" borderRadius="full"
            bg={`${color}.100`}
            opacity={0.3}
            _dark={{ bg: `${color}.900`, opacity: 0.2 }}
        />
        <Flex align="center" gap={4}>
            <Flex
                w="48px" h="48px" borderRadius="xl"
                bg={`${color}.100`} _dark={{ bg: `${color}.900/30` }}
                color={`${color}.500`}
                align="center" justify="center"
                fontSize="xl" flexShrink={0}
            >
                <Icon size={22} />
            </Flex>
            <Box>
                <Text fontSize="sm" color="fg.muted" mb={1}>{label}</Text>
                <Text fontSize="3xl" fontWeight="bold" lineHeight="1">{value ?? "—"}</Text>
            </Box>
        </Flex>
    </Box>
);

const HomePage = () => {
    const { stats, fetchStats } = useStudyStore();
    const { wordSets, fetchWordSets, loading } = useVocabularyStore();
    const navigate = useNavigate();

    useEffect(() => {
        fetchStats();
        fetchWordSets();
    }, []);

    return (
        <BaseLayout>
            <Box maxW="1200px" mx="auto">
                {/* Welcome */}
                <Box mb={8}>
                    <Text fontSize="3xl" fontWeight="extrabold" mb={1}>
                        Chào mừng trở lại! 👋
                    </Text>
                    <Text color="fg.muted">Tiếp tục hành trình học từ vựng của bạn hôm nay.</Text>
                </Box>

                {/* Stats Grid */}
                <SimpleGrid columns={{ base: 2, md: 4 }} gap={4} mb={10}>
                    <StatCard icon={FiLayers} label="Tổng từ vựng" value={stats?.totalWords} color="blue" />
                    <StatCard icon={FiClock} label="Cần ôn hôm nay" value={stats?.dueToday} color="orange" />
                    <StatCard icon={FiBook} label="Đã học hôm nay" value={stats?.reviewedToday} color="green" />
                    <StatCard icon={FiAward} label="Từ đã thuộc" value={stats?.masteredWords} color="purple" />
                </SimpleGrid>

                {/* Recent Sets */}
                <Box>
                    <Flex justify="space-between" align="center" mb={4}>
                        <Text fontSize="xl" fontWeight="bold">Bộ từ gần đây</Text>
                        <Button variant="ghost" size="sm" colorPalette="blue" onClick={() => navigate("/sets")}>
                            Xem tất cả →
                        </Button>
                    </Flex>

                    {loading ? (
                        <Flex justify="center" py={10}><Spinner /></Flex>
                    ) : wordSets.length === 0 ? (
                        <Flex
                            direction="column" align="center" justify="center"
                            py={12} borderRadius="2xl" borderWidth="2px"
                            borderStyle="dashed" borderColor="border.muted"
                            gap={3}
                        >
                            <Text fontSize="4xl">📚</Text>
                            <Text fontWeight="semibold" fontSize="lg">Bạn chưa có bộ từ nào</Text>
                            <Text color="fg.muted" fontSize="sm">Tạo bộ từ đầu tiên để bắt đầu học!</Text>
                            <Button colorPalette="blue" mt={2} onClick={() => navigate("/sets")}>
                                Tạo bộ từ
                            </Button>
                        </Flex>
                    ) : (
                        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
                            {wordSets.slice(0, 6).map((ws) => (
                                <Box
                                    key={ws._id}
                                    bg="bg.panel"
                                    borderRadius="xl"
                                    p={5}
                                    borderWidth="1px"
                                    borderColor="border.muted"
                                    cursor="pointer"
                                    onClick={() => navigate(`/sets/${ws._id}`)}
                                    _hover={{ transform: "translateY(-2px)", shadow: "md", borderColor: "blue.300" }}
                                    transition="all 0.2s ease"
                                >
                                    <Flex align="center" gap={3} mb={3}>
                                        <Box
                                            w="36px" h="36px" borderRadius="lg"
                                            bg={`${ws.color || "blue"}.100`}
                                            _dark={{ bg: `${ws.color || "blue"}.900/30` }}
                                            display="flex" alignItems="center" justifyContent="center"
                                            fontSize="lg"
                                        >
                                            📖
                                        </Box>
                                        <Text fontWeight="bold" isTruncated>{ws.title}</Text>
                                    </Flex>
                                    <Text color="fg.muted" fontSize="sm" mb={3} noOfLines={2}>
                                        {ws.description || "Không có mô tả"}
                                    </Text>
                                    <Flex justify="space-between" align="center">
                                        <Text fontSize="xs" color="fg.subtle">{ws.wordCount} từ</Text>
                                        <Button
                                            size="xs" colorPalette="blue" variant="ghost"
                                            onClick={(e) => { e.stopPropagation(); navigate(`/study/${ws._id}`); }}
                                        >
                                            Học ngay →
                                        </Button>
                                    </Flex>
                                </Box>
                            ))}
                        </SimpleGrid>
                    )}
                </Box>
            </Box>
        </BaseLayout>
    );
};

export default HomePage;