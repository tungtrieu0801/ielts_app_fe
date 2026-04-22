import React, { useEffect, useState } from "react";
import {
    Box, Flex, Text, SimpleGrid, Button, Input, Textarea, Spinner,
    IconButton, Badge, useDisclosure,
} from "@chakra-ui/react";
import { FiPlus, FiTrash2, FiBook, FiPlay } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import BaseLayout from "../../../layouts/BaseLayout.jsx";
import { useVocabularyStore } from "../../../stores/useVocabularyStore.js";

const COLORS = ["blue", "purple", "green", "orange", "red", "teal", "pink"];

const CreateSetModal = ({ onClose, onCreate }) => {
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [color, setColor] = useState("blue");
    const [saving, setSaving] = useState(false);

    const handleCreate = async () => {
        if (!title.trim()) return;
        setSaving(true);
        try {
            await onCreate({ title, description: desc, color });
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
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        borderRadius="lg"
                    />
                </Box>

                <Box mb={4}>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>Mô tả</Text>
                    <Textarea
                        placeholder="Mô tả ngắn về bộ từ này..."
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                        rows={3}
                        borderRadius="lg"
                        resize="none"
                    />
                </Box>

                <Box mb={6}>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>Màu sắc</Text>
                    <Flex gap={2} flexWrap="wrap">
                        {COLORS.map((c) => (
                            <Box
                                key={c} w="28px" h="28px" borderRadius="full"
                                bg={`${c}.400`}
                                cursor="pointer"
                                borderWidth={color === c ? "3px" : "2px"}
                                borderColor={color === c ? "white" : "transparent"}
                                boxShadow={color === c ? `0 0 0 2px var(--chakra-colors-${c}-500)` : "none"}
                                onClick={() => setColor(c)}
                                transition="all 0.15s"
                            />
                        ))}
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

const SetCard = ({ set, onDelete }) => {
    const navigate = useNavigate();
    const fallBackColor = "blue";
    const c = set.color || fallBackColor;

    return (
        <Box
            position="relative"
            bg="bg.panel"
            borderRadius="2xl"
            p={5}
            borderWidth="1px"
            borderColor="border.muted"
            overflow="hidden"
            cursor="pointer"
            transition="all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
            _hover={{
                transform: "translateY(-6px)",
                shadow: `0 20px 40px -10px var(--chakra-colors-${c}-500)`,
                borderColor: `${c}.400`,
            }}
            onClick={() => navigate(`/sets/${set._id}`)}
        >
            {/* Ambient Background Gradient */}
            <Box
                position="absolute"
                top="-20px"
                right="-20px"
                w="120px"
                h="120px"
                bg={`${c}.400`}
                opacity={0.15}
                filter="blur(40px)"
                borderRadius="full"
                pointerEvents="none"
            />

            {/* Top Color Bar Gradient */}
            <Box
                position="absolute" top={0} left={0} right={0} h="5px"
                bg={`linear-gradient(90deg, var(--chakra-colors-${c}-400) 0%, var(--chakra-colors-${c}-600) 100%)`}
            />

            <Flex align="flex-start" justify="space-between" mb={4} mt={2}>
                <Flex align="center" gap={4} flex={1} minW={0}>
                    <Flex
                        w="48px" h="48px" flexShrink={0}
                        borderRadius="xl"
                        bg={`${c}.100`}
                        _dark={{ bg: `${c}.900` }}
                        align="center" justify="center"
                        fontSize="2xl"
                        boxShadow={`0 10px 20px -5px var(--chakra-colors-${c}-500)`}
                    >
                        📖
                    </Flex>
                    <Box minW={0}>
                        <Text
                            fontWeight="800"
                            fontSize="lg"
                            isTruncated
                            letterSpacing="tight"
                        >
                            {set.title}
                        </Text>
                        <Badge
                            colorPalette={c}
                            variant="subtle" size="sm" mt={1}
                            px={2} py={0.5} borderRadius="md"
                            fontWeight="bold"
                        >
                            {set.wordCount} TỪ VỰNG
                        </Badge>
                    </Box>
                </Flex>

                <IconButton
                    size="sm" variant="ghost" colorPalette="red"
                    borderRadius="full"
                    _hover={{ bg: "red.100", color: "red.600", transform: "rotate(10deg)" }}
                    _dark={{ _hover: { bg: "red.900/40" } }}
                    transition="all 0.2s"
                    onClick={(e) => { e.stopPropagation(); onDelete(set._id); }}
                >
                    <FiTrash2 />
                </IconButton>
            </Flex>

            <Text
                color="fg.muted"
                fontSize="sm"
                mb={6}
                lineHeight="1.6"
                noOfLines={2}
                minH="45px"
            >
                {set.description || "Chưa có mô tả nào cho bộ từ này. Hãy click vào để thêm các từ mới nhé."}
            </Text>

            <Flex gap={3}>
                <Button
                    flex={1} size="md" variant="subtle" colorPalette={c}
                    borderRadius="xl"
                    gap={2}
                    onClick={(e) => { e.stopPropagation(); navigate(`/sets/${set._id}`); }}
                    _hover={{ bg: `${c}.200` }}
                    _dark={{ _hover: { bg: `${c}.800` } }}
                    transition="all 0.2s"
                >
                    <FiBook size={16} /> Quản lý
                </Button>
                <Button
                    flex={1} size="md"
                    bg={`linear-gradient(135deg, var(--chakra-colors-${c}-400) 0%, var(--chakra-colors-${c}-600) 100%)`}
                    color="white"
                    borderRadius="xl"
                    gap={2}
                    onClick={(e) => { e.stopPropagation(); navigate(`/study/${set._id}`); }}
                    _hover={{ opacity: 0.9, transform: "scale(1.02)" }}
                    transition="all 0.2s"
                >
                    <FiPlay size={16} /> Học ngay
                </Button>
            </Flex>
        </Box>
    );
};

const SetsPage = () => {
    const { wordSets, fetchWordSets, createWordSet, deleteWordSet, loading } = useVocabularyStore();
    const [showCreate, setShowCreate] = useState(false);

    useEffect(() => {
        fetchWordSets();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc muốn xóa bộ từ này? Tất cả từ vựng trong bộ sẽ bị xóa.")) return;
        await deleteWordSet(id);
    };

    return (
        <BaseLayout>
            <Box maxW="1200px" mx="auto">
                {/* Header Premium Design */}
                <Flex
                    direction={{ base: "column", sm: "row" }}
                    justify="space-between"
                    align={{ base: "flex-start", sm: "center" }}
                    gap={4}
                    mb={10}
                    p={6}
                    borderRadius="2xl"
                    bg="bg.panel"
                    borderWidth="1px"
                    borderColor="border.muted"
                    boxShadow="sm"
                    position="relative"
                    overflow="hidden"
                >
                    {/* Decorative gradient blob inside header */}
                    <Box
                        position="absolute"
                        top="-50%" left="-10%"
                        w="200px" h="200px"
                        bg="brand.400"
                        opacity={0.1}
                        filter="blur(50px)"
                        borderRadius="full"
                        pointerEvents="none"
                    />

                    <Box position="relative" zIndex={1} flex={1}>
                        <Text
                            fontSize={{ base: "2xl", sm: "3xl", md: "4xl" }}
                            fontWeight="900"
                            letterSpacing="tight"
                            mb={1}
                        >
                            Bộ từ
                        </Text>
                        <Text color="fg.muted" fontSize={{ base: "sm", md: "md" }} fontWeight="500">
                            Bạn đang quản lý {wordSets.length} bộ từ vựng
                        </Text>
                    </Box>
                    <Button
                        size={{ base: "md", sm: "lg" }}
                        borderRadius="xl"
                        bg="linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)"
                        color="white"
                        fontWeight="700"
                        flexShrink={0}
                        _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
                        transition="all 0.2s"
                        onClick={() => setShowCreate(true)}
                        gap={2}
                        zIndex={1}
                    >
                        <FiPlus size={20} /> Tạo bộ từ mới
                    </Button>
                </Flex>

                {loading ? (
                    <Flex justify="center" py={20}><Spinner size="xl" /></Flex>
                ) : wordSets.length === 0 ? (
                    <Flex
                        direction="column" align="center" justify="center"
                        py={20} borderRadius="3xl" borderWidth="2px"
                        borderStyle="dashed" borderColor="border.muted" gap={4}
                    >
                        <Text fontSize="5xl">📚</Text>
                        <Text fontWeight="bold" fontSize="xl">Chưa có bộ từ nào</Text>
                        <Text color="fg.muted" textAlign="center" maxW="300px">
                            Tạo bộ từ đầu tiên và bắt đầu import từ vựng từ file Excel của bạn!
                        </Text>
                        <Button colorPalette="blue" size="lg" mt={2} onClick={() => setShowCreate(true)}>
                            <FiPlus /> Tạo bộ từ đầu tiên
                        </Button>
                    </Flex>
                ) : (
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={5}>
                        {wordSets.map((set) => (
                            <SetCard key={set._id} set={set} onDelete={handleDelete} />
                        ))}
                    </SimpleGrid>
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
