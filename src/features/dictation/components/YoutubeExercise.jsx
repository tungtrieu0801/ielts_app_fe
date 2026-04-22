import React, { useState, useEffect, useRef, useCallback } from "react";
import { Box, Flex, Text, Button, Textarea, Grid, GridItem } from "@chakra-ui/react";
import {
    FiVolume2, FiCheck, FiX, FiRefreshCw, FiChevronRight, FiPlay,
} from "react-icons/fi";

// ── YouTube IFrame API ─────────────────────────────────────────────────────
let ytApiPromise = null;

function loadYouTubeIframeAPI() {
    if (ytApiPromise) return ytApiPromise;
    ytApiPromise = new Promise((resolve) => {
        if (window.YT?.Player) { resolve(window.YT); return; }
        const prev = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => { prev?.(); resolve(window.YT); };
        if (!document.getElementById("yt-api-script")) {
            const s = document.createElement("script");
            s.id = "yt-api-script";
            s.src = "https://www.youtube.com/iframe_api";
            document.head.appendChild(s);
        }
    });
    return ytApiPromise;
}

// ── useYouTubePlayer hook ─────────────────────────────────────────────────
function useYouTubePlayer(divRef, videoId) {
    const playerRef = useRef(null);
    const pauseTimerRef = useRef(null);  // setInterval id for polling
    const readyRef = useRef(false);

    useEffect(() => {
        if (!divRef.current || !videoId) return;
        let destroyed = false;
        readyRef.current = false;

        loadYouTubeIframeAPI().then((YT) => {
            if (destroyed) return;
            playerRef.current = new YT.Player(divRef.current, {
                videoId,
                playerVars: { rel: 0, modestbranding: 1, playsinline: 1 },
                events: {
                    onReady: () => { readyRef.current = true; },
                },
            });
        });

        return () => {
            destroyed = true;
            clearInterval(pauseTimerRef.current);
            try { playerRef.current?.destroy(); } catch (_) {}
            playerRef.current = null;
            readyRef.current = false;
        };
    }, [videoId]); // eslint-disable-line

    /**
     * Seek to `start` seconds and play.
     * Polls getCurrentTime() every 150 ms and pauses exactly at `end` seconds.
     * This avoids setTimeout drift caused by buffering.
     */
    const seekAndPlay = useCallback((start, end) => {
        const p = playerRef.current;
        if (!p?.seekTo) return;

        clearInterval(pauseTimerRef.current);
        p.seekTo(Math.max(0, start - 0.2), true);
        p.playVideo();

        if (end != null) {
            pauseTimerRef.current = setInterval(() => {
                try {
                    const t = p.getCurrentTime?.();
                    if (typeof t === "number" && t >= end + 0.15) {
                        p.pauseVideo?.();
                        clearInterval(pauseTimerRef.current);
                    }
                } catch (_) {
                    clearInterval(pauseTimerRef.current);
                }
            }, 150);
        }
    }, []);

    const pauseVideo = useCallback(() => {
        clearInterval(pauseTimerRef.current);
        playerRef.current?.pauseVideo?.();
    }, []);

    return { seekAndPlay, pauseVideo };
}


