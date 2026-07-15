import React, { useState, useEffect, useRef, useCallback } from "react";
import { Box, Flex, Text, Button, Input, Spinner, IconButton } from "@chakra-ui/react";
import { FiChevronLeft, FiChevronRight, FiArrowLeft, FiSave } from "react-icons/fi";
import { useParams, useNavigate } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import BaseLayout from "../../layouts/BaseLayout.jsx";
import { getBookDetails, updateBookProgress } from "../../services/bookApi.js";
import { useVocabularyStore } from "../../stores/useVocabularyStore.js";

// Initialize worker — use CDN to avoid Vite path resolution issues
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

const PdfReaderPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [book, setBook] = useState(null);
    const [wordSetId, setWordSetId] = useState(null);
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savingWord, setSavingWord] = useState(false);

    // For text selection popup — use fixed screen coordinates
    const [tooltip, setTooltip] = useState({ text: "", x: 0, y: 0, visible: false });
    const [showWordForm, setShowWordForm] = useState(false);
    const [wordFormPos, setWordFormPos] = useState({ x: 0, y: 0 });
    const [wordData, setWordData] = useState({ english: "", vietnamese: "" });

    const addWord = useVocabularyStore((state) => state.addWord);

    useEffect(() => {
        fetchBookDetails();
    }, [id]);

    const fetchBookDetails = async () => {
        try {
            setLoading(true);
            const data = await getBookDetails(id);
            setBook(data.book);
            setPageNumber(data.progress?.currentPage || 1);
            setWordSetId(data.progress?.wordSetId);
        } catch (error) {
            console.error("Lỗi khi tải chi tiết sách", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProgress = async (newPage) => {
        const pageToSave = newPage || pageNumber;
        try {
            setSaving(true);
            await updateBookProgress(id, pageToSave);
        } catch (error) {
            console.error("Lỗi lưu tiến trình", error);
        } finally {
            setSaving(false);
        }
    };

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    const changePage = (offset) => {
        const newPage = pageNumber + offset;
        if (newPage >= 1 && newPage <= numPages) {
            setPageNumber(newPage);
            handleSaveProgress(newPage);
        }
    };

    const handlePageInput = (e) => {
        const val = parseInt(e.target.value);
        if (val && val >= 1 && val <= numPages) {
            setPageNumber(val);
            handleSaveProgress(val);
        }
    };

    // Handle text selection — use fixed coordinates from viewport
    const handleMouseUp = useCallback((e) => {
        // Small delay to ensure selection is finalized
        setTimeout(() => {
            const sel = window.getSelection();
            const text = sel?.toString().trim();

            if (!text || text.length === 0 || text.length > 80) {
                if (!showWordForm) setTooltip((t) => ({ ...t, visible: false }));
                return;
            }

            try {
                const range = sel.getRangeAt(0);
                const rect = range.getBoundingClientRect();

                if (rect.width === 0 && rect.height === 0) return;

                // Use fixed viewport coordinates — avoids all container offset issues
                setTooltip({
                    text,
                    x: rect.left + rect.width / 2,
                    y: rect.top - 10, // 10px above the selection
                    visible: true,
                });
            } catch (err) {
                // Selection might not have a range
            }
        }, 10);
    }, [showWordForm]);

    useEffect(() => {
        document.addEventListener("mouseup", handleMouseUp);
        return () => {
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, [handleMouseUp]);

    // Close tooltip/form when clicking elsewhere
    const handleDocumentClick = useCallback((e) => {
        // Only close if not clicking on the tooltip or form
        if (!e.target.closest("[data-word-popup]")) {
            setTooltip((t) => ({ ...t, visible: false }));
            setShowWordForm(false);
        }
    }, []);

    useEffect(() => {
        document.addEventListener("mousedown", handleDocumentClick);
        return () => {
            document.removeEventListener("mousedown", handleDocumentClick);
        };
    }, [handleDocumentClick]);

    const handleAddWordClick = () => {
        setWordData({ english: tooltip.text, vietnamese: "" });
        setWordFormPos({ x: tooltip.x, y: tooltip.y });
        setTooltip((t) => ({ ...t, visible: false }));
        setShowWordForm(true);
    };

    const handleSaveWord = async () => {
        if (!wordData.english || !wordData.vietnamese) return;
        try {
            setSavingWord(true);
            await addWord(wordSetId, wordData);
            setShowWordForm(false);
            setWordData({ english: "", vietnamese: "" });
            window.getSelection()?.removeAllRanges();
        } catch (error) {
            console.error("Lỗi khi lưu từ", error);
            alert("Lưu từ thất bại, vui lòng thử lại!");
        } finally {
            setSavingWord(false);
        }
    };

    if (loading) {
        return (
            <BaseLayout>
                <Flex justify="center" align="center" h="50vh">
                    <Spinner size="xl" />
                </Flex>
            </BaseLayout>
        );
    }

    if (!book) {
        return (
            <BaseLayout>
                <Text>Không tìm thấy sách</Text>
            </BaseLayout>
        );
    }

    return (
        <BaseLayout>
            <Box maxW="1000px" mx="auto">
                {/* Header */}
                <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
                    <Flex align="center" gap={4}>
                        <IconButton aria-label="Back" variant="ghost" onClick={() => navigate("/library")}>
                            <FiArrowLeft />
                        </IconButton>
                        <Box>
                            <Text fontSize="xl" fontWeight="bold">{book.title}</Text>
                        </Box>
                    </Flex>
                    <Flex align="center" gap={3}>
                        <Button onClick={() => changePage(-1)} disabled={pageNumber <= 1} size="sm">
                            <FiChevronLeft /> Trước
                        </Button>
                        <Flex align="center" gap={2}>
                            <Input
                                type="number"
                                value={pageNumber}
                                onChange={(e) => setPageNumber(parseInt(e.target.value) || pageNumber)}
                                onBlur={handlePageInput}
                                w="60px"
                                size="sm"
                                textAlign="center"
                            />
                            <Text fontSize="sm" color="fg.muted">/ {numPages || "--"}</Text>
                        </Flex>
                        <Button onClick={() => changePage(1)} disabled={pageNumber >= numPages} size="sm">
                            Sau <FiChevronRight />
                        </Button>
                        <Button
                            colorPalette="blue"
                            variant="outline"
                            size="sm"
                            onClick={() => handleSaveProgress()}
                            loading={saving}
                            gap={2}
                        >
                            <FiSave /> Lưu
                        </Button>
                    </Flex>
                </Flex>

                {/* PDF Viewer */}
                <Box
                    bg="bg.panel"
                    p={4}
                    borderRadius="2xl"
                    borderWidth="1px"
                    borderColor="border.muted"
                    display="flex"
                    justifyContent="center"
                    position="relative"
                    minH="70vh"
                    boxShadow="sm"
                    overflow="auto"
                >
                    <Document
                        file={`http://localhost:5000${book.fileUrl}`}
                        onLoadSuccess={onDocumentLoadSuccess}
                        loading={<Flex h="50vh" align="center" justify="center"><Spinner size="xl" /></Flex>}
                    >
                        <Page
                            pageNumber={pageNumber}
                            renderTextLayer={true}
                            renderAnnotationLayer={true}
                            width={Math.min(window.innerWidth * 0.8, 800)}
                        />
                    </Document>
                </Box>
            </Box>

            {/* ── Tooltip (fixed to viewport) ── */}
            {tooltip.visible && !showWordForm && (
                <Box
                    data-word-popup="true"
                    position="fixed"
                    left={`${tooltip.x}px`}
                    top={`${tooltip.y}px`}
                    transform="translate(-50%, -100%)"
                    zIndex={9999}
                    bg="blue.600"
                    color="white"
                    px={3}
                    py={2}
                    borderRadius="lg"
                    shadow="xl"
                    cursor="pointer"
                    onClick={handleAddWordClick}
                    _hover={{ bg: "blue.500" }}
                    whiteSpace="nowrap"
                    userSelect="none"
                    pointerEvents="auto"
                >
                    <Text fontWeight="bold" fontSize="sm">📖 Thêm từ: "{tooltip.text}"</Text>
                </Box>
            )}

            {/* ── Word Form (fixed to viewport) ── */}
            {showWordForm && (
                <>
                    {/* Backdrop */}
                    <Box
                        position="fixed"
                        inset={0}
                        zIndex={9998}
                        onClick={() => setShowWordForm(false)}
                    />
                    <Box
                        data-word-popup="true"
                        position="fixed"
                        left={`${Math.min(wordFormPos.x, window.innerWidth - 280)}px`}
                        top={`${Math.max(wordFormPos.y - 130, 60)}px`}
                        zIndex={9999}
                        bg="bg.panel"
                        p={4}
                        borderRadius="xl"
                        shadow="2xl"
                        borderWidth="1px"
                        borderColor="border.muted"
                        w="270px"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Text fontSize="sm" fontWeight="bold" mb={3}>💾 Lưu vào bộ từ sách</Text>
                        <Text fontSize="xs" fontWeight="600" color="fg.muted" mb={1}>Từ tiếng Anh</Text>
                        <Input
                            size="sm"
                            mb={3}
                            value={wordData.english}
                            onChange={(e) => setWordData({ ...wordData, english: e.target.value })}
                            placeholder="VD: magnificent"
                        />
                        <Text fontSize="xs" fontWeight="600" color="fg.muted" mb={1}>Nghĩa tiếng Việt</Text>
                        <Input
                            size="sm"
                            mb={4}
                            value={wordData.vietnamese}
                            onChange={(e) => setWordData({ ...wordData, vietnamese: e.target.value })}
                            placeholder="VD: tráng lệ, hùng vĩ"
                            autoFocus
                        />
                        <Flex justify="flex-end" gap={2}>
                            <Button size="xs" variant="ghost" onClick={() => setShowWordForm(false)}>Hủy</Button>
                            <Button
                                size="xs"
                                colorPalette="blue"
                                onClick={handleSaveWord}
                                disabled={!wordData.english || !wordData.vietnamese}
                                loading={savingWord}
                            >
                                Lưu từ
                            </Button>
                        </Flex>
                    </Box>
                </>
            )}
        </BaseLayout>
    );
};

export default PdfReaderPage;
