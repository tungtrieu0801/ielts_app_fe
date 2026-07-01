import React, { useEffect, useState, useCallback } from "react";
import { Box, Flex, Text, Button, Badge, Spinner, Input, SimpleGrid, IconButton } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiSearch, FiChevronLeft, FiChevronRight, FiCheck, FiX, FiEdit2, FiTrash2 } from "react-icons/fi";
import BaseLayout from "../../../layouts/BaseLayout.jsx";
import { useVocabularyStore } from "../../../stores/useVocabularyStore.js";
import { getAllWords } from "../../../services/vocabularyApi.js";

const PAGE_SIZE = 15;

const GlobalWordRow = ({ word, index, onUpdate, onDelete }) => {
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({
        english: word.english,
        vietnamese: word.vietnamese,
        pronunciation: word.pronunciation || "",
        partOfSpeech: word.partOfSpeech || "",
        example: word.example || "",
    });
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            await onUpdate(word, form);
            setEditing(false);
        } finally {
            setSaving(false);
        }
    };

    const setInfo = word.setId || {};
    const setColor = setInfo.color || "blue";

    return (
        <tr style={{
            background: index % 2 === 0 ? "transparent" : "var(--chakra-colors-bg-subtle)",
            borderBottom: "1px solid var(--chakra-colors-border-muted)",
            transition: "background 0.15s",
        }}>
            <td style={{ padding: "12px 16px", fontSize: "13px", color: "var(--chakra-colors-fg-subtle)", width: "40px" }}>
                {index + 1}
            </td>
            <td style={{ padding: "12px 12px", minWidth: "140px", fontWeight: 600 }}>
                {editing ? (
                    <Input size="xs" value={form.english} onChange={(e) => setForm({ ...form, english: e.target.value })} borderColor="blue.400" />
                ) : word.english}
            </td>
            <td style={{ padding: "12px 12px", minWidth: "140px" }}>
                {editing ? (
                    <Input size="xs" value={form.vietnamese} onChange={(e) => setForm({ ...form, vietnamese: e.target.value })} />
                ) : word.vietnamese}
            </td>
            <td style={{ padding: "12px 12px", minWidth: "130px", color: "var(--chakra-colors-fg-muted)", fontSize: "13px", fontStyle: "italic" }}>
                {editing ? (
                    <Input size="xs" value={form.pronunciation} onChange={(e) => setForm({ ...form, pronunciation: e.target.value })} placeholder="/ˈwɜːd/" />
                ) : (word.pronunciation || "—")}
            </td>
            <td style={{ padding: "12px 12px", minWidth: "100px" }}>
                {editing ? (
                    <Input size="xs" value={form.partOfSpeech} onChange={(e) => setForm({ ...form, partOfSpeech: e.target.value })} placeholder="noun, verb..." />
                ) : (
                    word.partOfSpeech
                        ? <Badge colorPalette="blue" size="sm" variant="subtle">{word.partOfSpeech}</Badge>
                        : "—"
                )}
            </td>
            <td style={{ padding: "12px 12px", minWidth: "200px", color: "var(--chakra-colors-fg-muted)", fontSize: "13px" }}>
                {editing ? (
                    <Input size="xs" value={form.example} onChange={(e) => setForm({ ...form, example: e.target.value })} />
                ) : (word.example || "—")}
            </td>
            <td style={{ padding: "12px 12px", minWidth: "130px" }}>
                {setInfo.title ? (
                    <Badge colorPalette={setColor} variant="solid" size="sm">
                        {setInfo.title}
                    </Badge>
                ) : (
                    <Text fontSize="xs" color="fg.muted">Chưa phân bộ</Text>
                )}
            </td>
            <td style={{ padding: "12px 12px" }}>
                <Flex gap={1}>
                    {editing ? (
                        <>
                            <IconButton size="xs" colorPalette="green" onClick={handleSave} loading={saving} aria-label="Lưu"><FiCheck /></IconButton>
                            <IconButton size="xs" variant="ghost" onClick={() => setEditing(false)} aria-label="Hủy"><FiX /></IconButton>
                        </>
                    ) : (
                        <>
                            <IconButton size="xs" variant="ghost" onClick={() => setEditing(true)} aria-label="Sửa"><FiEdit2 size={12} /></IconButton>
                            <IconButton size="xs" variant="ghost" colorPalette="red" onClick={() => onDelete(word)} aria-label="Xóa"><FiTrash2 size={12} /></IconButton>
                        </>
                    )}
                </Flex>
            </td>
        </tr>
    );
};