// ── Scoring ───────────────────────────────────────────────────────────────
const normalize = (s) =>
    s.toLowerCase().trim().replace(/[.,;:!?'"]/g, "").replace(/\s+/g, " ");

function scoreAnswer(userAnswer, correctSentence) {
    const u = normalize(userAnswer).split(" ").filter(Boolean);
    const c = normalize(correctSentence).split(" ").filter(Boolean);
    if (!c.length) return 0;
    return u.filter((w) => c.includes(w)).length / c.length;
}

// ── Finished screen ───────────────────────────────────────────────────────
const FinishedScreen = ({ total, correct, wrong, onReset }) => {
    const pct = total ? Math.round((correct / total) * 100) : 0;
    return (
        <Box textAlign="center" py={{ base: 12, md: 20 }}>
            <Box fontSize="6xl" mb={4}>
                {pct >= 90 ? "🏆" : pct >= 70 ? "🎉" : pct >= 50 ? "👏" : "💪"}
            </Box>
            <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="extrabold" mb={2}>
                Hoàn thành!
            </Text>
            <Text color="fg.muted" mb={8} fontSize="sm">
                Bạn đã nghe và chép {total} câu từ YouTube.
            </Text>
            <Flex justify="center" gap={4} mb={10} flexWrap="wrap">
                {[
                    { label: "Đúng (≥75%)", value: correct, color: "green.500" },
                    { label: "Cần cải thiện", value: wrong, color: "red.500" },
                    { label: "Điểm số", value: `${pct}%`, color: "blue.500" },
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

// ── Main component ────────────────────────────────────────────────────────
const YoutubeExercise = ({ data, onReset }) => {
    const { exercises, videoId } = data;
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answer, setAnswer] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [stats, setStats] = useState({ correct: 0, wrong: 0 });
    const [finished, setFinished] = useState(false);

    const playerDivRef = useRef(null);
    const textareaRef = useRef(null);
    const submittedRef = useRef(false);
    const { seekAndPlay, pauseVideo } = useYouTubePlayer(playerDivRef, videoId);
    const seekRef = useRef(seekAndPlay);
    seekRef.current = seekAndPlay;

    const currentSentence = exercises[currentIdx];
    const sentenceRef = useRef(currentSentence);
    sentenceRef.current = currentSentence;

    useEffect(() => { submittedRef.current = submitted; }, [submitted]);

    // ── Auto-play when sentence changes ──────────────────────────────
    useEffect(() => {
        if (!currentSentence) return;
        setAnswer("");
        setSubmitted(false);
        submittedRef.current = false;
        const t = setTimeout(() => {
            seekRef.current(currentSentence.start ?? 0, currentSentence.end);
            setTimeout(() => textareaRef.current?.focus(), 400);
        }, 400);
        return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentIdx]);

    // ── Handlers ─────────────────────────────────────────────────────
    const handleNext = useCallback(() => {
        if (currentIdx >= exercises.length - 1) setFinished(true);
        else setCurrentIdx((p) => p + 1);
    }, [currentIdx, exercises.length]);

    const handleNextRef = useRef(handleNext);
    handleNextRef.current = handleNext;

    const handleSubmit = useCallback(() => {
        if (submittedRef.current || !answer.trim()) return;
        pauseVideo();
        const ok = scoreAnswer(answer, currentSentence.original) >= 0.75;
        setIsCorrect(ok);
        setSubmitted(true);
        submittedRef.current = true;
        setStats((p) => ({
            correct: p.correct + (ok ? 1 : 0),
            wrong: p.wrong + (ok ? 0 : 1),
        }));
        if (ok) setTimeout(() => handleNextRef.current(), 1800);
    }, [answer, currentSentence, pauseVideo]);

    const handleSubmitRef = useRef(handleSubmit);
    handleSubmitRef.current = handleSubmit;

    const replayCurrentSentence = useCallback(() => {
        const s = sentenceRef.current;
        if (s) seekRef.current(s.start ?? 0, s.end);
    }, []);
    const replayRef = useRef(replayCurrentSentence);
    replayRef.current = replayCurrentSentence;

    // ── Keyboard shortcuts — registered once ─────────────────────────
    useEffect(() => {
        let ctrlDown = false, otherDown = false;
        const onKeyDown = (e) => {
            if (e.key === "Control") { ctrlDown = true; otherDown = false; return; }
            if (ctrlDown) otherDown = true;
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (!submittedRef.current) handleSubmitRef.current();
                else handleNextRef.current();
            }
        };
        const onKeyUp = (e) => {
            if (e.key === "Control") {
                if (!otherDown) replayRef.current();
                ctrlDown = false; otherDown = false;
            }
        };
        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("keyup", onKeyUp);
        return () => {
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("keyup", onKeyUp);
        };
    }, []);

    // ── Render ────────────────────────────────────────────────────────
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
    const hasTimestamps = currentSentence.start != null;

    return (
        <Grid
            templateColumns={{ base: "1fr", lg: "5fr 6fr" }}
            gap={{ base: 5, lg: 8 }}
            alignItems="start"
        >
            {/* ── LEFT: YouTube player (sticky) ── */}
            <GridItem position={{ lg: "sticky" }} top={{ lg: "88px" }}>
                <Box
                    borderRadius="2xl"
                    overflow="hidden"
                    bg="black"
                    boxShadow="0 20px 60px rgba(0,0,0,0.4)"
                    borderWidth="1px"
                    borderColor="border.muted"
                    style={{ aspectRatio: "16/9" }}
                >
                    <Box ref={playerDivRef} w="full" h="full" />
                </Box>

                {/* Current sentence preview */}
                <Box
                    mt={3} p={4}
                    bg="bg.panel" borderRadius="xl"
                    borderWidth="1px" borderColor="border.muted"
                >
                    <Flex align="center" gap={2} mb={2}>
                        <Box
                            w="6px" h="6px" borderRadius="full"
                            bg={submitted ? (isCorrect ? "green.400" : "orange.400") : "red.400"}
                        />
                        <Text fontSize="10px" fontWeight="700" color="fg.muted" letterSpacing="wider">
                            CÂU {currentIdx + 1} / {exercises.length}
                        </Text>
                    </Flex>
                    <Text
                        fontSize="sm" fontStyle="italic" lineHeight="1.7" color="fg.muted"
                        fontFamily="Georgia, serif"
                    >
                        {submitted
                            ? `"${currentSentence.original}"`
                            : "Nghe và gõ lại những gì bạn nghe được…"}
                    </Text>
                    {hasTimestamps && (
                        <Text fontSize="10px" color="fg.subtle" mt={2}>
                            ⏱ {currentSentence.start?.toFixed(1)}s – {currentSentence.end?.toFixed(1)}s
                        </Text>
                    )}
                </Box>

                {/* Replay button */}
                <Button
                    mt={3} w="full" variant="outline" gap={2}
                    onClick={replayCurrentSentence}
                >
                    <FiPlay size={14} />
                    Nghe lại từ đầu câu (Ctrl)
                </Button>
            </GridItem>

            {/* ── RIGHT: Exercise area ── */}
            <GridItem>
                {/* Progress */}
                <Box mb={5}>
                    <Flex justify="space-between" align="center" mb={2}>
                        <Text fontSize="sm" color="fg.muted" fontWeight="600">
                            Câu {currentIdx + 1}
                            <Text as="span" color="fg.subtle"> / {exercises.length}</Text>
                        </Text>
                        <Button
                            size="xs" variant="ghost" gap={1.5} color="red.400"
                            onClick={replayCurrentSentence}
                        >
                            <FiVolume2 size={13} />
                            <Text fontSize="xs" fontWeight="600">Ctrl</Text>
                        </Button>
                    </Flex>
                    <Box h="6px" bg="bg.subtle" borderRadius="full" overflow="hidden">
                        <Box
                            h="full" bg="red.400" borderRadius="full"
                            transition="width 0.4s ease"
                            style={{ width: `${progress}%` }}
                        />
                    </Box>
                </Box>

                {/* Main card */}
                <Box
                    bg="bg.panel" borderRadius="2xl" p={{ base: 4, md: 6 }}
                    borderWidth="1px"
                    borderColor={
                        !submitted ? "border.muted"
                        : isCorrect ? "green.300" : "red.300"
                    }
                    transition="border-color 0.3s"
                    mb={4}
                >
                    <Flex align="center" gap={2} mb={4}>
                        <Box
                            w="8px" h="8px" borderRadius="full"
                            bg={!submitted ? "red.400" : isCorrect ? "green.400" : "red.400"}
                            transition="background 0.3s"
                        />
                        <Text fontSize="xs" fontWeight="700" color="fg.muted" letterSpacing="wider">
                            🎧 NGHE VÀ GÕ LẠI TOÀN BỘ CÂU
                        </Text>
                    </Flex>

                    <Textarea
                        ref={textareaRef}
                        value={answer}
                        onChange={(e) => !submitted && setAnswer(e.target.value)}
                        placeholder="Gõ những gì bạn nghe được… (Shift+Enter = xuống dòng)"
                        rows={4}
                        fontSize="md"
                        borderRadius="xl"
                        resize="none"
                        disabled={submitted}
                        borderColor={
                            !submitted ? undefined
                            : isCorrect ? "green.400" : "red.400"
                        }
                        bg={
                            !submitted ? undefined
                            : isCorrect ? "green.50" : "red.50"
                        }
                        _dark={{
                            bg: !submitted ? undefined
                                : isCorrect ? "green.900/20" : "red.900/20",
                        }}
                        transition="all 0.3s"
                    />

                    {submitted && (
                        <Box mt={4}>
                            <Flex
                                align="center" gap={2} p={3} borderRadius="xl"
                                bg={isCorrect ? "green.50" : "orange.50"}
                                _dark={{ bg: isCorrect ? "green.900/20" : "orange.900/20" }}
                                borderWidth="1px"
                                borderColor={isCorrect ? "green.300" : "orange.300"}
                            >
                                {isCorrect ? (
                                    <>
                                        <FiCheck color="#48BB78" size={16} />
                                        <Text fontSize="sm" fontWeight="600" color="green.500">
                                            Xuất sắc! Chuyển câu tiếp…
                                        </Text>
                                    </>
                                ) : (
                                    <>
                                        <FiX color="#FC8181" size={16} />
                                        <Text fontSize="sm" fontWeight="600" color="orange.500">
                                            Cần luyện thêm — đáp án bên dưới
                                        </Text>
                                    </>
                                )}
                            </Flex>

                            {!isCorrect && (
                                <Box
                                    mt={3} p={4} bg="bg.subtle" borderRadius="xl"
                                    borderWidth="1px" borderColor="border.muted"
                                >
                                    <Text fontSize="xs" color="fg.muted" fontWeight="600" mb={1.5}>
                                        ĐÁP ÁN ĐÚNG:
                                    </Text>
                                    <Text fontSize="md" fontWeight="600" fontStyle="italic" lineHeight="1.7">
                                        "{currentSentence.original}"
                                    </Text>
                                </Box>
                            )}
                        </Box>
                    )}
                </Box>

                {/* Action buttons */}
                <Flex gap={3} justify="flex-end" mb={5}>
                    <Button
                        variant="outline" size="sm" gap={2}
                        onClick={replayCurrentSentence}
                    >
                        <FiPlay size={14} />
                        Nghe lại (Ctrl)
                    </Button>
                    {!submitted ? (
                        <Button
                            colorPalette="blue" size="sm" gap={2}
                            onClick={handleSubmit}
                            disabled={!answer.trim()}
                        >
                            <FiCheck size={14} />
                            Nộp (Enter)
                        </Button>
                    ) : (
                        <Button colorPalette="green" size="sm" gap={2} onClick={handleNext}>
                            {currentIdx >= exercises.length - 1 ? "Hoàn thành" : "Câu tiếp"}
                            (Enter)
                            <FiChevronRight size={14} />
                        </Button>
                    )}
                </Flex>

                {/* Keyboard hints */}
                <Flex justify="center" gap={5} flexWrap="wrap">
                    {[
                        { key: "Ctrl", desc: "Nghe lại" },
                        { key: "Enter", desc: submitted ? "Tiếp theo" : "Nộp đáp án" },
                        { key: "Shift+Enter", desc: "Xuống dòng" },
                    ].map(({ key, desc }) => (
                        <Flex key={key} align="center" gap={1.5}>
                            <Box
                                px={1.5} py={0.5} bg="bg.subtle" borderRadius="sm"
                                borderWidth="1px" borderColor="border.muted"
                                fontFamily="monospace" fontWeight="bold"
                                fontSize="11px" color="fg.muted"
                            >
                                {key}
                            </Box>
                            <Text fontSize="11px" color="fg.muted">{desc}</Text>
                        </Flex>
                    ))}
                </Flex>
            </GridItem>
        </Grid>
    );
};

export default YoutubeExercise;
