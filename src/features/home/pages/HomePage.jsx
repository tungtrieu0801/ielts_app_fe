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
import { getCEFRTemplates, getWordSets, forkWordSet } from "../../../services/vocabularyApi.js";


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

const CEFRSuggestCard = ({ set, onForkAndStudy, onForkAndManage, isForking }) => {
    let palette = "blue";
    if (set.title.includes("A1")) palette = "green";
    else if (set.title.includes("A2")) palette = "teal";
    else if (set.title.includes("B1")) palette = "blue";
    else if (set.title.includes("B2")) palette = "orange";
    else if (set.title.includes("C1")) palette = "red";

    return (
        <Box
            bg="bg.panel"
            borderRadius="2xl"
            p={5}
            borderWidth="2px"
            borderColor={`${palette}.200`}
            _dark={{ borderColor: `${palette}.800/60` }}
            shadow="md"
            position="relative"
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
            height="100%"
            transition="all 0.2s ease"
            _hover={{ transform: "translateY(-4px)", shadow: "xl", borderColor: `${palette}.400` }}
        >
            <Box>
                <Flex align="center" gap={3} mb={3}>
                    <Box
                        w="44px"
                        h="44px"
                        borderRadius="xl"
                        bg={`${palette}.50`}
                        _dark={{ bg: `${palette}.950/30`, borderColor: `${palette}.900/30` }}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        fontSize="2xl"
                        borderWidth="1px"
                        borderColor={`${palette}.100`}
                    >
                        📖
                    </Box>
                    <Box>
                        <Flex align="center" gap={1.5}>
                            <Text fontWeight="900" fontSize="lg" color="fg">
                                {set.title}
                            </Text>
                            <Text fontSize="xs" opacity={0.6} title="Bộ từ hệ thống">🔒</Text>
                        </Flex>
                        <Badge colorPalette={palette} variant="subtle" size="sm" mt={0.5} borderRadius="md" fontWeight="bold">
                            {set.wordCount || 1000} TỪ VỰNG
                        </Badge>
                    </Box>
                </Flex>

                <Text color="fg.muted" fontSize="sm" mb={6} noOfLines={3} lineHeight="relaxed">
                    {set.description || `Trọn bộ từ vựng Oxford cấp độ ${set.title} theo khung chuẩn châu Âu.`}
                </Text>
            </Box>

            <Flex gap={3} mt="auto">
                <Button
                    flex="1"
                    variant="outline"
                    colorPalette={palette}
                    size="sm"
                    borderRadius="xl"
                    fontWeight="bold"
                    disabled={isForking}
                    onClick={() => onForkAndManage(set._id)}
                    _hover={{ bg: `${palette}.50`, _dark: { bg: `${palette}.950/20` } }}
                >
                    Quản lý
                </Button>
                <Button
                    flex="1.2"
                    bg={isForking ? "bg.muted" : `${palette}.500`}
                    _dark={{ bg: `${palette}.600` }}
                    color="white"
                    size="sm"
                    borderRadius="xl"
                    fontWeight="bold"
                    gap={1.5}
                    disabled={isForking}
                    onClick={() => onForkAndStudy(set._id)}
                    _hover={{ opacity: 0.9 }}
                >
                    <FiPlay size={10} /> {isForking ? "Đang tạo..." : "Học ngay"}
                </Button>
            </Flex>
        </Box>
    );
};