const GlobalVocabularyPage = () => {
    const navigate = useNavigate();
    const { updateWord, deleteWord } = useVocabularyStore();

    const [words, setWords] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);

    const loadData = useCallback(async (p, q) => {
        setLoading(true);
        try {
            const res = await getAllWords(p, PAGE_SIZE, q);
            setWords(res.data || []);
            setTotal(res.total || 0);
        } catch (err) {
            console.error("Lỗi khi tải danh sách từ vựng toàn cục:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData(page, search);
    }, [page, loadData]);

    const handleSearchChange = (val) => {
        setSearch(val);
        setPage(1);
        loadData(1, val);
    };

    const handleWordUpdate = async (word, updatedForm) => {
        const setId = word.setId?._id || word.setId;
        await updateWord(setId, word._id, updatedForm);
        loadData(page, search);
    };

    const handleWordDelete = async (word) => {
        if (!window.confirm(`Xóa từ "${word.english}"?`)) return;
        const setId = word.setId?._id || word.setId;
        await deleteWord(setId, word._id);
        loadData(page, search);
    };

    const totalPages = Math.ceil(total / PAGE_SIZE) || 1;
    const offset = (page - 1) * PAGE_SIZE;

    return (
        <BaseLayout>
            <Box maxW="1400px" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 4, md: 8 }}>
                {/* Header Navigation */}
                <Flex align="center" gap={3} mb={6}>
                    <Button variant="ghost" size="sm" onClick={() => navigate("/home")} gap={2}>
                        <FiArrowLeft /> Quay lại trang chủ
                    </Button>
                    <Text color="fg.muted">/</Text>
                    <Text fontWeight="semibold">Quản lý từ vựng</Text>
                </Flex>

                {/* Title + Action */}
                <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={3}>
                    <Box>
                        <Flex align="center" gap={3} mb={1}>
                            <Text fontSize="2xl" fontWeight="extrabold">Từ vựng của tôi</Text>
                            <Badge colorPalette="blue" size="lg">
                                {total} từ
                            </Badge>
                        </Flex>
                        <Text color="fg.muted" fontSize="sm">
                            Xem, chỉnh sửa, xóa và tìm kiếm nhanh toàn bộ từ vựng đã lưu không phân biệt bộ từ.
                        </Text>
                    </Box>
                </Flex>

                {/* Toolbar */}
                <Box mb={6} maxW="600px">
                    <Text fontSize="xs" fontWeight="600" color="fg.muted" mb={1}>Tìm kiếm từ vựng</Text>
                    <Flex align="center" bg="bg.input" borderWidth="1px" borderColor="border.muted" borderRadius="xl" px={3} py={1.5}>
                        <FiSearch size={16} style={{ marginRight: "8px", opacity: 0.5 }} />
                        <Input
                            variant="unstyled"
                            placeholder="Nhập từ tiếng Anh, phiên âm, hoặc nghĩa tiếng Việt cần tìm..."
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

                {/* Word Table Content */}
                {loading ? (
                    <Flex justify="center" align="center" py={20}>
                        <Spinner size="xl" colorPalette="blue" />
                    </Flex>
                ) : words.length === 0 ? (
                    <Flex direction="column" align="center" py={16} gap={3} color="fg.muted">
                        <Text fontSize="4xl">📭</Text>
                        <Text fontWeight="bold">Chưa có từ vựng nào hoặc không tìm thấy từ vựng tương ứng.</Text>
                        <Text fontSize="xs" color="fg.subtle">Hãy tạo các bộ từ và thêm từ mới để bắt đầu học tập.</Text>
                    </Flex>
                ) : (
                    <Box borderWidth="1px" borderColor="border.muted" borderRadius="xl" overflow="hidden" bg="bg.panel">
                        <Box overflowX="auto">
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr>
                                        {["#", "English", "Vietnamese", "Phiên âm", "Từ loại", "Ví dụ", "Bộ từ", ""].map((h) => (
                                            <th key={h} style={{
                                                padding: "12px",
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
                                            }}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {words.map((word, idx) => (
                                        <GlobalWordRow
                                            key={word._id}
                                            word={word}
                                            index={offset + idx}
                                            onUpdate={handleWordUpdate}
                                            onDelete={handleWordDelete}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </Box>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <Flex
                                align="center" justify="space-between"
                                px={4} py={3}
                                borderTop="1px solid"
                                borderColor="border.muted"
                                bg="bg.subtle"
                            >
                                <Text fontSize="sm" color="fg.muted">
                                    Hiển thị <strong>{offset + 1}–{Math.min(offset + PAGE_SIZE, total)}</strong> / {total} từ
                                </Text>

                                <Flex align="center" gap={2}>
                                    <IconButton
                                        size="sm" variant="ghost"
                                        disabled={page === 1}
                                        onClick={() => setPage((p) => p - 1)}
                                        aria-label="Trang trước"
                                    >
                                        <FiChevronLeft />
                                    </IconButton>

                                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                                        .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                                        .reduce((acc, p, i, arr) => {
                                            if (i > 0 && p - arr[i - 1] > 1) acc.push("...");
                                            acc.push(p);
                                            return acc;
                                        }, [])
                                        .map((p, i) =>
                                            p === "..." ? (
                                                <Text key={`dot-${i}`} fontSize="sm" color="fg.muted" px={1}>…</Text>
                                            ) : (
                                                <Button
                                                    key={p}
                                                    size="sm"
                                                    variant={p === page ? "solid" : "ghost"}
                                                    colorPalette={p === page ? "blue" : "gray"}
                                                    onClick={() => setPage(p)}
                                                    minW="32px"
                                                >
                                                    {p}
                                                </Button>
                                            )
                                        )}

                                    <IconButton
                                        size="sm" variant="ghost"
                                        disabled={page === totalPages}
                                        onClick={() => setPage((p) => p + 1)}
                                        aria-label="Trang sau"
                                    >
                                        <FiChevronRight />
                                    </IconButton>
                                </Flex>
                            </Flex>
                        )}
                    </Box>
                )}
            </Box>
        </BaseLayout>
    );
};

export default GlobalVocabularyPage;
