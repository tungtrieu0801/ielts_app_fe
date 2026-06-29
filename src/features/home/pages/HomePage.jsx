import React, { useEffect, useState } from "react";
import { Box, Flex, Text, SimpleGrid, Spinner, Button, Badge, VStack, Input } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { FiBook, FiClock, FiAward, FiLayers, FiPlay, FiZap, FiActivity, FiSearch } from "react-icons/fi";
import BaseLayout from "../../../layouts/BaseLayout.jsx";
import { useStudyStore } from "../../../stores/useStudyStore.js";
import { useVocabularyStore } from "../../../stores/useVocabularyStore.js";
import StudyStreakHeatmap from "../components/StudyStreakHeatmap.jsx";
import SRSScheduleWidget from "../components/SRSScheduleWidget.jsx";
import StreakRanking from "../components/StreakRanking.jsx";
import CommunityChat from "../components/CommunityChat.jsx";
import { getCardsByLevel } from "../../../services/studyApi.js";

const StatCard = ({ icon: Icon, label, value, color, highlight, onClick }) => (
    <Box
        bg={highlight ? `linear-gradient(135deg, var(--chakra-colors-${color}-500) 0%, var(--chakra-colors-${color}-600) 100%)` : "bg.panel"}
        borderRadius="2xl"
        p={5}
        borderWidth={highlight ? "0" : "1px"}
        borderColor="border.muted"
        position="relative"
        overflow="hidden"
        cursor={onClick ? "pointer" : "default"}
        onClick={onClick}
        _hover={onClick ? { transform: "translateY(-2px)", shadow: "lg", filter: "brightness(1.05)" } : { transform: "translateY(-2px)", shadow: "lg" }}
        transition="all 0.2s ease"
        shadow={highlight ? "lg" : "none"}
    >
        <Box
            position="absolute" top={-4} right={-4}
            w="80px" h="80px" borderRadius="full"
            bg={highlight ? "white/10" : `${color}.100`}
            opacity={highlight ? 1 : 0.3}
            _dark={{ bg: highlight ? "white/10" : `${color}.900`, opacity: 0.2 }}
        />
        <Flex align="center" gap={3}>
            <Flex
                w="44px" h="44px" borderRadius="xl"
                bg={highlight ? "white/20" : `${color}.100`}
                _dark={{ bg: highlight ? "white/20" : `${color}.900/30` }}
                color={highlight ? "white" : `${color}.500`}
                align="center" justify="center"
                fontSize="xl" flexShrink={0}
            >
                <Icon size={20} />
            </Flex>
            <Box>
                <Text fontSize="xs" color={highlight ? "white/70" : "fg.muted"} mb={0.5}>{label}</Text>
                <Text fontSize="2xl" fontWeight="900" lineHeight="1" color={highlight ? "white" : "fg"}>
                    {value ?? "—"}
                </Text>
            </Box>
        </Flex>
    </Box>
);

const TipsWidget = () => (
    <Box
        bg="bg.panel"
        borderRadius="2xl"
        borderWidth="1px"
        borderColor="border.muted"
        overflow="hidden"
        mb={6}
    >
        <Box bg="blue.50" _dark={{ bg: "blue.900/30" }} p={4}>
            <Text fontSize="md" fontWeight="bold" color="blue.600" _dark={{ color: "blue.300" }}>
                💡 Mẹo học tập
            </Text>
        </Box>
        <Flex direction="column" gap={0}>
            <Box p={4} _hover={{ bg: "bg.subtle" }} transition="background 0.2s">
                <Text fontSize="sm" fontWeight="bold" mb={1}>Ôn tập đều đặn</Text>
                <Text fontSize="xs" color="fg.muted">Học một chút mỗi ngày tốt hơn là nhồi nhét nhiều vào một ngày.</Text>
            </Box>
            <Box h="1px" bg="border.subtle" mx={4} />
            <Box p={4} _hover={{ bg: "bg.subtle" }} transition="background 0.2s">
                <Text fontSize="sm" fontWeight="bold" mb={1}>Phát âm chuẩn</Text>
                <Text fontSize="xs" color="fg.muted">Nghe cách đọc chuẩn trước khi tự phát âm để tạo thói quen tốt.</Text>
            </Box>
            <Box h="1px" bg="border.subtle" mx={4} />
            <Box p={4} _hover={{ bg: "bg.subtle" }} transition="background 0.2s">
                <Text fontSize="sm" fontWeight="bold" mb={1}>Spaced Repetition</Text>
                <Text fontSize="xs" color="fg.muted">Hệ thống tự động tính thời điểm tốt nhất để ôn lại từ, bạn chỉ việc học theo lịch.</Text>
            </Box>
        </Flex>
    </Box>
);