const HomePage = () => {
    const { stats, fetchStats, fetchStreakInfo } = useStudyStore();
    const navigate = useNavigate();
    const [selectedLevel, setSelectedLevel] = useState(null);

    // States for checking if user has any sets, and fetching CEFR templates
    const [allUserSets, setAllUserSets] = useState([]);
    const [checkingSets, setCheckingSets] = useState(true);
    const [templates, setTemplates] = useState([]);
    const [templatesLoading, setTemplatesLoading] = useState(false);
    const [forkingSetId, setForkingSetId] = useState(null);

    const checkUserSetsAndLoadTemplates = async () => {
        setCheckingSets(true);
        try {
            const userSets = await getWordSets("all");
            setAllUserSets(userSets || []);
            if (!userSets || userSets.length === 0) {
                // If user has no sets, load CEFR templates
                setTemplatesLoading(true);
                try {
                    const cefr = await getCEFRTemplates();
                    // Sort CEFR sets by level order (A1, A2, B1, B2, C1)
                    const order = ["A1", "A2", "B1", "B2", "C1"];
                    const sortedCefr = (cefr || []).sort((a, b) => {
                        const idxA = order.findIndex(o => a.title.includes(o));
                        const idxB = order.findIndex(o => b.title.includes(o));
                        return idxA - idxB;
                    });
                    setTemplates(sortedCefr);
                } catch (err) {
                    console.error("Failed to load CEFR templates:", err);
                } finally {
                    setTemplatesLoading(false);
                }
            }
        } catch (err) {
            console.error("Failed to fetch user wordsets:", err);
        } finally {
            setCheckingSets(false);
        }
    };

    useEffect(() => {
        fetchStats();
        fetchStreakInfo();
        checkUserSetsAndLoadTemplates();
    }, []);

    const handleForkAndStudy = async (setId) => {
        setForkingSetId(setId);
        try {
            const res = await forkWordSet(setId);
            if (res.data && res.data._id) {
                navigate(`/study/${res.data._id}`);
            }
        } catch (err) {
            console.error("Fork set error:", err);
        } finally {
            setForkingSetId(null);
        }
    };

    const handleForkAndManage = async (setId) => {
        setForkingSetId(setId);
        try {
            const res = await forkWordSet(setId);
            if (res.data && res.data._id) {
                navigate(`/sets/${res.data._id}`);
            }
        } catch (err) {
            console.error("Fork set error:", err);
        } finally {
            setForkingSetId(null);
        }
    };

    const renderNewUserDashboard = () => (
        <Box w="full" py={2}>
            {/* Lời kêu gọi hành động nổi bật */}
            <Box
                bg="linear-gradient(135deg, var(--chakra-colors-blue-500) 0%, var(--chakra-colors-purple-600) 100%)"
                borderRadius="3xl"
                p={{ base: 6, md: 8 }}
                color="white"
                mb={8}
                position="relative"
                overflow="hidden"
                shadow="xl"
            >
                <Box
                    position="absolute" top="-20px" right="-20px"
                    w="150px" h="150px" bg="white/10" borderRadius="full" blur="xl"
                />
                <Box
                    position="absolute" bottom="-40px" left="-10px"
                    w="100px" h="100px" bg="white/10" borderRadius="full" blur="md"
                />
                
                <Flex direction="column" gap={3} maxW="650px" position="relative" zIndex={1}>
                    <Badge alignSelf="flex-start" bg="white/20" color="white" px={3} py={1} borderRadius="full" fontSize="xs" fontWeight="bold">
                        👋 CHÀO MỪNG BẠN MỚI
                    </Badge>
                    <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="900" lineHeight="1.2">
                        Bắt đầu hành trình chinh phục IELTS ngay hôm nay!
                    </Text>
                    <Text fontSize={{ base: "sm", md: "md" }} color="white/85" lineHeight="relaxed">
                        Học từ vựng siêu tốc và ghi nhớ trọn đời với phương pháp Spaced Repetition (Lặp lại ngắt quãng). Hãy chọn một trong các bộ từ chuẩn CEFR dưới đây để bắt đầu bài học đầu tiên!
                    </Text>
                </Flex>
            </Box>

            {/* Tiêu đề phần gợi ý */}
            <Flex align="center" gap={2} mb={6}>
                <Text fontSize="2xl" fontWeight="900" color="fg">
                    📚 Bộ từ vựng gợi ý cho bạn
                </Text>
            </Flex>

            {templatesLoading ? (
                <Flex justify="center" py={12}>
                    <Spinner size="lg" colorPalette="blue" />
                </Flex>
            ) : (
                <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={6}>
                    {templates.map((set) => (
                        <CEFRSuggestCard
                            key={set._id}
                            set={set}
                            isForking={forkingSetId === set._id}
                            onForkAndStudy={handleForkAndStudy}
                            onForkAndManage={handleForkAndManage}
                        />
                    ))}
                </SimpleGrid>
            )}
        </Box>
    );

    return (
        <BaseLayout>
            <Box maxW="1400px" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 4, md: 8 }}>
                {checkingSets ? (
                    <Flex justify="center" align="center" minH="50vh">
                        <Spinner size="xl" colorPalette="blue" />
                    </Flex>
                ) : (
                    <>
                        {/* Welcome */}
                        {allUserSets.length > 0 && (
                            <Box mb={6}>
                                <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="extrabold" mb={1}>
                                    Chào mừng trở lại! 👋
                                </Text>
                                <Text color="fg.muted">Tiếp tục hành trình học từ vựng của bạn hôm nay.</Text>
                            </Box>
                        )}

                        <Flex direction={{ base: "column", lg: "row" }} gap={6} alignItems="flex-start">
                            {/* Left Column (Main Content) */}
                            <Box flex="1" w="full" minW="0" display="flex" flexDirection="column" gap={6}>
                                {allUserSets.length === 0 ? (
                                    renderNewUserDashboard()
                                ) : (
                                    <>
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
                                    </>
                                )}
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
                    </>
                )}
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