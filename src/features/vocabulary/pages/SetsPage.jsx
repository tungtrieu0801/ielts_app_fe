import React, { useEffect, useState } from "react";
import {
    Box, Flex, Text, SimpleGrid, Button, Input, Textarea, Spinner,
    IconButton, Badge,
} from "@chakra-ui/react";
import { FiPlus, FiTrash2, FiBook, FiPlay, FiGlobe, FiLock, FiGitBranch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import BaseLayout from "../../../layouts/BaseLayout.jsx";
import { useVocabularyStore } from "../../../stores/useVocabularyStore.js";

const COLORS = ["blue", "purple", "green", "orange", "red", "teal", "pink"];

// ── Create Modal ─────────────────────────────────────────────────────────────
const CreateSetModal = ({ onClose, onCreate }) => {
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [color, setColor] = useState("blue");
    const [isPublic, setIsPublic] = useState(false);
    const [saving, setSaving] = useState(false);

    const handleCreate = async () => {
        if (!title.trim()) return;
        setSaving(true);
        try {
            await onCreate({ title, description: desc, color, isPublic });
            onClose();
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box
            position="fixed" inset={0} zIndex={50}
            bg="blackAlpha.600" display="flex" alignItems="center" justifyContent="center"
            onClick={onClose}
        >
            <Box
                bg="bg.panel" borderRadius="2xl" p={8} w="full" maxW="480px"
                mx={4} shadow="2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <Text fontSize="xl" fontWeight="bold" mb={6}>Tạo bộ từ mới</Text>

                <Box mb={4}>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>Tên bộ từ *</Text>
                    <Input
                        placeholder="VD: IELTS Academic - Task 2"
                        value={title} onChange={(e) => setTitle(e.target.value)}
                        borderRadius="lg"
                    />
                </Box>

                <Box mb={4}>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>Mô tả</Text>
                    <Textarea
                        placeholder="Mô tả ngắn về bộ từ này..."
                        value={desc} onChange={(e) => setDesc(e.target.value)}
                        rows={3} borderRadius="lg" resize="none"
                    />
                </Box>

                <Box mb={4}>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>Màu sắc</Text>
                    <Flex gap={2} flexWrap="wrap">
                        {COLORS.map((c) => (
                            <Box
                                key={c} w="28px" h="28px" borderRadius="full"
                                bg={`${c}.400`} cursor="pointer"
                                borderWidth={color === c ? "3px" : "2px"}
                                borderColor={color === c ? "white" : "transparent"}
                                boxShadow={color === c ? `0 0 0 2px var(--chakra-colors-${c}-500)` : "none"}
                                onClick={() => setColor(c)}
                                transition="all 0.15s"
                            />
                        ))}
                    </Flex>
                </Box>

                {/* Public / Private toggle */}
                <Box mb={6}>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>Hiển thị</Text>
                    <Flex gap={2}>
                        <Box
                            flex={1} py={3} px={4} borderRadius="xl" cursor="pointer"
                            borderWidth="2px"
                            borderColor={!isPublic ? "blue.400" : "border.muted"}
                            bg={!isPublic ? "blue.50" : "transparent"}
                            _dark={{ bg: !isPublic ? "blue.900/30" : "transparent" }}
                            onClick={() => setIsPublic(false)}
                            transition="all 0.15s"
                        >
                            <Flex align="center" gap={2} mb={0.5}>
                                <FiLock size={14} color={!isPublic ? "#3b82f6" : undefined} />
                                <Text fontSize="sm" fontWeight={!isPublic ? "700" : "500"}
                                    color={!isPublic ? "blue.600" : "fg.muted"}>Riêng tư</Text>
                            </Flex>
                            <Text fontSize="xs" color="fg.muted">Chỉ bạn mới thấy</Text>
                        </Box>
                        <Box
                            flex={1} py={3} px={4} borderRadius="xl" cursor="pointer"
                            borderWidth="2px"
                            borderColor={isPublic ? "green.400" : "border.muted"}
                            bg={isPublic ? "green.50" : "transparent"}
                            _dark={{ bg: isPublic ? "green.900/30" : "transparent" }}
                            onClick={() => setIsPublic(true)}
                            transition="all 0.15s"
                        >
                            <Flex align="center" gap={2} mb={0.5}>
                                <FiGlobe size={14} color={isPublic ? "#22c55e" : undefined} />
                                <Text fontSize="sm" fontWeight={isPublic ? "700" : "500"}
                                    color={isPublic ? "green.600" : "fg.muted"}>Công khai</Text>
                            </Flex>
                            <Text fontSize="xs" color="fg.muted">Mọi người có thể thấy & fork</Text>
                        </Box>
                    </Flex>
                </Box>

                <Flex gap={3} justify="flex-end">
                    <Button variant="ghost" onClick={onClose}>Hủy</Button>
                    <Button
                        colorPalette="blue" onClick={handleCreate}
                        loading={saving} disabled={!title.trim()}
                    >
                        Tạo bộ từ
                    </Button>
                </Flex>
            </Box>
        </Box>
    );
};

// ── My Set Card ───────────────────────────────────────────────────────────────
const SetCard = ({ set, onDelete, onTogglePublic }) => {
    const navigate = useNavigate();
    const [toggling, setToggling] = useState(false);
    const c = set.color || "blue";

    return (
        <Box
            position="relative" bg="bg.panel" borderRadius="2xl" p={5}
            borderWidth="1px" borderColor="border.muted" overflow="hidden"
            cursor="pointer" transition="all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
            _hover={{
                transform: "translateY(-6px)",
                shadow: `0 20px 40px -10px var(--chakra-colors-${c}-500)`,
                borderColor: `${c}.400`,
            }}
            onClick={() => navigate(`/sets/${set._id}`)}
        >
            <Box position="absolute" top="-20px" right="-20px"
                w="120px" h="120px" bg={`${c}.400`} opacity={0.15}
                filter="blur(40px)" borderRadius="full" pointerEvents="none"
            />
            <Box position="absolute" top={0} left={0} right={0} h="5px"
                bg={`linear-gradient(90deg, var(--chakra-colors-${c}-400) 0%, var(--chakra-colors-${c}-600) 100%)`}
            />

            <Flex align="flex-start" justify="space-between" mb={4} mt={2}>
                <Flex align="center" gap={4} flex={1} minW={0}>
                    <Flex w="48px" h="48px" flexShrink={0} borderRadius="xl"
                        bg={`${c}.100`} _dark={{ bg: `${c}.900` }}
                        align="center" justify="center" fontSize="2xl"
                        boxShadow={`0 10px 20px -5px var(--chakra-colors-${c}-500)`}
                    >
                        📖
                    </Flex>
                    <Box minW={0}>
                        <Flex align="center" gap={2}>
                            <Text fontWeight="800" fontSize="lg" isTruncated letterSpacing="tight">
                                {set.title}
                            </Text>
                            {set.isPublic ? (
                                <FiGlobe size={13} color="var(--chakra-colors-green-500)" title="Công khai" />
                            ) : (
                                <FiLock size={13} color="var(--chakra-colors-gray-400)" title="Riêng tư" />
                            )}
                        </Flex>
                        <Badge colorPalette={c} variant="subtle" size="sm" mt={1}
                            px={2} py={0.5} borderRadius="md" fontWeight="bold">
                            {set.wordCount} TỪ VỰNG
                        </Badge>
                    </Box>
                </Flex>

                <IconButton size="sm" variant="ghost" colorPalette="red" borderRadius="full"
                    _hover={{ bg: "red.100", color: "red.600", transform: "rotate(10deg)" }}
                    _dark={{ _hover: { bg: "red.900/40" } }}
                    transition="all 0.2s"
                    onClick={(e) => { e.stopPropagation(); onDelete(set._id); }}
                >
                    <FiTrash2 />
                </IconButton>
            </Flex>

            <Text color="fg.muted" fontSize="sm" mb={6} lineHeight="1.6" noOfLines={2} minH="45px">
                {set.description || "Chưa có mô tả nào cho bộ từ này."}
            </Text>

            <Flex gap={3} mb={2}>
                <Button flex={1} size="md" variant="subtle" colorPalette={c} borderRadius="xl" gap={2}
                    onClick={(e) => { e.stopPropagation(); navigate(`/sets/${set._id}`); }}
                    _hover={{ bg: `${c}.200` }} _dark={{ _hover: { bg: `${c}.800` } }} transition="all 0.2s"
                >
                    <FiBook size={16} /> Quản lý
                </Button>
                <Button flex={1} size="md" borderRadius="xl" gap={2}
                    bg={`linear-gradient(135deg, var(--chakra-colors-${c}-400) 0%, var(--chakra-colors-${c}-600) 100%)`}
                    color="white"
                    onClick={(e) => { e.stopPropagation(); navigate(`/study/${set._id}`); }}
                    _hover={{ opacity: 0.9, transform: "scale(1.02)" }} transition="all 0.2s"
                >
                    <FiPlay size={16} /> Học ngay
                </Button>
            </Flex>

            {/* Privacy toggle */}
            <Button
                w="full" size="sm" borderRadius="xl" gap={2} variant="ghost"
                colorPalette={set.isPublic ? "green" : "gray"}
                loading={toggling}
                onClick={async (e) => {
                    e.stopPropagation();
                    setToggling(true);
                    try { await onTogglePublic(set._id, !set.isPublic); }
                    finally { setToggling(false); }
                }}
                borderWidth="1px"
                borderColor={set.isPublic ? "green.200" : "border.muted"}
                _dark={{ borderColor: set.isPublic ? "green.700" : "border.muted" }}
                transition="all 0.2s"
            >
                {set.isPublic ? <><FiGlobe size={13} /> Công khai — chuyển thành Riêng tư</> : <><FiLock size={13} /> Riêng tư — chuyển thành Công khai</>}
            </Button>
        </Box>
    );
};

// ── Public Set Card ───────────────────────────────────────────────────────────
const PublicSetCard = ({ set, onFork }) => {
    const [forking, setForking] = useState(false);
    const c = set.color || "blue";

    const handleFork = async (e) => {
        e.stopPropagation();
        setForking(true);
        try {
            await onFork(set._id);
        } finally {
            setForking(false);
        }
    };

    return (
        <Box
            position="relative" bg="bg.panel" borderRadius="2xl" p={5}
            borderWidth="1px" borderColor="border.muted" overflow="hidden"
            transition="all 0.3s ease"
            _hover={{ transform: "translateY(-4px)", shadow: "lg", borderColor: `${c}.300` }}
        >
            <Box position="absolute" top={0} left={0} right={0} h="4px"
                bg={`linear-gradient(90deg, var(--chakra-colors-${c}-400), var(--chakra-colors-${c}-600))`}
            />

            <Flex align="center" gap={3} mb={3} mt={2}>
                <Flex w="44px" h="44px" flexShrink={0} borderRadius="xl"
                    bg={`${c}.100`} _dark={{ bg: `${c}.900` }}
                    align="center" justify="center" fontSize="xl"
                >
                    📖
                </Flex>
                <Box flex={1} minW={0}>
                    <Text fontWeight="700" fontSize="md" isTruncated>{set.title}</Text>
                    <Flex align="center" gap={2} mt={0.5}>
                        <Badge colorPalette={c} variant="subtle" size="sm">{set.wordCount} từ</Badge>
                        <Badge colorPalette="green" variant="subtle" size="sm" gap={1}>
                            <FiGlobe size={9} /> Công khai
                        </Badge>
                    </Flex>
                </Box>
            </Flex>

            <Text color="fg.muted" fontSize="sm" mb={3} noOfLines={2} minH="40px" lineHeight="1.6">
                {set.description || "Chưa có mô tả."}
            </Text>

            {/* Owner info */}
            {set.owner && (
                <Flex align="center" gap={2} mb={4}>
                    {set.owner.picture ? (
                        <Box as="img" src={set.owner.picture} w="20px" h="20px"
                            borderRadius="full" flexShrink={0} />
                    ) : (
                        <Box w="20px" h="20px" borderRadius="full" bg="gray.300" flexShrink={0} />
                    )}
                    <Text fontSize="xs" color="fg.muted" isTruncated>
                        {set.owner.name}
                    </Text>
                </Flex>
            )}

            <Button
                w="full" size="sm" colorPalette="green" borderRadius="xl" gap={2}
                onClick={handleFork} loading={forking}
                _hover={{ transform: "scale(1.02)" }} transition="all 0.2s"
            >
                <FiGitBranch size={14} /> Fork & Học bộ từ này
            </Button>
        </Box>
    );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const SetsPage = () => {
    const {
        wordSets, publicSets,
        fetchWordSets, fetchPublicSets,
        createWordSet, deleteWordSet, updateWordSet,
        forkWordSet,
        loading, publicLoading,
    } = useVocabularyStore();
    const [showCreate, setShowCreate] = useState(false);
    const [tab, setTab] = useState("mine"); // "mine" | "community"

    useEffect(() => { fetchWordSets(); }, []);

    useEffect(() => {
        if (tab === "community") fetchPublicSets();
    }, [tab]);

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc muốn xóa bộ từ này? Tất cả từ vựng trong bộ sẽ bị xóa.")) return;
        await deleteWordSet(id);
    };

    const handleTogglePublic = async (id, isPublic) => {
        await updateWordSet(id, { isPublic });
    };

    const handleFork = async (id) => {
        const res = await forkWordSet(id);
        if (res.alreadyForked) {
            alert("Bạn đã fork bộ từ này trước đó rồi!");
        } else {
            alert(res.message || "Fork thành công! Bộ từ đã được thêm vào danh sách của bạn.");
            setTab("mine");
        }
    };

    return (
        <BaseLayout>
            <Box maxW="1200px" mx="auto">
                {/* Header */}
                <Flex
                    direction={{ base: "column", sm: "row" }}
                    justify="space-between" align={{ base: "flex-start", sm: "center" }}
                    gap={4} mb={8} p={6} borderRadius="2xl"
                    bg="bg.panel" borderWidth="1px" borderColor="border.muted"
                    boxShadow="sm" position="relative" overflow="hidden"
                >
                    <Box position="absolute" top="-50%" left="-10%"
                        w="200px" h="200px" bg="brand.400" opacity={0.1}
                        filter="blur(50px)" borderRadius="full" pointerEvents="none"
                    />
                    <Box position="relative" zIndex={1} flex={1}>
                        <Text fontSize={{ base: "2xl", sm: "3xl", md: "4xl" }}
                            fontWeight="900" letterSpacing="tight" mb={1}>
                            Bộ từ
                        </Text>
                        <Text color="fg.muted" fontSize={{ base: "sm", md: "md" }} fontWeight="500">
                            Bạn đang quản lý {wordSets.length} bộ từ vựng
                        </Text>
                    </Box>
                    <Button
                        size={{ base: "md", sm: "lg" }} borderRadius="xl"
                        bg="linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)"
                        color="white" fontWeight="700" flexShrink={0}
                        _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
                        transition="all 0.2s"
                        onClick={() => setShowCreate(true)} gap={2} zIndex={1}
                    >
                        <FiPlus size={20} /> Tạo bộ từ mới
                    </Button>
                </Flex>

                {/* Tabs */}
                <Flex gap={1} mb={6} bg="bg.subtle" p={1} borderRadius="xl" w="fit-content">
                    {[
                        { key: "mine", label: "📚 Của tôi", count: wordSets.length },
                        { key: "community", label: "🌐 Cộng đồng", count: publicSets.length || null },
                    ].map(({ key, label, count }) => (
                        <Button
                            key={key} size="sm" borderRadius="lg"
                            variant={tab === key ? "solid" : "ghost"}
                            colorPalette={tab === key ? "blue" : "gray"}
                            onClick={() => setTab(key)}
                            gap={1.5}
                        >
                            {label}
                            {count ? (
                                <Badge size="sm" colorPalette={tab === key ? "blue" : "gray"}
                                    variant="subtle" borderRadius="full">{count}</Badge>
                            ) : null}
                        </Button>
                    ))}
                </Flex>

                {/* ── Tab: Của tôi ── */}
                {tab === "mine" && (
                    loading ? (
                        <Flex justify="center" py={20}><Spinner size="xl" /></Flex>
                    ) : wordSets.length === 0 ? (
                        <Flex direction="column" align="center" justify="center"
                            py={20} borderRadius="3xl" borderWidth="2px"
                            borderStyle="dashed" borderColor="border.muted" gap={4}
                        >
                            <Text fontSize="5xl">📚</Text>
                            <Text fontWeight="bold" fontSize="xl">Chưa có bộ từ nào</Text>
                            <Text color="fg.muted" textAlign="center" maxW="300px">
                                Tạo bộ từ đầu tiên và bắt đầu import từ vựng từ file Excel!
                            </Text>
                            <Button colorPalette="blue" size="lg" mt={2} onClick={() => setShowCreate(true)}>
                                <FiPlus /> Tạo bộ từ đầu tiên
                            </Button>
                        </Flex>
                    ) : (
                        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={5}>
                            {wordSets.map((set) => (
                                <SetCard key={set._id} set={set} onDelete={handleDelete} onTogglePublic={handleTogglePublic} />
                            ))}
                        </SimpleGrid>
                    )
                )}

                {/* ── Tab: Cộng đồng ── */}
                {tab === "community" && (
                    publicLoading ? (
                        <Flex justify="center" py={20}><Spinner size="xl" /></Flex>
                    ) : publicSets.length === 0 ? (
                        <Flex direction="column" align="center" py={20} gap={3} color="fg.muted">
                            <Text fontSize="5xl">🌐</Text>
                            <Text fontWeight="bold" fontSize="lg">Chưa có bộ từ công khai nào</Text>
                            <Text fontSize="sm">Hãy chia sẻ bộ từ của bạn để cộng đồng cùng học!</Text>
                        </Flex>
                    ) : (
                        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={5}>
                            {publicSets.map((set) => (
                                <PublicSetCard key={set._id} set={set} onFork={handleFork} />
                            ))}
                        </SimpleGrid>
                    )
                )}
            </Box>

            {showCreate && (
                <CreateSetModal
                    onClose={() => setShowCreate(false)}
                    onCreate={createWordSet}
                />
            )}
        </BaseLayout>
    );
};

export default SetsPage;
