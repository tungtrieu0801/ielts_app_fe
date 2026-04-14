import React, { useEffect, useState, useMemo } from "react";
import { Box, Flex, Text, Button, Badge, Spinner, Input, Select } from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import { FiDownload, FiArrowLeft, FiPlay, FiUpload, FiSearch } from "react-icons/fi";
import BaseLayout from "../../../layouts/BaseLayout.jsx";
import { useVocabularyStore } from "../../../stores/useVocabularyStore.js";
import FileUpload from "../components/FileUpload.jsx";
import ImportPreviewTable from "../components/ImportPreviewTable.jsx";
import WordTable from "../components/WordTable.jsx";

const VocabularyPage = () => {
    const { setId } = useParams();
    const navigate = useNavigate();

    const { wordSets, words, loading, fetchWordSets, fetchWords, bulkSaveWords } = useVocabularyStore();
    const [previewHeaders, setPreviewHeaders] = useState([]);
    const [previewRows, setPreviewRows] = useState([]);
    const [showUpload, setShowUpload] = useState(false);
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
        </BaseLayout>
    );
};

export default VocabularyPage;