// ── Modal hiển thị từ vựng theo cấp độ ───────────────────────────────────────
const WordLevelModal = ({ level, onClose }) => {
    const [words, setWords] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const limit = 8; // items per page

    const loadData = async (lvl, p, q) => {
        setLoading(true);
        try {
            const res = await getCardsByLevel(lvl, p, limit, q);
            setWords(res.data || []);
            setTotal(res.total || 0);
        } catch (err) {
            console.error("Error fetching cards by level:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData(level, page, search);
    }, [level, page]);

    const handleSearchChange = (val) => {
        setSearch(val);
        setPage(1);
        loadData(level, 1, val);
    };

    const totalPages = Math.ceil(total / limit) || 1;

    return (
        <Box
            position="fixed" inset={0} zIndex={500}
            bg="blackAlpha.600" display="flex" alignItems="center" justifyContent="center"
            onClick={onClose}
        >
            <Box
                bg="bg.panel" borderRadius="2xl" p={6} w="full" maxW="800px"
                mx={4} shadow="2xl" onClick={(e) => e.stopPropagation()}
                maxH="85vh" display="flex" flexDirection="column"
                borderWidth="1px" borderColor="border.muted"
            >
                {/* Header */}
                <Flex justify="space-between" align="center" mb={4}>
                    <Box>
                        <Text fontSize="lg" fontWeight="extrabold" display="flex" alignItems="center" gap={2}>
                            📌 Danh sách từ Cấp độ {level}
                            <Badge colorPalette={level === 5 ? "green" : level === 1 ? "red" : "orange"} size="lg" borderRadius="full">
                                {total} từ
                            </Badge>
                        </Text>
                        <Text fontSize="xs" color="fg.muted">
                            Các từ vựng đang ở chu kỳ ôn tập Cấp độ {level}
                        </Text>
                    </Box>
                    <Button variant="ghost" size="sm" onClick={onClose} fontWeight="bold" fontSize="lg">
                        ✕
                    </Button>
                </Flex>

                {/* Search Bar */}
                <Box mb={4} position="relative">
                    <Flex align="center" bg="bg.input" borderWidth="1px" borderColor="border.muted" borderRadius="xl" px={3} py={1.5}>
                        <FiSearch size={16} style={{ marginRight: "8px", opacity: 0.5 }} />
                        <Input
                            variant="unstyled"
                            placeholder="Tìm kiếm từ tiếng Anh hoặc nghĩa tiếng Việt..."
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            fontSize="sm"
                            bg="transparent"
                            border="none"
                            outline="none"
                            w="full"
                        />
                    </Flex>
                </Box>

                {/* Table Content */}
                <Box flex="1" overflowY="auto" minH="250px" mb={4} borderWidth="1px" borderColor="border.muted" borderRadius="xl">
                    {loading ? (
                        <Flex justify="center" align="center" h="250px">
                            <Spinner size="lg" colorPalette="blue" />
                        </Flex>
                    ) : words.length === 0 ? (
                        <Flex justify="center" align="center" direction="column" h="250px" gap={2} opacity={0.6}>
                            <Text fontSize="4xl">🔍</Text>
                            <Text fontWeight="semibold">Không tìm thấy từ vựng nào</Text>
                            <Text fontSize="xs" color="fg.muted">Thử nhập từ khóa tìm kiếm khác</Text>
                        </Flex>
                    ) : (
                        <Box overflowX="auto">
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr>
                                        {["Tiếng Anh", "Phiên âm", "Từ loại", "Nghĩa tiếng Việt", "Ví dụ & Dịch ví dụ"].map((h) => (
                                            <th
                                                key={h}
                                                style={{
                                                    padding: "10px 12px",
                                                    textAlign: "left",
                                                    fontSize: "12px",
                                                    fontWeight: "600",
                                                    background: "var(--chakra-colors-bg-subtle)",
                                                    borderBottom: "1px solid var(--chakra-colors-border-muted)",
                                                    position: "sticky",
                                                    top: 0,
                                                    zIndex: 10,
                                                    color: "var(--chakra-colors-fg-muted)",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {words.map((w, idx) => (
                                        <tr
                                            key={w._id || idx}
                                            style={{
                                                background: idx % 2 === 0 ? "transparent" : "var(--chakra-colors-bg-subtle)",
                                                borderBottom: "1px solid var(--chakra-colors-border-muted)",
                                            }}
                                        >
                                            <td style={{ padding: "10px 12px", fontWeight: 700, color: "var(--chakra-colors-blue-600)", fontSize: "14px" }}>
                                                {w.english}
                                            </td>
                                            <td style={{ padding: "10px 12px", color: "var(--chakra-colors-fg-muted)", fontSize: "13px" }}>
                                                {w.pronunciation || "—"}
                                            </td>
                                            <td style={{ padding: "10px 12px" }}>
                                                {w.partOfSpeech ? (
                                                    <Badge colorPalette="blue" size="sm" variant="subtle">
                                                        {w.partOfSpeech}
                                                    </Badge>
                                                ) : "—"}
                                            </td>
                                            <td style={{ padding: "10px 12px", fontWeight: 600, fontSize: "13px" }}>
                                                {w.vietnamese}
                                            </td>
                                            <td style={{ padding: "10px 12px", fontSize: "13px", maxW: "250px", whiteSpace: "normal" }}>
                                                {w.example ? (
                                                    <Box>
                                                        <Text fontSize="xs" fontWeight="medium">{w.example}</Text>
                                                        {w.exampleTranslation && (
                                                            <Text fontSize="10px" color="fg.muted" fontStyle="italic">
                                                                {w.exampleTranslation}
                                                            </Text>
                                                        )}
                                                    </Box>
                                                ) : "—"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </Box>
                    )}
                </Box>

                {/* Footer / Pagination */}
                {totalPages > 1 && (
                    <Flex justify="space-between" align="center" pt={4} borderTopWidth="1px" borderColor="border.subtle">
                        <Text fontSize="xs" color="fg.muted">
                            Trang {page} / {totalPages} (Hiển thị {words.length} / {total} từ)
                        </Text>
                        <Flex gap={2}>
                            <Button
                                size="xs"
                                variant="outline"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                Trước
                            </Button>
                            <Button
                                size="xs"
                                variant="outline"
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                            >
                                Sau
                            </Button>
                        </Flex>
                    </Flex>
                )}
            </Box>
        </Box>
    );
};

const HomePage = () => {
    const { stats, fetchStats, fetchStreakInfo } = useStudyStore();
    const { wordSets, fetchWordSets, loading } = useVocabularyStore();
    const navigate = useNavigate();
    const [selectedLevel, setSelectedLevel] = useState(null);

    useEffect(() => {
        fetchStats();
        fetchWordSets();
        fetchStreakInfo();
    }, []);

    return (
        <BaseLayout>
            <Box maxW="1400px" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 4, md: 8 }}>
                {/* Welcome */}
                <Box mb={6}>
                    <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="extrabold" mb={1}>
                        Chào mừng trở lại! 👋
                    </Text>
                    <Text color="fg.muted">Tiếp tục hành trình học từ vựng của bạn hôm nay.</Text>
                </Box>

                <Flex direction={{ base: "column", lg: "row" }} gap={6} alignItems="flex-start">
                    {/* Left Column (Main Content) */}
                    <Box flex="1" w="full" minW="0" display="flex" flexDirection="column" gap={6}>


                        {/* Stats Grid */}
                        <VStack gap={4} align="stretch">
                            <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
                                <StatCard
                                    icon={FiZap}
                                    label="Có thể học ngay"
                                    value={stats?.dueCards ?? "—"}
                                    color="blue"
                                    highlight={stats?.dueCards > 0}
                                    onClick={() => navigate("/study/global")}
                                />
                                <StatCard icon={FiLayers} label="Tổng từ vựng" value={stats?.totalWords} color="purple" />
                                <StatCard icon={FiBook} label="Đã học hôm nay" value={stats?.reviewedToday} color="green" />
                                <StatCard icon={FiAward} label="Từ đã thuộc (Lv5)" value={stats?.masteredCards} color="orange" onClick={() => setSelectedLevel(5)} />
                            </SimpleGrid>

                            <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
                                <StatCard icon={FiActivity} label="Cấp độ 1" value={stats?.level1Count ?? 0} color="red" onClick={() => setSelectedLevel(1)} />
                                <StatCard icon={FiActivity} label="Cấp độ 2" value={stats?.level2Count ?? 0} color="orange" onClick={() => setSelectedLevel(2)} />
                                <StatCard icon={FiActivity} label="Cấp độ 3" value={stats?.level3Count ?? 0} color="cyan" onClick={() => setSelectedLevel(3)} />
                                <StatCard icon={FiActivity} label="Cấp độ 4" value={stats?.level4Count ?? 0} color="teal" onClick={() => setSelectedLevel(4)} />
                            </SimpleGrid>
                        </VStack>

                        {/* Study Streak Heatmap — full width */}
                        <StudyStreakHeatmap />

                        {/* SRS Schedule Widget */}
                        <SRSScheduleWidget />

                        {/* Recent Sets */}
                        {/* <Box>
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
                                <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                                    {wordSets.slice(0, 4).map((ws) => (
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
                                                <Text fontWeight="bold" isTruncated flex={1}>{ws.title}</Text>
                                            </Flex>
                                            <Text color="fg.muted" fontSize="sm" mb={4} noOfLines={2}>
                                                {ws.description || "Không có mô tả"}
                                            </Text>
                                            <Flex justify="space-between" align="center">
                                                <Text fontSize="xs" color="fg.subtle">{ws.wordCount} từ</Text>
                                                <Button
                                                    size="xs"
                                                    bg="linear-gradient(135deg, #3b82f6, #6366f1)"
                                                    color="white"
                                                    borderRadius="lg"
                                                    gap={1}
                                                    fontWeight="bold"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/study/${ws._id}`);
                                                    }}
                                                    _hover={{ opacity: 0.9 }}
                                                >
                                                    <FiPlay size={10} /> Học ngay
                                                </Button>
                                            </Flex>
                                        </Box>
                                    ))}
                                </SimpleGrid>
                            )}
                        </Box> */}
                    </Box>

                    {/* Right Column (Side Widgets) */}
                    <Box w={{ base: "full", lg: "320px", xl: "360px" }} flexShrink={0}>
                        <VStack gap={6} align="stretch" position={{ lg: "sticky" }} top="20px">
                            <StreakRanking />
                            <CommunityChat />
                            <TipsWidget />

                            <Box
                                bg="linear-gradient(135deg, var(--chakra-colors-purple-500) 0%, var(--chakra-colors-blue-600) 100%)"
                                borderRadius="2xl"
                                p={5}
                                color="white"
                                position="relative"
                                overflow="hidden"
                            >
                                <Box
                                    position="absolute" top="-20px" right="-20px"
                                    w="100px" h="100px" bg="white/10" borderRadius="full" blur="md"
                                />
                                <Text fontSize="2xl" mb={2}>🚀</Text>
                                <Text fontWeight="900" fontSize="lg" mb={1}>IELTS Vocab Pro</Text>
                                <Text fontSize="sm" color="white/80" mb={4}>
                                    Mở khóa phát âm AI, học không giới hạn và xoá quảng cáo.
                                </Text>
                                <Button size="sm" bg="white" color="purple.600" w="full" fontWeight="bold" _hover={{ bg: "gray.50" }} onClick={() => navigate("/premium")}>
                                    Nâng cấp ngay
                                </Button>
                            </Box>
                        </VStack>
                    </Box>
                </Flex>
            </Box>
            {selectedLevel !== null && (
                <WordLevelModal
                    level={selectedLevel}
                    onClose={() => setSelectedLevel(null)}
                />
            )}
        </BaseLayout>
    );
};

export default HomePage;