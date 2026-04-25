import React, { useEffect, useState, useMemo } from "react";
import { Box, Flex, Text, Button, Badge, Spinner, Input, Select, SimpleGrid, Textarea } from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import { FiDownload, FiArrowLeft, FiPlay, FiUpload, FiSearch, FiPlus } from "react-icons/fi";
import BaseLayout from "../../../layouts/BaseLayout.jsx";
import { useVocabularyStore } from "../../../stores/useVocabularyStore.js";
import FileUpload from "../components/FileUpload.jsx";
import ImportPreviewTable from "../components/ImportPreviewTable.jsx";
import WordTable from "../components/WordTable.jsx";

// ── Modal thêm từ thủ công ────────────────────────────────────────────────────
const AddWordModal = ({ onClose, onAdd }) => {
    const [word, setWord] = useState({
        english: "",
        vietnamese: "",
        pronunciation: "",
        partOfSpeech: "",
        example: "",
        exampleTranslation: "",
        synonyms: "", // Nhập cách nhau bằng dấu phẩy
        antonyms: "",  // Nhập cách nhau bằng dấu phẩy
        note: ""
    });
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!word.english.trim() || !word.vietnamese.trim()) return;
        setSaving(true);
        try {
            // Chuyển synonyms/antonyms từ chuỗi thành mảng
            const payload = {
                ...word,
                synonyms: word.synonyms ? word.synonyms.split(",").map(s => s.trim()) : [],
                antonyms: word.antonyms ? word.antonyms.split(",").map(a => a.trim()) : []
            };
            await onAdd(payload);
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
                bg="bg.panel" borderRadius="2xl" p={8} w="full" maxW="650px"
                mx={4} shadow="2xl" onClick={(e) => e.stopPropagation()}
                maxH="90vh" overflowY="auto"
            >
                <Text fontSize="xl" fontWeight="bold" mb={6}>Thêm từ vựng mới</Text>

                <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} mb={4}>
                    <Box>
                        <Text fontSize="xs" fontWeight="bold" mb={1}>Tiếng Anh *</Text>
                        <Input
                            placeholder="VD: Magnificent"
                            value={word.english}
                            onChange={(e) => setWord({ ...word, english: e.target.value })}
                            autoFocus
                        />
                    </Box>
                    <Box>
                        <Text fontSize="xs" fontWeight="bold" mb={1}>Phiên âm</Text>
                        <Input
                            placeholder="/mæɡˈnɪf.ɪ.sənt/"
                            value={word.pronunciation}
                            onChange={(e) => setWord({ ...word, pronunciation: e.target.value })}
                        />
                    </Box>
                    <Box>
                        <Text fontSize="xs" fontWeight="bold" mb={1}>Nghĩa tiếng Việt *</Text>
                        <Input
                            placeholder="VD: Tráng lệ, lộng lẫy"
                            value={word.vietnamese}
                            onChange={(e) => setWord({ ...word, vietnamese: e.target.value })}
                        />
                    </Box>
                    <Box>
                        <Text fontSize="xs" fontWeight="bold" mb={1}>Loại từ (Part of Speech)</Text>
                        <Input
                            placeholder="VD: adjective, verb, noun..."
                            value={word.partOfSpeech}
                            onChange={(e) => setWord({ ...word, partOfSpeech: e.target.value })}
                        />
                    </Box>
                </SimpleGrid>

                <Box mb={4}>
                    <Text fontSize="xs" fontWeight="bold" mb={1}>Ví dụ (English)</Text>
                    <Textarea
                        placeholder="The palace is truly magnificent."
                        value={word.example}
                        onChange={(e) => setWord({ ...word, example: e.target.value })}
                        rows={2} resize="none"
                    />
                </Box>

                <Box mb={4}>
                    <Text fontSize="xs" fontWeight="bold" mb={1}>Dịch ví dụ (Vietnamese)</Text>
                    <Textarea
                        placeholder="Cung điện thật sự tráng lệ."
                        value={word.exampleTranslation}
                        onChange={(e) => setWord({ ...word, exampleTranslation: e.target.value })}
                        rows={2} resize="none"
                    />
                </Box>

                <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} mb={6}>
                    <Box>
                        <Text fontSize="xs" fontWeight="bold" mb={1}>Từ đồng nghĩa (Cách nhau bằng dấu phẩy)</Text>
                        <Input
                            placeholder="splendid, glorious..."
                            value={word.synonyms}
                            onChange={(e) => setWord({ ...word, synonyms: e.target.value })}
                        />
                    </Box>
                    <Box>
                        <Text fontSize="xs" fontWeight="bold" mb={1}>Từ trái nghĩa (Cách nhau bằng dấu phẩy)</Text>
                        <Input
                            placeholder="modest, simple..."
                            value={word.antonyms}
                            onChange={(e) => setWord({ ...word, antonyms: e.target.value })}
                        />
                    </Box>
                </SimpleGrid>

                <Flex gap={3} justify="flex-end">
                    <Button variant="ghost" onClick={onClose}>Hủy</Button>
                    <Button
                        colorPalette="green" onClick={handleSave}
                        loading={saving} disabled={!word.english.trim() || !word.vietnamese.trim()}
                    >
                        Thêm vào bộ từ
                    </Button>
                </Flex>
            </Box>
        </Box>
    );
};

