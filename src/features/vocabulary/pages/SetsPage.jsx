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

    return (
        <Box
            bg="bg.panel"
            borderRadius="2xl"
            p={6}
            borderWidth="1px"
            borderColor="border.muted"
            position="relative"
            overflow="hidden"
            _hover={{ transform: "translateY(-3px)", shadow: "lg", borderColor: `${set.color || "blue"}.300` }}
            transition="all 0.2s ease"
            cursor="pointer"
            onClick={() => navigate(`/sets/${set._id}`)}
        >
            {/* Color accent bar */}
            <Box
                position="absolute" top={0} left={0} right={0} h="4px"
                bg={`${set.color || "blue"}.400`} borderTopRadius="2xl"
            />

            <Flex align="flex-start" justify="space-between" mb={3} mt={1}>
                <Flex align="center" gap={3} flex={1} minW={0}>
                    <Box
                        w="40px" h="40px" flexShrink={0}
                        borderRadius="xl"
                        bg={`${set.color || "blue"}.100`}
                        _dark={{ bg: `${set.color || "blue"}.900/30` }}
                        display="flex" alignItems="center" justifyContent="center"
                        fontSize="xl"
                    >
                        📖
                    </Box>
                    <Box minW={0}>
                        <Text fontWeight="bold" fontSize="md" isTruncated>{set.title}</Text>
                        <Badge
                            colorPalette={set.color || "blue"}
                            variant="subtle" size="sm" mt={1}
                        >
                            {set.wordCount} từ
                        </Badge>
                    </Box>
                </Flex>

                <IconButton
                    size="sm" variant="ghost" colorPalette="red"
                    onClick={(e) => { e.stopPropagation(); onDelete(set._id); }}
                >
                    <FiTrash2 />
                </IconButton>
            </Flex>

            <Text color="fg.muted" fontSize="sm" mb={4} noOfLines={2} minH="40px">
                {set.description || "Chưa có mô tả"}
            </Text>

            <Flex gap={2}>
                <Button
                    flex={1} size="sm" variant="subtle" colorPalette={set.color || "blue"}
                    leftIcon={<FiBook />}
                    onClick={(e) => { e.stopPropagation(); navigate(`/sets/${set._id}`); }}
                >
                    Quản lý
                </Button>
                <Button
                    flex={1} size="sm" colorPalette="green"
                    leftIcon={<FiPlay />}
                    onClick={(e) => { e.stopPropagation(); navigate(`/study/${set._id}`); }}
                >
                    Học ngay
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
                {/* Header */}
                <Flex justify="space-between" align="center" mb={8}>
                    <Box>
                        <Text fontSize="3xl" fontWeight="extrabold" mb={1}>Bộ từ của tôi</Text>
                        <Text color="fg.muted">{wordSets.length} bộ từ</Text>
                    </Box>
                    <Button
                        colorPalette="blue"
                        size="md"
                        onClick={() => setShowCreate(true)}
                        gap={2}
                    >
                        <FiPlus size={16} />
                        Tạo bộ từ
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
