import React, { useState, useEffect } from "react";
import {
    Box,
    Flex,
    Text,
    Button,
    VStack,
    HStack,
    Textarea,
    Input,
    Badge,
    Spinner,
    IconButton,
    Card,
    SimpleGrid
} from "@chakra-ui/react";
import { FiPlus, FiBookOpen, FiTrash2, FiArrowRight, FiFileText, FiCheckCircle, FiClock, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import BaseLayout from "../../../layouts/BaseLayout.jsx";
import { getTranslationSessions, createTranslationSession, deleteTranslationSession } from "../../../services/translationApi.js";

const TranslationListPage = () => {
    const navigate = useNavigate();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    
    // Create form state
    const [title, setTitle] = useState("");
    const [rawText, setRawText] = useState("");
    const [previewSentences, setPreviewSentences] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const fetchSessions = async () => {
        setLoading(true);
        try {
            const data = await getTranslationSessions();
            setSessions(data.sessions || []);
        } catch (err) {
            console.error("Failed to load sessions:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    // Auto-split preview when text changes
    useEffect(() => {
        if (!rawText.trim()) {
            setPreviewSentences([]);
            return;
        }
        const split = rawText
            .split(/(?<=[.!?])\s+|\n+/)
            .map((s) => s.trim())
            .filter((s) => s.length > 0);
        setPreviewSentences(split);
    }, [rawText]);

    const handleCreate = async () => {
        if (!title.trim()) {
            setErrorMsg("Vui lòng nhập tiêu đề bài viết");
            return;
        }
        if (!rawText.trim()) {
            setErrorMsg("Vui lòng nhập hoặc dán nội dung đoạn văn tiếng Anh");
            return;
        }

        setSubmitting(true);
        setErrorMsg("");

        try {
            const res = await createTranslationSession({
                title: title.trim(),
                text: rawText.trim()
            });
            setShowCreateModal(false);
            setTitle("");
            setRawText("");
            navigate(`/translation/${res.session._id}`);
        } catch (err) {
            console.error(err);
            setErrorMsg(err?.response?.data?.message || "Có lỗi xảy ra khi tạo bài dịch");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm("Bạn có chắc chắn muốn xóa bài dịch này?")) return;
        try {
            await deleteTranslationSession(id);
            setSessions((prev) => prev.filter((s) => s._id !== id));
        } catch (err) {
            alert("Không thể xóa bài dịch");
        }
    };

    return (
        <BaseLayout>
            <Box maxW="1200px" mx="auto" pb={10}>
                {/* Banner Header */}
                <Flex
                    direction={{ base: "column", md: "row" }}
                    justify="space-between"
                    align={{ base: "flex-start", md: "center" }}
                    p={6}
                    mb={8}
                    borderRadius="2xl"
                    bgGradient="to-r"
                    gradientFrom="teal.500"
                    gradientTo="blue.600"
                    color="white"
                    shadow="lg"
                    gap={4}
                >
                    <Box>
                        <HStack gap={2} mb={1}>
                            <FiFileText size={24} />
                            <Text fontSize="2xl" fontWeight="800" letterSpacing="-0.5px">
                                Luyện Dịch Báo & Đoạn Văn
                            </Text>
                        </HStack>
                        <Text fontSize="sm" opacity={0.9}>
                            Rèn luyện tư duy dịch song ngữ Anh - Việt qua 2 bước: Dịch thô & Dịch chuẩn phong cách.
                        </Text>
                    </Box>

                    <Button
                        bg="white"
                        color="teal.700"
                        _hover={{ bg: "gray.100", transform: "translateY(-1px)" }}
                        fontWeight="700"
                        size="lg"
                        borderRadius="xl"
                        onClick={() => setShowCreateModal(true)}
                    >
                        <FiPlus style={{ marginRight: 6 }} /> Tạo bài dịch mới
                    </Button>
                </Flex>

                {/* Session List Header */}
                <Flex justify="space-between" align="center" mb={4}>
                    <Text fontSize="lg" fontWeight="700">
                        Danh sách bài dịch của bạn ({sessions.length})
                    </Text>
                </Flex>

                {loading ? (
                    <Flex justify="center" align="center" py={12}>
                        <Spinner size="lg" color="teal.500" />
                    </Flex>
                ) : sessions.length === 0 ? (
                    <Box
                        textAlign="center"
                        py={12}
                        px={4}
                        borderWidth="2px"
                        borderStyle="dashed"
                        borderColor="border.muted"
                        borderRadius="2xl"
                        bg="bg.panel"
                    >
                        <FiBookOpen size={48} style={{ margin: "0 auto 16px", color: "#A0AEC0" }} />
                        <Text fontSize="lg" fontWeight="700" mb={1}>
                            Chưa có bài luyện dịch nào
                        </Text>
                        <Text fontSize="sm" color="fg.muted" mb={6}>
                            Hãy dán một bài báo hoặc đoạn văn tiếng Anh để bắt đầu luyện tập!
                        </Text>
                        <Button
                            colorPalette="teal"
                            size="md"
                            borderRadius="xl"
                            onClick={() => setShowCreateModal(true)}
                        >
                            <FiPlus style={{ marginRight: 6 }} /> Tạo bài dịch đầu tiên
                        </Button>
                    </Box>
                ) : (
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={5}>
                        {sessions.map((s) => {
                            const percent = Math.round(((s.completedSentences || 0) / (s.totalSentences || 1)) * 100);
                            const isDone = percent === 100;

                            return (
                                <Card.Root
                                    key={s._id}
                                    borderRadius="xl"
                                    overflow="hidden"
                                    cursor="pointer"
                                    transition="all 0.2s"
                                    _hover={{ shadow: "md", borderColor: "teal.400", transform: "translateY(-2px)" }}
                                    onClick={() => navigate(`/translation/${s._id}`)}
                                >
                                    <Card.Body p={5}>
                                        <Flex justify="space-between" align="flex-start" mb={3}>
                                            <Badge
                                                colorPalette={isDone ? "green" : "teal"}
                                                variant="subtle"
                                                px={2.5}
                                                py={1}
                                                borderRadius="md"
                                            >
                                                {isDone ? <HStack gap={1}><FiCheckCircle /> Hoàn thành</HStack> : `Tiến độ: ${percent}%`}
                                            </Badge>
                                            <IconButton
                                                aria-label="Xóa"
                                                variant="ghost"
                                                colorPalette="red"
                                                size="xs"
                                                onClick={(e) => handleDelete(s._id, e)}
                                                _hover={{ bg: "red.50", color: "red.600" }}
                                            >
                                                <FiTrash2 />
                                            </IconButton>
                                        </Flex>

                                        <Text fontSize="md" fontWeight="700" mb={2} lineClamp={2} color="fg">
                                            {s.title}
                                        </Text>

                                        <VStack align="stretch" gap={1.5} fontSize="xs" color="fg.muted" mb={4}>
                                            <Flex justify="space-between">
                                                <Text>Số câu gốc:</Text>
                                                <Text fontWeight="600" color="fg">{s.totalSentences} câu</Text>
                                            </Flex>
                                            <Flex justify="space-between">
                                                <Text>Từ vựng nhặt được:</Text>
                                                <Text fontWeight="600" color="teal.600">{s.vocabCount} từ</Text>
                                            </Flex>
                                            {s.updatedAt && (
                                                <Flex justify="space-between">
                                                    <Text>Cập nhật:</Text>
                                                    <Text>{new Date(s.updatedAt).toLocaleDateString("vi-VN")}</Text>
                                                </Flex>
                                            )}
                                        </VStack>

                                        {/* Progress Bar */}
                                        <Box w="full" bg="gray.100" _dark={{ bg: "gray.700" }} h="6px" borderRadius="full" mb={4} overflow="hidden">
                                            <Box
                                                h="full"
                                                bg={isDone ? "green.500" : "teal.500"}
                                                w={`${percent}%`}
                                                transition="width 0.3s ease"
                                            />
                                        </Box>

                                        <Button size="sm" colorPalette="teal" variant="light" w="full" borderRadius="lg" justify="center">
                                            Luyện tập tiếp <FiArrowRight style={{ marginLeft: 4 }} />
                                        </Button>
                                    </Card.Body>
                                </Card.Root>
                            );
                        })}
                    </SimpleGrid>
                )}

                {/* Create Session Modal */}
                {showCreateModal && (
                    <Box
                        position="fixed"
                        top={0}
                        left={0}
                        right={0}
                        bottom={0}
                        bg="blackAlpha.700"
                        zIndex={1500}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        p={4}
                        onClick={() => setShowCreateModal(false)}
                    >
                        <Box
                            bg="bg.panel"
                            borderRadius="2xl"
                            maxW="650px"
                            w="full"
                            maxH="90vh"
                            overflowY="auto"
                            p={6}
                            shadow="2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Flex justify="space-between" align="center" mb={4}>
                                <HStack gap={2}>
                                    <FiFileText size={20} color="#319795" />
                                    <Text fontSize="xl" fontWeight="800">
                                        Tạo bài luyện dịch mới
                                    </Text>
                                </HStack>
                                <IconButton
                                    aria-label="Đóng"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowCreateModal(false)}
                                >
                                    <FiX />
                                </IconButton>
                            </Flex>

                            {errorMsg && (
                                <Box p={3} mb={4} bg="red.50" _dark={{ bg: "red.900/30" }} color="red.600" borderRadius="lg" fontSize="sm">
                                    {errorMsg}
                                </Box>
                            )}

                            <VStack align="stretch" gap={4}>
                                <Box>
                                    <Text fontSize="sm" fontWeight="700" mb={1.5}>
                                        Tiêu đề bài báo / đoạn văn <Text as="span" color="red.500">*</Text>
                                    </Text>
                                    <Input
                                        placeholder="Ví dụ: Bloomberg - US Inflation Trends 2026"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        borderRadius="lg"
                                    />
                                </Box>

                                <Box>
                                    <Text fontSize="sm" fontWeight="700" mb={1.5}>
                                        Dán văn bản tiếng Anh <Text as="span" color="red.500">*</Text>
                                    </Text>
                                    <Textarea
                                        placeholder="Dán toàn bộ đoạn văn hoặc bài báo tiếng Anh vào đây..."
                                        rows={7}
                                        value={rawText}
                                        onChange={(e) => setRawText(e.target.value)}
                                        borderRadius="lg"
                                    />
                                </Box>

                                {/* Preview sentence split count */}
                                {previewSentences.length > 0 && (
                                    <Box p={3.5} bg="teal.50" _dark={{ bg: "teal.900/20" }} borderRadius="xl" borderLeftWidth="4px" borderColor="teal.500">
                                        <Flex justify="space-between" align="center" mb={1}>
                                            <Text fontSize="xs" fontWeight="700" color="teal.700" _dark={{ color: "teal.300" }}>
                                                Hệ thống đã tự động phân tách thành {previewSentences.length} câu:
                                            </Text>
                                        </Flex>
                                        <VStack align="stretch" gap={1} maxH="120px" overflowY="auto" pt={1}>
                                            {previewSentences.slice(0, 4).map((s, idx) => (
                                                <Text key={idx} fontSize="xs" color="fg.muted" lineClamp={1}>
                                                    • {s}
                                                </Text>
                                            ))}
                                            {previewSentences.length > 4 && (
                                                <Text fontSize="xs" fontStyle="italic" color="teal.600">
                                                    ... và {previewSentences.length - 4} câu tiếp theo.
                                                </Text>
                                            )}
                                        </VStack>
                                    </Box>
                                )}

                                <Flex justify="flex-end" gap={3} pt={2}>
                                    <Button variant="ghost" onClick={() => setShowCreateModal(false)}>
                                        Hủy
                                    </Button>
                                    <Button
                                        colorPalette="teal"
                                        onClick={handleCreate}
                                        loading={submitting}
                                        borderRadius="xl"
                                        px={6}
                                    >
                                        Bắt đầu bài dịch
                                    </Button>
                                </Flex>
                            </VStack>
                        </Box>
                    </Box>
                )}
            </Box>
        </BaseLayout>
    );
};

export default TranslationListPage;
