import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    Box, Flex, Text, Button, Input, VStack,
} from "@chakra-ui/react";
import {
    FiVolume2, FiCheck, FiX, FiRefreshCw, FiChevronRight,
} from "react-icons/fi";
import { useColorMode } from "../../../components/ui/color-mode.jsx";
import { useTTS } from "../hooks/useTTS.js";

const normalize = (s) =>
    s.toLowerCase().trim().replace(/[.,;:!?'"‘’“”\-\(\)\[\]…—–]/g, "").replace(/\s+/g, " ");

// ── Finished screen ──────────────────────────────────────────────────
const FinishedScreen = ({ total, correct, wrong, onReset }) => {
    const pct = total ? Math.round((correct / (correct + wrong)) * 100) : 0;
    return (
        <Box textAlign="center" py={{ base: 12, md: 20 }}>
            <Box fontSize="6xl" mb={4}>
                {pct >= 90 ? "🏆" : pct >= 70 ? "🎉" : pct >= 50 ? "👏" : "💪"}
            </Box>
            <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="extrabold" mb={2}>
                Hoàn thành bài Dictation!
            </Text>
            <Text color="fg.muted" mb={8} fontSize="sm">
                Bạn đã hoàn thành {total} câu luyện nghe – chép.
            </Text>
            <Flex justify="center" gap={4} mb={10} flexWrap="wrap">
                {[
                    { label: "Đúng", value: correct, color: "green.500" },
                    { label: "Sai", value: wrong, color: "red.500" },
                    { label: "Chính xác", value: `${pct}%`, color: "blue.500" },
                ].map(({ label, value, color }) => (
                    <Box
                        key={label} textAlign="center"
                        p={5} bg="bg.panel" borderRadius="2xl"
                        borderWidth="1px" borderColor="border.muted" minW="90px"
                    >
                        <Text fontSize="2xl" fontWeight="extrabold" color={color}>{value}</Text>
                        <Text fontSize="xs" color="fg.muted" mt={1}>{label}</Text>
                    </Box>
                ))}
            </Flex>
            <Button colorPalette="blue" size="lg" onClick={onReset} gap={2}>
                <FiRefreshCw /> Làm bài mới
            </Button>
        </Box>
    );
};

// ── Main component ────────────────────────────────────────────────────
const TextExercise = ({ data, onReset }) => {
    const { exercises } = data;
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [submitted, setSubmitted] = useState(false);
    const [results, setResults] = useState([]);
    const [stats, setStats] = useState({ correct: 0, wrong: 0 });
    const [finished, setFinished] = useState(false);

    const inputRefs = useRef([]);
    const spokenRef = useRef(-1);          // guard: only speak once per sentence index
    const submittedRef = useRef(false);    // stable ref for keyboard closure
    const { speak } = useTTS();
    const speakRef = useRef(speak);
    speakRef.current = speak;
    const { colorMode } = useColorMode();
    const isDark = colorMode === "dark";

    const currentSentence = exercises[currentIdx];
    const blanks = currentSentence?.blanks ?? [];

    // Keep submittedRef in sync
    useEffect(() => { submittedRef.current = submitted; }, [submitted]);

    // ── Reset & auto-speak when sentence changes (once per index) ────
    useEffect(() => {
        if (!currentSentence) return;
        setAnswers(new Array(blanks.length).fill(""));
        setSubmitted(false);
        setResults([]);

        // Only auto-speak if this is the first time we're showing this sentence
        if (spokenRef.current === currentIdx) return;
        spokenRef.current = currentIdx;

        const t = setTimeout(() => {
            speakRef.current(currentSentence.original);
            // Focus first blank ONLY after TTS starts (not re-triggered by focus)
            setTimeout(() => inputRefs.current[0]?.focus(), 700);
        }, 350);
        return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentIdx]);

    // ── Handlers (stable refs for keyboard listener) ─────────────────
    const handleNext = useCallback(() => {
        if (currentIdx >= exercises.length - 1) setFinished(true);
        else setCurrentIdx(p => p + 1);
    }, [currentIdx, exercises.length]);

    const handleNextRef = useRef(handleNext);
    handleNextRef.current = handleNext;

    const handleSubmit = useCallback(() => {
        if (submittedRef.current) return;
        const newResults = blanks.map(
            (blank, i) => normalize(answers[i] ?? "") === normalize(blank)
        );
        setResults(newResults);
        setSubmitted(true);
        submittedRef.current = true;
        const numCorrect = newResults.filter(Boolean).length;
        setStats(p => ({
            correct: p.correct + numCorrect,
            wrong: p.wrong + (blanks.length - numCorrect),
        }));
        if (newResults.every(Boolean)) {
            setTimeout(() => handleNextRef.current(), 1600);
        } else {
            // Tự động đọc lại khi sai
            setTimeout(() => speakRef.current(sentenceRef.current?.original ?? ""), 400);
        }
    }, [answers, blanks]);

    const handleSubmitRef = useRef(handleSubmit);
    handleSubmitRef.current = handleSubmit;

    const sentenceRef = useRef(currentSentence);
    sentenceRef.current = currentSentence;

    // ── Keyboard shortcuts — registered ONCE, use refs inside ────────
    useEffect(() => {
        let ctrlDown = false;
        let otherDown = false;

        const onKeyDown = (e) => {
            if (e.key === "Control") { ctrlDown = true; otherDown = false; return; }
            if (ctrlDown) { otherDown = true; }
            if (e.key === "Enter") {
                e.preventDefault();
                if (!submittedRef.current) handleSubmitRef.current();
                else handleNextRef.current();
            }
        };
        const onKeyUp = (e) => {
            if (e.key === "Control") {
                if (!otherDown) speakRef.current(sentenceRef.current?.original ?? "");
                ctrlDown = false;
                otherDown = false;
            }
        };
        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("keyup", onKeyUp);
        return () => {
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("keyup", onKeyUp);
        };
    }, []); // ← empty deps: registered once, never re-runs

    // ── Render ──────────────────────────────────────────────────────
    if (finished) {
        return (
            <FinishedScreen
                total={exercises.length}
                correct={stats.correct}
                wrong={stats.wrong}
                onReset={onReset}
            />
        );
    }
    if (!currentSentence) return null;

    const progress = (currentIdx / exercises.length) * 100;
    const allCorrect = submitted && results.every(Boolean);
    const someWrong = submitted && !results.every(Boolean);

    // Count blanks while mapping for rendering
    let blankRenderCount = 0;

    return (
        <Box>
            {/* ── Progress bar ── */}
            <Box mb={6}>
                <Flex justify="space-between" align="center" mb={2}>
                    <Text fontSize="sm" color="fg.muted" fontWeight="600">
                        Câu {currentIdx + 1}
                        <Text as="span" color="fg.subtle"> / {exercises.length}</Text>
                    </Text>
                    <Button
                        size="xs" variant="ghost" gap={1.5} color="blue.500"
                        onClick={() => speakRef.current(currentSentence.original)}
                    >
                        <FiVolume2 size={13} />
                        <Text fontSize="xs" fontWeight="600">Ctrl</Text>
                    </Button>
                </Flex>
                <Box h="6px" bg="bg.subtle" borderRadius="full" overflow="hidden">
                    <Box
                        h="full" bg="blue.400" borderRadius="full"
                        transition="width 0.4s ease"
                        style={{ width: `${progress}%` }}
                    />
                </Box>
            </Box>

            {/* ── Main card ── */}
            <Box
                bg="bg.panel" borderRadius="2xl"
                p={{ base: 5, md: 8 }}
                borderWidth="1px"
                borderColor={
                    allCorrect ? "green.300"
                    : someWrong ? "orange.300"
                    : "border.muted"
                }
                transition="border-color 0.3s"
                mb={5}
            >
                {/* Section label */}
                <Flex align="center" gap={2} mb={5}>
                    <Box
                        w="8px" h="8px" borderRadius="full"
                        bg={submitted ? (allCorrect ? "green.400" : "orange.400") : "blue.400"}
                        transition="background 0.3s"
                    />
                    <Text fontSize="xs" fontWeight="700" color="fg.muted" letterSpacing="wider">
                        🎧 NGHE VÀ ĐIỀN TỪ VÀO CHỖ TRỐNG
                    </Text>
                </Flex>

                {/* ── Sentence with numbered blank badges ── */}
                <Box
                    fontSize={{ base: "md", md: "lg" }}
                    lineHeight="2.6"
                    fontFamily="'Inter', Georgia, serif"
                    fontStyle="italic"
                    color="fg"
                    mb={6}
                >
                    {currentSentence.parts.map((part, i) => {
                        if (part.type === "text") {
                            return (
                                <span key={i} style={{ fontStyle: "normal" }}>
                                    {part.value}
                                </span>
                            );
                        }
                        const bIdx = blankRenderCount++;
                        const correct = submitted && results[bIdx] === true;
                        const wrong = submitted && results[bIdx] === false;
                        return (
                            <Box
                                key={i}
                                as="span"
                                display="inline-flex"
                                alignItems="center"
                                justifyContent="center"
                                px={2.5} py={0.5}
                                mx={1}
                                borderRadius="lg"
                                borderWidth="1.5px"
                                fontSize="sm"
                                fontWeight="800"
                                fontStyle="normal"
                                verticalAlign="middle"
                                letterSpacing="tight"
                                bg={
                                    correct ? "green.100"
                                    : wrong ? "red.100"
                                    : "blue.100"
                                }
                                borderColor={
                                    correct ? "green.400"
                                    : wrong ? "red.400"
                                    : "blue.400"
                                }
                                color={
                                    correct ? "green.700"
                                    : wrong ? "red.700"
                                    : "blue.700"
                                }
                                _dark={{
                                    bg: correct ? "green.800/40"
                                        : wrong ? "red.800/40"
                                        : "blue.800/40",
                                    color: correct ? "green.300"
                                        : wrong ? "red.300"
                                        : "blue.300",
                                }}
                                transition="all 0.25s"
                            >
                                {`[${bIdx + 1}]`}
                            </Box>
                        );
                    })}
                </Box>

                {/* ── Divider ── */}
                <Box h="1px" bg="border.muted" mb={5} />

                {/* ── Numbered input fields ── */}
                <VStack gap={3} align="stretch">
                    {blanks.map((blank, idx) => {
                        const correct = submitted && results[idx] === true;
                        const wrong = submitted && results[idx] === false;
                        return (
                            <Flex key={idx} align="center" gap={3}>
                                {/* Number badge */}
                                <Flex
                                    w="30px" h="30px" borderRadius="full" flexShrink={0}
                                    align="center" justify="center"
                                    bg={
                                        correct ? "green.400"
                                        : wrong ? "red.400"
                                        : "blue.400"
                                    }
                                    color="white" fontSize="xs" fontWeight="800"
                                    transition="background 0.25s"
                                    boxShadow="sm"
                                >
                                    {idx + 1}
                                </Flex>

                                {/* Input */}
                                <Input
                                    ref={el => (inputRefs.current[idx] = el)}
                                    value={answers[idx] ?? ""}
                                    onChange={(e) => {
                                        const next = [...answers];
                                        next[idx] = e.target.value;
                                        setAnswers(next);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Tab") {
                                            e.preventDefault();
                                            const next =
                                                inputRefs.current[idx + 1] ||
                                                inputRefs.current[0];
                                            next?.focus();
                                        }
                                    }}
                                    disabled={submitted}
                                    placeholder={`Chỗ trống ${idx + 1}…`}
                                    borderRadius="xl"
                                    fontSize="md"
                                    fontWeight="500"
                                    borderColor={
                                        correct ? "green.400"
                                        : wrong ? "red.400"
                                        : undefined
                                    }
                                    bg={
                                        correct
                                            ? (isDark ? "rgba(72,187,120,0.12)" : "green.50")
                                            : wrong
                                                ? (isDark ? "rgba(252,129,129,0.12)" : "red.50")
                                                : undefined
                                    }
                                    transition="all 0.25s"
                                    flex={1}
                                />

                                {/* Correct answer hint for wrong inputs */}
                                {wrong && (
                                    <Box flexShrink={0} maxW="160px">
                                        <Text
                                            fontSize="xs" color="red.500" fontWeight="600"
                                            lineHeight="1.4"
                                        >
                                            ✓ {blank}
                                        </Text>
                                    </Box>
                                )}
                                {correct && (
                                    <Box color="green.500" flexShrink={0}>
                                        <FiCheck size={18} />
                                    </Box>
                                )}
                            </Flex>
                        );
                    })}
                </VStack>

                {/* ── Result feedback banner ── */}
                {submitted && (
                    <Flex
                        align="center" gap={2} mt={5} p={3}
                        borderRadius="xl"
                        bg={allCorrect
                            ? (isDark ? "rgba(72,187,120,0.1)" : "green.50")
                            : (isDark ? "rgba(246,173,85,0.1)" : "orange.50")
                        }
                        borderWidth="1px"
                        borderColor={allCorrect ? "green.300" : "orange.300"}
                    >
                        {allCorrect ? (
                            <>
                                <FiCheck color="#48BB78" size={16} />
                                <Text fontSize="sm" fontWeight="600" color="green.500">
                                    Xuất sắc! Điền đúng tất cả — tự động chuyển câu…
                                </Text>
                            </>
                        ) : (
                            <>
                                <FiX color="#FC8181" size={16} />
                                <Text fontSize="sm" fontWeight="600" color="orange.500">
                                    {results.filter(Boolean).length}/{blanks.length} đúng —
                                    nhấn <strong>Enter</strong> để tiếp tục
                                </Text>
                            </>
                        )}
                    </Flex>
                )}
            </Box>

            {/* ── Action buttons ── */}
            <Flex gap={3} justify="flex-end">
                <Button
                    variant="outline" size="sm" gap={2}
                    onClick={() => speakRef.current(currentSentence.original)}
                >
                    <FiVolume2 size={15} />
                    Nghe lại (Ctrl)
                </Button>
                {!submitted ? (
                    <Button
                        colorPalette="blue" size="sm" gap={2}
                        onClick={handleSubmit}
                        disabled={answers.every(a => !a?.trim())}
                    >
                        <FiCheck size={15} />
                        Nộp đáp án (Enter)
                    </Button>
                ) : (
                    <Button colorPalette="green" size="sm" gap={2} onClick={handleNext}>
                        {currentIdx >= exercises.length - 1 ? "Hoàn thành" : "Câu tiếp theo"} (Enter)
                        <FiChevronRight size={15} />
                    </Button>
                )}
            </Flex>

            {/* ── Keyboard hints ── */}
            <Flex justify="center" gap={5} mt={5} flexWrap="wrap">
                {[
                    { key: "Ctrl", desc: "Nghe lại" },
                    { key: "Enter", desc: submitted ? "Tiếp theo" : "Nộp đáp án" },
                    { key: "Tab", desc: "Chuyển ô" },
                ].map(({ key, desc }) => (
                    <Flex key={key} align="center" gap={1.5}>
                        <Box
                            px={1.5} py={0.5} bg="bg.subtle" borderRadius="sm"
                            borderWidth="1px" borderColor="border.muted"
                            fontFamily="monospace" fontWeight="bold" fontSize="11px" color="fg.muted"
                        >
                            {key}
                        </Box>
                        <Text fontSize="11px" color="fg.muted">{desc}</Text>
                    </Flex>
                ))}
            </Flex>
        </Box>
    );
};

export default TextExercise;
