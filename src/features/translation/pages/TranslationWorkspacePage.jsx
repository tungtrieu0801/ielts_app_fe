import React, { useState, useEffect, useCallback, useRef } from "react";
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
    Table
} from "@chakra-ui/react";
import {
    FiArrowLeft,
    FiChevronLeft,
    FiChevronRight,
    FiSave,
    FiPlus,
    FiTrash2,
    FiDownload,
    FiCheckCircle,
    FiFileText,
    FiBookOpen,
    FiVolume2,
    FiHelpCircle,
    FiEdit3
} from "react-icons/fi";
import { useParams, useNavigate } from "react-router-dom";
import ExcelJS from "exceljs";
import {
    getTranslationSessionById,
    updateTranslationSession,
    lookupWordApi
} from "../../../services/translationApi.js";

const TranslationWorkspacePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [session, setSession] = useState(null);

    // Active sentence index
    const [currentIdx, setCurrentIdx] = useState(0);

    // Form inputs for current sentence
    const [roughTrans, setRoughTrans] = useState("");
    const [polishedTrans, setPolishedTrans] = useState("");
    const [sentenceNotes, setSentenceNotes] = useState("");

    // Global session states
    const [vocabList, setVocabList] = useState([]);
    const [grammarNotes, setGrammarNotes] = useState("");

    // Quick add inline vocab state
    const [quickEn, setQuickEn] = useState("");
    const [quickVi, setQuickVi] = useState("");

    // Dictionary Pop-up state: { x, y, word, loading, meaning, meanings }
    const [dictPopup, setDictPopup] = useState(null);
    const popupRef = useRef(null);

    // Fetch session data on mount
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const res = await getTranslationSessionById(id);
                const s = res.session;
                setSession(s);
                setCurrentIdx(s.currentIdx || 0);
                setVocabList(s.vocab || []);
                setGrammarNotes(s.grammarNotes || "");

                // Initialize current sentence fields
                if (s.sentences && s.sentences[s.currentIdx || 0]) {
                    const cur = s.sentences[s.currentIdx || 0];
                    setRoughTrans(cur.roughTranslation || "");
                    setPolishedTrans(cur.polishedTranslation || "");
                    setSentenceNotes(cur.notes || "");
                }
            } catch (err) {
                console.error("Failed to load translation session:", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    // Save active sentence fields to local session state when currentIdx changes
    const syncCurrentSentenceToState = useCallback((targetIdx) => {
        if (!session || !session.sentences) return;
        const updatedSentences = [...session.sentences];
        updatedSentences[currentIdx] = {
            ...updatedSentences[currentIdx],
            roughTranslation: roughTrans,
            polishedTranslation: polishedTrans,
            notes: sentenceNotes
        };
        setSession((prev) => ({ ...prev, sentences: updatedSentences }));

        // Load new target sentence fields
        if (updatedSentences[targetIdx]) {
            const nextCur = updatedSentences[targetIdx];
            setRoughTrans(nextCur.roughTranslation || "");
            setPolishedTrans(nextCur.polishedTranslation || "");
            setSentenceNotes(nextCur.notes || "");
        }
    }, [session, currentIdx, roughTrans, polishedTrans, sentenceNotes]);

    // Trigger explicit save to Backend
    const handleSave = async (overrides = {}) => {
        if (!session) return;
        setSaving(true);

        // Build updated sentences array
        const updatedSentences = [...session.sentences];
        updatedSentences[currentIdx] = {
            ...updatedSentences[currentIdx],
            roughTranslation: roughTrans,
            polishedTranslation: polishedTrans,
            notes: sentenceNotes
        };

        const payload = {
            currentIdx: overrides.currentIdx !== undefined ? overrides.currentIdx : currentIdx,
            sentences: updatedSentences,
            vocab: overrides.vocab !== undefined ? overrides.vocab : vocabList,
            grammarNotes: overrides.grammarNotes !== undefined ? overrides.grammarNotes : grammarNotes,
            status: overrides.status !== undefined ? overrides.status : session.status
        };

        try {
            const res = await updateTranslationSession(session._id, payload);
            setSession(res.session);
        } catch (err) {
            console.error("Error saving progress:", err);
        } finally {
            setSaving(false);
        }
    };

    // Sentence navigation handlers
    const handleNext = async () => {
        if (!session || currentIdx >= session.sentences.length - 1) return;
        const nextIdx = currentIdx + 1;
        syncCurrentSentenceToState(nextIdx);
        setCurrentIdx(nextIdx);
        await handleSave({ currentIdx: nextIdx });
    };

    const handlePrev = async () => {
        if (!session || currentIdx <= 0) return;
        const prevIdx = currentIdx - 1;
        syncCurrentSentenceToState(prevIdx);
        setCurrentIdx(prevIdx);
        await handleSave({ currentIdx: prevIdx });
    };

    const handleMarkComplete = async () => {
        await handleSave({ status: "completed" });
        alert("Đã đánh dấu hoàn thành bài dịch! Bạn có thể xuất file Excel để ôn tập.");
    };

    // Dictionary popup close listener
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (popupRef.current && !popupRef.current.contains(e.target)) {
                setDictPopup(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Multi-tiered Vietnamese translation resolver to prevent HTTP 429 rate limits
    const fetchVietnameseMeaning = async (cleanWord, fetchWithTimeout) => {
        const encoded = encodeURIComponent(cleanWord);

        // 1. Google GTX API
        try {
            const res = await fetchWithTimeout(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encoded}`, 2000);
            if (res?.[0]) {
                const fullTranslation = res[0].map(item => item?.[0] || "").join("").trim();
                if (fullTranslation) return fullTranslation;
            }
        } catch (e) {}

        // 2. Google Clients5 API
        try {
            const res = await fetchWithTimeout(`https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=en&tl=vi&q=${encoded}`, 2000);
            if (typeof res === "string" && res) return res;
            if (Array.isArray(res) && typeof res[0] === "string") return res[0];
            if (Array.isArray(res) && Array.isArray(res[0]) && res[0][0]) return res[0][0];
        } catch (e) {}

        // 3. MyMemory Free API
        try {
            const res = await fetchWithTimeout(`https://api.mymemory.translated.net/get?q=${encoded}&langpair=en|vi`, 2000);
            if (res?.responseData?.translatedText && !res.responseData.translatedText.includes("MYMEMORY WARNING")) {
                return res.responseData.translatedText;
            }
        } catch (e) {}

        // 4. Backend fallback API (uses server-side google-translate-api-x)
        try {
            const res = await lookupWordApi(cleanWord);
            if (res?.translation) return res.translation;
        } catch (e) {}

        return "";
    };

    // Interactive word or phrase lookup logic
    const handleWordLookup = useCallback(async (wordStr, event) => {
        // Preserve spaces between words when highlighting phrases or lines
        const cleanWord = wordStr.replace(/[^\w\s-']/g, "").replace(/\s+/g, " ").trim().toLowerCase();
        if (!cleanWord) return;

        const rect = event.currentTarget ? event.currentTarget.getBoundingClientRect() : { left: event.clientX, bottom: event.clientY };
        setDictPopup({
            x: Math.min(rect.left || event.clientX, window.innerWidth - 350),
            y: (rect.bottom || event.clientY) + 8,
            word: cleanWord,
            loading: true,
            meaning: ""
        });

        const fetchWithTimeout = async (url, timeoutMs = 2500) => {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), timeoutMs);
            try {
                const res = await fetch(url, { signal: controller.signal });
                clearTimeout(timer);
                if (!res.ok) return null;
                return await res.json();
            } catch (err) {
                clearTimeout(timer);
                return null;
            }
        };

        try {
            const [meaningVi, dmVal] = await Promise.all([
                fetchVietnameseMeaning(cleanWord, fetchWithTimeout),
                fetchWithTimeout(`https://api.datamuse.com/words?sp=${encodeURIComponent(cleanWord)}&md=d`, 2500)
            ]);

            const dmDataRaw = dmVal;

            let meanings = [];
            if (Array.isArray(dmDataRaw) && dmDataRaw.length > 0 && dmDataRaw[0].defs) {
                const posMap = { v: "verb", n: "noun", adj: "adjective", adv: "adverb" };
                const meaningsMap = {};
                dmDataRaw[0].defs.forEach((defStr) => {
                    const parts = defStr.split("\t");
                    const posKey = parts[0] || "definition";
                    const posName = posMap[posKey] || posKey;
                    const text = parts[1] || parts[0];
                    if (!meaningsMap[posName]) meaningsMap[posName] = [];
                    meaningsMap[posName].push({ definition: text });
                });
                meanings = Object.keys(meaningsMap).map((pos) => ({
                    partOfSpeech: pos,
                    definitions: meaningsMap[pos]
                }));
            }

            setDictPopup((p) =>
                p?.word === cleanWord
                    ? {
                          ...p,
                          loading: false,
                          meaning: meaningVi || "Không tìm thấy nghĩa",
                          meanings
                      }
                    : p
            );
        } catch (err) {
            setDictPopup((p) =>
                p?.word === cleanWord ? { ...p, loading: false, meaning: "Không thể tải nghĩa từ" } : p
            );
        }
    }, []);

    // Text selection lookup on mouseup (supports multi-word phrases and whole lines)
    const handleTextSelection = (e) => {
        const selection = window.getSelection();
        const selectedText = selection ? selection.toString().trim() : "";
        if (selectedText && selectedText.length > 0 && selectedText.length < 500) {
            handleWordLookup(selectedText, e);
        }
    };

    // Vocab List actions
    const handleAddVocab = async (enWord, viWord) => {
        if (!enWord || !enWord.trim()) return;
        const newVocab = [...vocabList, { english: enWord.trim(), vietnamese: viWord ? viWord.trim() : "" }];
        setVocabList(newVocab);
        setDictPopup(null);
        setQuickEn("");
        setQuickVi("");
        await handleSave({ vocab: newVocab });
    };

    const handleDeleteVocab = async (index) => {
        const newVocab = vocabList.filter((_, idx) => idx !== index);
        setVocabList(newVocab);
        await handleSave({ vocab: newVocab });
    };

    // TTS Audio playback for English word
    const speakWord = (word) => {
        if (!("speechSynthesis" in window)) return;
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(word);
        u.lang = "en-US";
        u.rate = 0.9;
        window.speechSynthesis.speak(u);
    };

    // Excel Export 1: Export Vocab Notes
    const exportVocabXlsx = async () => {
        if (vocabList.length === 0) {
            alert("Bảng ghi chú từ vựng hiện đang trống!");
            return;
        }

        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet("Từ vựng bài dịch");

        ws.columns = [
            { header: "STT", key: "stt", width: 8 },
            { header: "Tiếng Anh", key: "english", width: 25 },
            { header: "Tiếng Việt", key: "vietnamese", width: 30 }
        ];

        const headerRow = ws.getRow(1);
        headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
        headerRow.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF319795" } // teal header
        };
        headerRow.alignment = { vertical: "middle", horizontal: "center" };

        vocabList.forEach((item, i) => {
            ws.addRow({
                stt: i + 1,
                english: item.english,
                vietnamese: item.vietnamese
            });
        });

        if (grammarNotes && grammarNotes.trim()) {
            ws.addRow({});
            const bannerRow = ws.addRow({ english: "📌 GHI CHÚ NGỮ PHÁP / COLLOCATION CỦA BÀI" });
            bannerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
            bannerRow.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FF805AD5" }
            };
            grammarNotes.split("\n").forEach((line) => {
                if (line.trim()) ws.addRow({ english: line });
            });
        }

        const buffer = await wb.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Tu_Vung_${session?.title || "Bai_Dich"}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Excel Export 2: Export Bilingual Document (Câu gốc | Bản dịch thô | Bản dịch chuẩn + Ghi chú ngữ pháp)
    const exportBilingualXlsx = async () => {
        if (!session || !session.sentences) return;

        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet("Bản dịch song ngữ");

        ws.columns = [
            { header: "STT", key: "stt", width: 8 },
            { header: "Câu gốc (English)", key: "original", width: 45 },
            { header: "Bản dịch thô (Grammar)", key: "rough", width: 45 },
            { header: "Bản dịch hoàn chỉnh (Vietnamese)", key: "polished", width: 45 },
            { header: "Ghi chú câu", key: "notes", width: 30 }
        ];

        const headerRow = ws.getRow(1);
        headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
        headerRow.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF2B6CB0" } // blue header
        };
        headerRow.alignment = { vertical: "middle", horizontal: "center" };

        session.sentences.forEach((st, i) => {
            ws.addRow({
                stt: i + 1,
                original: st.original,
                rough: i === currentIdx ? roughTrans : st.roughTranslation || "",
                polished: i === currentIdx ? polishedTrans : st.polishedTranslation || "",
                notes: i === currentIdx ? sentenceNotes : st.notes || ""
            });
        });

        // Add Grammar & Collocation notes at the bottom of sheet 1
        if (grammarNotes && grammarNotes.trim()) {
            ws.addRow({});
            const bannerRow = ws.addRow({ original: "📌 GHI CHÚ NGỮ PHÁP / COLLOCATION CỦA BÀI" });
            bannerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
            bannerRow.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FF805AD5" }
            };
            grammarNotes.split("\n").forEach((line) => {
                if (line.trim()) ws.addRow({ original: line });
            });

            // Sheet 2 dedicated for Grammar & Collocations
            const ws2 = wb.addWorksheet("Ghi chú Ngữ pháp & Collocation");
            ws2.columns = [{ header: "Ghi chú Ngữ pháp / Collocation", key: "note", width: 80 }];
            const h2 = ws2.getRow(1);
            h2.font = { bold: true, color: { argb: "FFFFFFFF" } };
            h2.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF805AD5" } };
            grammarNotes.split("\n").forEach((line) => {
                if (line.trim()) ws2.addRow({ note: line });
            });
        }

        const buffer = await wb.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Song_Ngu_${session?.title || "Bai_Dich"}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <Flex justify="center" align="center" minH="100vh" bg="bg.panel">
                <VStack gap={3}>
                    <Spinner size="xl" color="teal.500" />
                    <Text fontSize="md" fontWeight="600" color="fg.muted">
                        Đang tải bài luyện dịch...
                    </Text>
                </VStack>
            </Flex>
        );
    }

    if (!session) {
        return (
            <Flex justify="center" align="center" minH="100vh" direction="column" gap={4}>
                <Text fontSize="lg" fontWeight="700">
                    Không tìm thấy bài luyện dịch!
                </Text>
                <Button colorPalette="teal" onClick={() => navigate("/translation")}>
                    Quay lại danh sách
                </Button>
            </Flex>
        );
    }

    const currentSentence = session.sentences[currentIdx] || { original: "" };
    const totalSentences = session.sentences.length;
    const isCompleted = session.status === "completed";

    return (
        <Box w="full" minH="100vh" bg="bg.subtle" display="flex" flexDirection="column">
            {/* Header Navigation Bar */}
            <Box
                bg="bg.panel"
                borderBottomWidth="1px"
                borderColor="border.muted"
                px={6}
                py={3.5}
                position="sticky"
                top={0}
                zIndex={100}
                shadow="sm"
            >
                <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
                    <HStack gap={3}>
                        <IconButton
                            aria-label="Quay lại"
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate("/translation")}
                        >
                            <FiArrowLeft size={18} />
                        </IconButton>
                        <Box>
                            <Text fontSize="md" fontWeight="800" lineClamp={1} color="fg">
                                {session.title}
                            </Text>
                            <HStack gap={2} fontSize="xs" color="fg.muted">
                                <Text fontWeight="700" color="teal.600">
                                    Câu {currentIdx + 1} / {totalSentences}
                                </Text>
                                <Text>•</Text>
                                <Text>{vocabList.length} từ vựng đã nhặt</Text>
                            </HStack>
                        </Box>
                    </HStack>

                    <HStack gap={2.5}>
                        <Button
                            size="sm"
                            variant="outline"
                            colorPalette="teal"
                            onClick={exportBilingualXlsx}
                            borderRadius="lg"
                        >
                            <FiDownload style={{ marginRight: 4 }} /> Xuất song ngữ (.xlsx)
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            colorPalette="teal"
                            onClick={exportVocabXlsx}
                            borderRadius="lg"
                        >
                            <FiDownload style={{ marginRight: 4 }} /> Xuất Vocab (.xlsx)
                        </Button>
                        <Button
                            size="sm"
                            colorPalette="teal"
                            variant={isCompleted ? "subtle" : "solid"}
                            onClick={handleMarkComplete}
                            borderRadius="lg"
                        >
                            <FiCheckCircle style={{ marginRight: 4 }} />
                            {isCompleted ? "Đã hoàn thành" : "Hoàn thành bài dịch"}
                        </Button>
                    </HStack>
                </Flex>
            </Box>

            {/* Main CAT-Tool Workspace Layout (2 Columns: 60% Left / 40% Right) */}
            <Flex flex={1} overflow="hidden" direction={{ base: "column", lg: "row" }}>
                {/* ── LEFT COLUMN (60% Workspace) ── */}
                <Box
                    w={{ base: "100%", lg: "60%" }}
                    p={6}
                    overflowY="auto"
                    borderRightWidth={{ base: 0, lg: "1px" }}
                    borderColor="border.muted"
                    display="flex"
                    flexDirection="column"
                    gap={6}
                >
                    {/* SECTION 1: SOURCE TEXT (CÂU / ĐOẠN GỐC) */}
                    <Box bg="bg.panel" p={5} borderRadius="2xl" shadow="sm" borderWidth="1px" borderColor="border.muted">
                        <Flex justify="space-between" align="center" mb={3}>
                            <Badge colorPalette="teal" variant="surface" px={2.5} py={0.5} borderRadius="md" fontSize="xs">
                                PHẦN 1: CÂU / ĐOẠN GỐC (SOURCE TEXT)
                            </Badge>
                            <Text fontSize="xs" color="fg.muted">
                                💡 Bôi đen hoặc click từng từ để hiện Pop-up tra cứu nhanh
                            </Text>
                        </Flex>

                        <Box
                            p={4}
                            bg="teal.50/40"
                            _dark={{ bg: "teal.900/10" }}
                            borderRadius="xl"
                            borderLeftWidth="4px"
                            borderColor="teal.500"
                            fontSize="lg"
                            fontWeight="500"
                            lineHeight="1.8"
                            color="fg"
                            onMouseUp={handleTextSelection}
                        >
                            {currentSentence.original.split(/\s+/).map((word, wIdx) => (
                                <React.Fragment key={wIdx}>
                                    <Text
                                        as="span"
                                        display="inline"
                                        px="2px"
                                        py="1px"
                                        borderRadius="md"
                                        cursor="pointer"
                                        transition="all 0.15s"
                                        _hover={{ bg: "teal.100", color: "teal.800", textDecoration: "underline" }}
                                        _dark={{ _hover: { bg: "teal.800", color: "teal.100" } }}
                                        onClick={(e) => {
                                            const sel = window.getSelection()?.toString().trim();
                                            if (!sel) handleWordLookup(word, e);
                                        }}
                                    >
                                        {word}
                                    </Text>
                                    {" "}
                                </React.Fragment>
                            ))}
                        </Box>
                    </Box>

                    {/* SECTION 2: DUAL TRANSLATION TEXTAREAS (DỊCH THÔ & DỊCH HOÀN CHỈNH) */}
                    <Box bg="bg.panel" p={5} borderRadius="2xl" shadow="sm" borderWidth="1px" borderColor="border.muted">
                        <Badge colorPalette="blue" variant="surface" px={2.5} py={0.5} borderRadius="md" fontSize="xs" mb={4}>
                            PHẦN 2: BẢN DỊCH CỦA BẠN (USER TRANSLATION)
                        </Badge>

                        <VStack align="stretch" gap={5}>
                            {/* Ô 1: Dịch thô */}
                            <Box>
                                <Flex align="center" gap={2} mb={1.5}>
                                    <Text fontSize="sm" fontWeight="700" color="fg">
                                        Ô 1: Dịch thô
                                    </Text>
                                    <Text fontSize="xs" color="fg.muted">
                                        (Bám sát cấu trúc ngữ pháp từng vế tiếng Anh)
                                    </Text>
                                </Flex>
                                <Textarea
                                    placeholder="Nhập bản dịch thô từng vế..."
                                    rows={3}
                                    value={roughTrans}
                                    onChange={(e) => setRoughTrans(e.target.value)}
                                    borderRadius="xl"
                                    borderColor="gray.300"
                                    _focus={{ borderColor: "teal.500", shadow: "outline" }}
                                    fontSize="md"
                                />
                            </Box>

                            {/* Ô 2: Dịch hoàn chỉnh / trau chuốt */}
                            <Box>
                                <Flex align="center" gap={2} mb={1.5}>
                                    <Text fontSize="sm" fontWeight="700" color="teal.600" _dark={{ color: "teal.300" }}>
                                        Ô 2: Dịch hoàn chỉnh / Trau chuốt ✨
                                    </Text>
                                    <Text fontSize="xs" color="fg.muted">
                                        (Diễn đạt mượt mà, đúng văn phong tiếng Việt)
                                    </Text>
                                </Flex>
                                <Textarea
                                    placeholder="Nhập bản dịch chuẩn văn phong tiếng Việt..."
                                    rows={4}
                                    value={polishedTrans}
                                    onChange={(e) => setPolishedTrans(e.target.value)}
                                    borderRadius="xl"
                                    borderColor="teal.300"
                                    _focus={{ borderColor: "teal.500", shadow: "0 0 0 1px #319795" }}
                                    fontSize="md"
                                    fontWeight="500"
                                />
                            </Box>
                        </VStack>
                    </Box>

                    {/* SECTION 3: NOTES & EVALUATION */}
                    <Box bg="bg.panel" p={5} borderRadius="2xl" shadow="sm" borderWidth="1px" borderColor="border.muted">
                        <Badge colorPalette="purple" variant="surface" px={2.5} py={0.5} borderRadius="md" fontSize="xs" mb={3}>
                            PHẦN 3: ĐÁNH GIÁ / GHI CHÚ CÂU (NOTES)
                        </Badge>
                        <Textarea
                            placeholder="Ghi chú lỗi sai, lưu ý từ vựng quan trọng hoặc ngữ pháp trong câu này..."
                            rows={2}
                            value={sentenceNotes}
                            onChange={(e) => setSentenceNotes(e.target.value)}
                            borderRadius="xl"
                            fontSize="sm"
                        />
                    </Box>

                    {/* BOTTOM NAVIGATION BAR */}
                    <Flex justify="space-between" align="center" pt={2}>
                        <Button
                            variant="outline"
                            onClick={handlePrev}
                            disabled={currentIdx === 0}
                            borderRadius="xl"
                        >
                            <FiChevronLeft style={{ marginRight: 4 }} /> Câu trước
                        </Button>

                        <Button
                            colorPalette="teal"
                            onClick={handleSave}
                            loading={saving}
                            variant="light"
                            borderRadius="xl"
                        >
                            <FiSave style={{ marginRight: 4 }} /> Lưu tiến độ
                        </Button>

                        <Button
                            colorPalette="teal"
                            onClick={handleNext}
                            disabled={currentIdx >= totalSentences - 1}
                            borderRadius="xl"
                        >
                            Lưu & Câu tiếp theo <FiChevronRight style={{ marginLeft: 4 }} />
                        </Button>
                    </Flex>
                </Box>

                {/* ── RIGHT COLUMN (40% Toolkit & Vocab) ── */}
                <Box
                    w={{ base: "100%", lg: "40%" }}
                    p={6}
                    bg="bg.panel"
                    overflowY="auto"
                    display="flex"
                    flexDirection="column"
                    gap={6}
                >
                    {/* BẢNG GHI CHÚ TỪ VỰNG (VOCABULARY TABLE) */}
                    <Box borderBottomWidth="1px" borderColor="border.muted" pb={6}>
                        <Flex justify="space-between" align="center" mb={4}>
                            <HStack gap={2}>
                                <FiBookOpen size={18} color="#319795" />
                                <Text fontSize="md" fontWeight="800">
                                    BẢNG GHI CHÚ TỪ VỰNG ({vocabList.length})
                                </Text>
                            </HStack>
                            <Button
                                size="xs"
                                variant="outline"
                                colorPalette="teal"
                                onClick={exportVocabXlsx}
                                borderRadius="md"
                            >
                                <FiDownload style={{ marginRight: 4 }} /> Excel
                            </Button>
                        </Flex>

                        {/* Inline Add Quick Vocab */}
                        <HStack gap={2} mb={4}>
                            <Input
                                placeholder="Tiếng Anh"
                                size="sm"
                                value={quickEn}
                                onChange={(e) => setQuickEn(e.target.value)}
                                borderRadius="lg"
                            />
                            <Input
                                placeholder="Tiếng Việt"
                                size="sm"
                                value={quickVi}
                                onChange={(e) => setQuickVi(e.target.value)}
                                borderRadius="lg"
                            />
                            <IconButton
                                aria-label="Thêm nhanh"
                                colorPalette="teal"
                                size="sm"
                                borderRadius="lg"
                                onClick={() => handleAddVocab(quickEn, quickVi)}
                            >
                                <FiPlus />
                            </IconButton>
                        </HStack>

                        {/* Vocab Table */}
                        {vocabList.length === 0 ? (
                            <Box textAlign="center" py={6} bg="bg.subtle" borderRadius="xl">
                                <Text fontSize="xs" color="fg.muted">
                                    Chưa có từ vựng nào. Click từ ở câu gốc hoặc dùng khung trên để thêm nhanh.
                                </Text>
                            </Box>
                        ) : (
                            <Box maxH="280px" overflowY="auto" borderRadius="xl" border="1px solid" borderColor="border.muted">
                                <Table.Root size="sm" striped interactive>
                                    <Table.Header bg="bg.subtle">
                                        <Table.Row>
                                            <Table.ColumnHeader fontWeight="700">Tiếng Anh</Table.ColumnHeader>
                                            <Table.ColumnHeader fontWeight="700">Tiếng Việt</Table.ColumnHeader>
                                            <Table.ColumnHeader w="40px"></Table.ColumnHeader>
                                        </Table.Row>
                                    </Table.Header>
                                    <Table.Body>
                                        {vocabList.map((item, idx) => (
                                            <Table.Row key={idx}>
                                                <Table.Cell fontWeight="600" color="teal.600" _dark={{ color: "teal.300" }}>
                                                    <HStack gap={1.5}>
                                                        <Text>{item.english}</Text>
                                                        <IconButton
                                                            aria-label="Nghe đọc"
                                                            variant="ghost"
                                                            size="xs"
                                                            onClick={() => speakWord(item.english)}
                                                        >
                                                            <FiVolume2 size={12} />
                                                        </IconButton>
                                                    </HStack>
                                                </Table.Cell>
                                                <Table.Cell fontSize="xs">{item.vietnamese || "—"}</Table.Cell>
                                                <Table.Cell textAlign="right">
                                                    <IconButton
                                                        aria-label="Xóa"
                                                        variant="ghost"
                                                        colorPalette="red"
                                                        size="xs"
                                                        onClick={() => handleDeleteVocab(idx)}
                                                    >
                                                        <FiTrash2 size={13} />
                                                    </IconButton>
                                                </Table.Cell>
                                            </Table.Row>
                                        ))}
                                    </Table.Body>
                                </Table.Root>
                            </Box>
                        )}
                    </Box>

                    {/* GHI CHÚ NGỮ PHÁP / COLLOCATION WIDGET */}
                    <Box>
                        <HStack gap={2} mb={3}>
                            <FiEdit3 size={18} color="#805AD5" />
                            <Text fontSize="md" fontWeight="800">
                                GHI CHÚ NGỮ PHÁP / COLLOCATION
                            </Text>
                        </HStack>
                        <Textarea
                            placeholder="Ghi lại các cấu trúc hay, cụm từ cố định (collocations) hoặc lưu ý quan trọng trong bài đọc..."
                            rows={8}
                            value={grammarNotes}
                            onChange={(e) => setGrammarNotes(e.target.value)}
                            onBlur={() => handleSave()}
                            borderRadius="xl"
                            fontSize="sm"
                        />
                        <Text fontSize="xs" color="fg.muted" mt={2} textAlign="right">
                            * Tự động lưu khi rời ô nhập liệu
                        </Text>
                    </Box>
                </Box>
            </Flex>

            {/* FLOATING DICTIONARY POP-UP */}
            {dictPopup && (
                <Box
                    ref={popupRef}
                    position="fixed"
                    left={`${dictPopup.x}px`}
                    top={`${dictPopup.y}px`}
                    bg="bg.panel"
                    borderRadius="xl"
                    shadow="2xl"
                    borderWidth="1px"
                    borderColor="teal.400"
                    p={4}
                    zIndex={2000}
                    w="320px"
                >
                    <Flex justify="space-between" align="center" mb={2}>
                        <HStack gap={2}>
                            <Text fontSize="md" fontWeight="800" color="teal.600" _dark={{ color: "teal.300" }}>
                                {dictPopup.word}
                            </Text>
                            <IconButton
                                aria-label="Nghe phát âm"
                                variant="ghost"
                                size="xs"
                                colorPalette="teal"
                                onClick={() => speakWord(dictPopup.word)}
                            >
                                <FiVolume2 />
                            </IconButton>
                        </HStack>
                        <Button
                            size="xs"
                            colorPalette="teal"
                            borderRadius="md"
                            onClick={() => handleAddVocab(dictPopup.word, dictPopup.meaning)}
                        >
                            <FiPlus style={{ marginRight: 2 }} /> Lưu Vocab
                        </Button>
                    </Flex>

                    {dictPopup.loading ? (
                        <Flex justify="center" py={4}>
                            <Spinner size="sm" color="teal.500" />
                        </Flex>
                    ) : (
                        <VStack align="stretch" gap={2} fontSize="xs">
                            {/* Meaning in Vietnamese */}
                            <Box bg="teal.50" _dark={{ bg: "teal.900/30" }} p={2.5} borderRadius="lg">
                                <Text fontWeight="700" color="teal.700" _dark={{ color: "teal.300" }}>
                                    Nghĩa Tiếng Việt:
                                </Text>
                                <Text fontSize="sm" fontWeight="600" color="fg">
                                    {dictPopup.meaning || "Chưa có nghĩa"}
                                </Text>
                            </Box>

                            {/* English definitions from Datamuse */}
                            {dictPopup.meanings && dictPopup.meanings.length > 0 && (
                                <Box maxH="120px" overflowY="auto" pt={1}>
                                    <Text fontWeight="700" color="fg.muted" mb={1}>
                                        Định nghĩa (En):
                                    </Text>
                                    {dictPopup.meanings.map((m, i) => (
                                        <Box key={i} mb={1}>
                                            <Text fontStyle="italic" color="purple.500" fontWeight="600">
                                                [{m.partOfSpeech}]
                                            </Text>
                                            {m.definitions.slice(0, 2).map((d, di) => (
                                                <Text key={di} color="fg" pl={2}>
                                                    • {d.definition}
                                                </Text>
                                            ))}
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </VStack>
                    )}
                </Box>
            )}
        </Box>
    );
};

export default TranslationWorkspacePage;