const VocabularyPage = () => {
    const { setId } = useParams();
    const navigate = useNavigate();

    const {
        wordSets, words, loading,
        fetchWordSets, fetchWords, bulkSaveWords, addWord
    } = useVocabularyStore();

    const [previewHeaders, setPreviewHeaders] = useState([]);
    const [previewRows, setPreviewRows] = useState([]);
    const [showUpload, setShowUpload] = useState(false);
    const [showAddManual, setShowAddManual] = useState(false);
    const [saveResult, setSaveResult] = useState(null);
    const [search, setSearch] = useState("");
    const [filterSet, setFilterSet] = useState(setId || "");

    const currentSet = wordSets.find((s) => s._id === (filterSet || setId));

    useEffect(() => {
        if (!wordSets.length) fetchWordSets();
    }, []);

    // Khi filter set thay đổi → fetch từ của set đó
    useEffect(() => {
        if (filterSet) fetchWords(filterSet);
    }, [filterSet]);

    // Đồng bộ khi param thay đổi
    useEffect(() => {
        if (setId && setId !== filterSet) setFilterSet(setId);
    }, [setId]);

    // Filter từ theo search
    const filteredWords = useMemo(() => {
        if (!search.trim()) return words;
        const q = search.toLowerCase();
        return words.filter((w) =>
            w.english?.toLowerCase().includes(q) ||
            w.vietnamese?.toLowerCase().includes(q) ||
            w.example?.toLowerCase().includes(q)
        );
    }, [words, search]);

    const handleFileParsed = (headers, rows) => {
        setPreviewHeaders(headers);
        setPreviewRows(rows);
        setShowUpload(false);
        setSaveResult(null);
    };

    const handleConfirmImport = async (validRows) => {
        const result = await bulkSaveWords(filterSet, validRows);
        setSaveResult(result);
        setPreviewHeaders([]);
        setPreviewRows([]);
    };

    const handleCancelPreview = () => {
        setPreviewHeaders([]);
        setPreviewRows([]);
        setSaveResult(null);
    };

    const handleSetChange = (newSetId) => {
        setFilterSet(newSetId);
        setSearch("");
        setSaveResult(null);
        navigate(`/sets/${newSetId}`, { replace: true });
    };

    return (
        <BaseLayout>
            <Box maxW="1400px" mx="auto">
                {/* Header Navigation */}
                <Flex align="center" gap={3} mb={6}>
                    <Button variant="ghost" size="sm" onClick={() => navigate("/sets")} gap={2}>
                        <FiArrowLeft /> Quay lại
                    </Button>
                    <Text color="fg.muted">/</Text>
                    <Text fontWeight="semibold">{currentSet?.title || "..."}</Text>
                </Flex>

                {/* Title + Actions */}
                <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={3}>
                    <Box>
                        <Flex align="center" gap={3} mb={1}>
                            <Text fontSize="2xl" fontWeight="extrabold">{currentSet?.title || "Bộ từ"}</Text>
                            <Badge colorPalette={currentSet?.color || "blue"} size="lg">
                                {filteredWords.length}{search ? ` / ${words.length}` : ""} từ
                            </Badge>
                        </Flex>
                        {currentSet?.description && (
                            <Text color="fg.muted" fontSize="sm">{currentSet.description}</Text>
                        )}
                    </Box>
                    <Flex gap={2} flexWrap="wrap">
                        <Button
                            as="a"
                            href="/vocabulary_sample.xlsx"
                            download="vocabulary_sample.xlsx"
                            variant="ghost" size="sm" gap={2} colorPalette="green"
                        >
                            <FiDownload size={14} /> Tải file mẫu
                        </Button>
                        <Button
                            variant="outline" size="sm" gap={2}
                            onClick={() => setShowUpload((v) => !v)}
                        >
                            <FiUpload size={14} /> Import Excel
                        </Button>
                        <Button
                            colorPalette="blue" size="sm" gap={2}
                            onClick={() => setShowAddManual(true)}
                        >
                            <FiPlus size={14} /> Thêm từ thủ công
                        </Button>
                        <Button
                            colorPalette="green" size="sm" gap={2}
                            onClick={() => navigate(`/study/${filterSet || setId}`)}
                        >
                            <FiPlay size={14} /> Học ngay
                        </Button>
                    </Flex>
                </Flex>

                {/* ── Toolbar: Filter + Search ── */}
                <Flex gap={3} mb={5} flexWrap="wrap">
                    {/* Bộ lọc theo bộ từ */}
                    <Box minW="200px" flex="0 0 auto">
                        <Text fontSize="xs" fontWeight="600" color="fg.muted" mb={1}>Bộ từ</Text>
                        <select
                            value={filterSet}
                            onChange={(e) => handleSetChange(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "7px 12px",
                                borderRadius: "10px",
                                border: "1px solid var(--chakra-colors-border-muted)",
                                background: "var(--chakra-colors-bg-panel)",
                                color: "var(--chakra-colors-fg)",
                                fontSize: "14px",
                                cursor: "pointer",
                                outline: "none",
                            }}
                        >
                            <option value="" disabled>Chọn bộ từ...</option>
                            {wordSets.map((ws) => (
                                <option key={ws._id} value={ws._id}>{ws.title}</option>
                            ))}
                        </select>
                    </Box>

                    {/* Tìm kiếm từ vựng */}
                    <Box flex="1" minW="180px">
                        <Text fontSize="xs" fontWeight="600" color="fg.muted" mb={1}>Tìm kiếm</Text>
                        <Box position="relative">
                            <Box
                                position="absolute" left={3} top="50%" transform="translateY(-50%)"
                                color="fg.subtle" pointerEvents="none"
                            >
                                <FiSearch size={14} />
                            </Box>
                            <Input
                                pl={9}
                                placeholder="English, nghĩa hoặc ví dụ..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                borderRadius="xl"
                                fontSize="sm"
                                size="sm"
                                h="36px"
                                bg="bg.input"
                                borderColor="border.muted"
                                _focus={{ borderColor: "brand.solid", shadow: "none" }}
                            />
                        </Box>
                    </Box>
                </Flex>

                {/* Save Result */}
                {saveResult && (
                    <Box bg="success.bg" borderRadius="xl" p={4} mb={4} borderWidth="1px" borderColor="green.200">
                        <Text color="success.text" fontWeight="semibold">
                            ✅ Import thành công {saveResult.imported} từ
                            {saveResult.skipped > 0 && ` (bỏ qua ${saveResult.skipped} từ lỗi)`}
                        </Text>
                    </Box>
                )}

                {/* File Upload Zone */}
                {showUpload && <Box mb={6}><FileUpload onFileProcessed={handleFileParsed} /></Box>}

                {/* Import Preview Table */}
                {previewRows.length > 0 && (
                    <ImportPreviewTable
                        headers={previewHeaders}
                        rows={previewRows}
                        onConfirm={handleConfirmImport}
                        onCancel={handleCancelPreview}
                    />
                )}

                {/* Word Table */}
                <Box mt={previewRows.length > 0 ? 8 : 0}>
                    {previewRows.length === 0 && (
                        <Flex justify="space-between" align="center" mb={4}>
                            <Text fontWeight="bold" fontSize="lg">Danh sách từ vựng</Text>
                            {search && (
                                <Text fontSize="sm" color="fg.muted">
                                    Tìm thấy <strong>{filteredWords.length}</strong> kết quả
                                </Text>
                            )}
                        </Flex>
                    )}
                    <WordTable words={filteredWords} setId={filterSet || setId} loading={loading} />
                </Box>
            </Box>

            {showAddManual && (
                <AddWordModal
                    onClose={() => setShowAddManual(false)}
                    onAdd={(wordData) => addWord(filterSet || setId, wordData)}
                />
            )}
        </BaseLayout>
    );
};

export default VocabularyPage;