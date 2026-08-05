import React, { useState, useEffect, useRef, useCallback } from "react";
import { Box, Flex, Text, Input, Button, Badge, Icon, VStack } from "@chakra-ui/react";
import { FiCheck, FiX, FiHelpCircle, FiEye, FiVolume2 } from "react-icons/fi";
import { speak } from "../../../shared/utils/speech.js";
import { calcQualityByTime } from "../../../shared/utils/calcQualityByTime.js";
import { checkAnswer, checkOnRightTrack } from "../../../shared/utils/checkAnswer.js";
import StudyTimer from "./StudyTimer.jsx";

/* ─── SRS Level colours (matches Flashcard.jsx) ─── */
const LEVEL_COLORS = ["gray", "orange", "yellow", "blue", "purple", "green"];
const LEVEL_LABELS = ["Mới học", "Ngày 1", "Ngày 3", "Tuần 1", "Tuần 2", "Thành thạo"];

/* ─── Web Audio helpers ─── */
const playBeep = (frequency, duration, type = "sine", vol = 0.25) => {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = type;
        osc.frequency.value = frequency;
        gain.gain.setValueAtTime(vol, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + duration);
    } catch (_) {}
};

const playCorrectSound = () => {
    playBeep(523, 0.12, "sine", 0.2);
    setTimeout(() => playBeep(659, 0.12, "sine", 0.2), 120);
    setTimeout(() => playBeep(784, 0.22, "sine", 0.2), 240);
};

const playWrongSound = () => {
    playBeep(300, 0.18, "sawtooth", 0.18);
    setTimeout(() => playBeep(220, 0.28, "sawtooth", 0.15), 180);
};

/* ─── Canvas Fireworks ─── */
const Fireworks = ({ active }) => {
    const canvasRef = useRef(null);
    const animRef = useRef(null);
    const burstTimers = useRef([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");

        // Always clear canvas when active changes
        if (!active) {
            if (animRef.current) {
                cancelAnimationFrame(animRef.current);
                animRef.current = null;
            }
            burstTimers.current.forEach(clearTimeout);
            burstTimers.current = [];
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            return;
        }

        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        const particles = [];
        const colors = ["#f59e0b", "#6366f1", "#ec4899", "#10b981", "#f97316", "#3b82f6", "#a855f7"];

        let cancelled = false;

        // Spawn 3 bursts
        const burst = (x, y) => {
            if (cancelled) return;
            for (let i = 0; i < 60; i++) {
                const angle = (Math.PI * 2 * i) / 60 + Math.random() * 0.3;
                const speed = 2 + Math.random() * 5;
                particles.push({
                    x, y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed - 2,
                    alpha: 1,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    size: 3 + Math.random() * 4,
                    gravity: 0.12,
                });
            }
        };

        burst(canvas.width * 0.3, canvas.height * 0.35);
        burstTimers.current.push(setTimeout(() => burst(canvas.width * 0.7, canvas.height * 0.25), 150));
        burstTimers.current.push(setTimeout(() => burst(canvas.width * 0.5, canvas.height * 0.4), 300));

        const draw = () => {
            if (cancelled) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach((p) => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += p.gravity;
                p.vx *= 0.98;
                p.alpha -= 0.016;
                ctx.globalAlpha = Math.max(0, p.alpha);
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1;
            // remove dead
            particles.splice(0, particles.length, ...particles.filter(p => p.alpha > 0));
            if (particles.length > 0) {
                animRef.current = requestAnimationFrame(draw);
            } else {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        };

        animRef.current = requestAnimationFrame(draw);

        return () => {
            cancelled = true;
            if (animRef.current) {
                cancelAnimationFrame(animRef.current);
                animRef.current = null;
            }
            burstTimers.current.forEach(clearTimeout);
            burstTimers.current = [];
            // Clear canvas immediately on cleanup
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        };
    }, [active]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                borderRadius: "inherit",
            }}
        />
    );
};

/* ═══════════════════════════════════════════════ */

const ReadType = ({ word, onAnswer }) => {
    const [input, setInput] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [correct, setCorrect] = useState(false);
    const [hintLevel, setHintLevel] = useState(0);
    const [showExample, setShowExample] = useState(false);
    const [showFireworks, setShowFireworks] = useState(false);
    const [quality, setQuality] = useState(null);
    const [finalTimeMs, setFinalTimeMs] = useState(0);
    const inputRef = useRef(null);
    const startTimeRef = useRef(Date.now());
    const fireworksTimerRef = useRef(null);

    const srsLevel = word?.srs?.level ?? 0;
    const srsStatus = word?.srs?.status ?? "NEW";

    // Reset when word changes
    useEffect(() => {
        // Cancel any lingering speech from previous word
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        // Clear lingering fireworks timer from previous word
        if (fireworksTimerRef.current) {
            clearTimeout(fireworksTimerRef.current);
            fireworksTimerRef.current = null;
        }
        setInput("");
        setSubmitted(false);
        setCorrect(false);
        setHintLevel(0);
        setShowExample(false);
        setShowFireworks(false);
        setQuality(null);
        setFinalTimeMs(0);
        startTimeRef.current = Date.now();
        setTimeout(() => inputRef.current?.focus(), 100);
    }, [word?._id]);

    const handleSubmit = useCallback(() => {
        if (!input.trim() || submitted) return;
        const elapsed = Date.now() - startTimeRef.current;
        const isCorrect = checkAnswer(input, word.english);
        // Time-based quality: sai → AGAIN, đúng nhanh → EASY, chậm → HARD/AGAIN
        // Nếu dùng hint thì giới hạn tối đa GOOD
        let q = calcQualityByTime(isCorrect, elapsed);
        if (hintLevel > 0 && (q === "EASY")) q = "GOOD";
        setFinalTimeMs(elapsed);
        setQuality(q);
        setCorrect(isCorrect);
        setSubmitted(true);
        if (isCorrect) {
            speak(word.english);
            playCorrectSound();
            setShowFireworks(true);
            fireworksTimerRef.current = setTimeout(() => {
                setShowFireworks(false);
                fireworksTimerRef.current = null;
            }, 2200);
        } else {
            playWrongSound();
        }
    }, [input, submitted, word, hintLevel]);

    const handleNext = useCallback(() => {
        onAnswer(word.cardId, quality ?? "AGAIN", { isCorrect: correct, timeMs: finalTimeMs });
    }, [quality, onAnswer, word, correct, finalTimeMs]);

    const handleHint = useCallback(() => {
        const maxHint = word.english.length;
        if (hintLevel < maxHint) setHintLevel(v => v + 1);
    }, [hintLevel, word]);

    // Stable refs so keyboard listener registered ONCE always calls latest version
    const handleHintRef = useRef(handleHint);
    handleHintRef.current = handleHint;
    const handleNextRef = useRef(handleNext);
    handleNextRef.current = handleNext;
    const handleSubmitRef = useRef(handleSubmit);
    handleSubmitRef.current = handleSubmit;
    const wordRef = useRef(word);
    wordRef.current = word;
    const submittedRef = useRef(submitted);
    submittedRef.current = submitted;
    const inputRef2 = useRef(input);
    inputRef2.current = input;

    // Keyboard shortcuts — registered ONCE, reads latest state via refs
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Ctrl+Space → gợi ý (check cả e.key và e.code để hỗ trợ mọi browser/IME)
            const isCtrlSpace = e.ctrlKey && (e.code === "Space" || e.key === " " || e.key === "Spacebar");
            if (isCtrlSpace) {
                e.preventDefault();
                e.stopPropagation();
                handleHintRef.current();
                return;
            }
            if (e.key === "Control" && submittedRef.current) {
                e.preventDefault();
                speak(wordRef.current?.english ?? "");
            }
            if (e.key === "e" && e.ctrlKey) { e.preventDefault(); setShowExample(v => !v); }
            if (e.key === "Enter") {
                if (submittedRef.current) handleNextRef.current();
                else if (inputRef2.current.trim()) handleSubmitRef.current();
            }
        };
        window.addEventListener("keydown", handleKeyDown, true); // capture phase để bắt trước browser
        return () => window.removeEventListener("keydown", handleKeyDown, true);
    }, []); // ← empty: đăng ký một lần duy nhất

    const getHintText = () => {
        if (hintLevel >= 1) {
            return word.english.split("").map((l, i) => (i < hintLevel ? l : "_")).join(" ");
        }
        return null;
    };

    const isOnRightTrack = checkOnRightTrack(input, word.english);

    return (
        <Flex direction="column" align="center" w="full" maxW="600px" mx="auto" gap={6}>
            <Box
                bg="bg.panel"
                borderRadius="3xl"
                borderWidth="1px"
                borderColor="border.subtle"
                shadow="xl"
                p={{ base: 6, md: 8 }}
                w="full"
                textAlign="center"
                position="relative"
                overflow="hidden"
            >
                {/* Fireworks overlay */}
                <Fireworks active={showFireworks} />

                {/* ── Header badges ── */}
                <Flex position="absolute" top={4} left={4} gap={2} align="center" flexWrap="wrap">
                    <Box w="6px" h="6px" borderRadius="full" bg="blue.400" flexShrink={0} />
                    <Text fontSize="10px" fontWeight="800" color="blue.600" letterSpacing="1px" textTransform="uppercase">
                        Gõ từ theo nghĩa
                    </Text>
                </Flex>

                {/* ── SRS + Word level badges (top-right) ── */}
                <Flex position="absolute" top={4} right={4} gap={2} align="center" flexWrap="wrap" justify="flex-end">
                    <StudyTimer startTime={startTimeRef.current} isRunning={!submitted} stoppedTimeMs={finalTimeMs} />
                    {srsStatus === "NEW" ? (
                        <Badge colorPalette="cyan" variant="solid" fontSize="xs" px={2} borderRadius="md">
                            ✨ TỪ MỚI
                        </Badge>
                    ) : (
                        <Badge
                            colorPalette={LEVEL_COLORS[srsLevel]}
                            variant="subtle"
                            fontSize="xs"
                            px={2}
                            borderRadius="md"
                            fontWeight="bold"
                        >
                            SRS {srsLevel} · {LEVEL_LABELS[srsLevel] ?? ""}
                        </Badge>
                    )}
                    {word.level && (
                        <Badge colorPalette="purple" variant="subtle" fontSize="xs" px={2} borderRadius="md" fontWeight="bold">
                            {word.level}
                        </Badge>
                    )}
                </Flex>

                {/* ── Word info ── */}
                <VStack gap={3} mb={6} mt={8}>
                    <Text fontSize="10px" color="fg.muted" fontWeight="800" textTransform="uppercase" letterSpacing="widest">
                        Nghĩa của từ vựng
                    </Text>
                    <Text fontSize="3xl" fontWeight="900" color="fg" lineHeight="1.1" letterSpacing="-0.5px">
                        {word.vietnamese}
                    </Text>
                    <Flex gap={2} align="center" justify="center" flexWrap="wrap">
                        {word.partOfSpeech && (
                            <Badge colorPalette="blue" variant="solid" px={3} py={0.5} borderRadius="full" fontSize="xs">
                                {word.partOfSpeech}
                            </Badge>
                        )}
                    </Flex>
                    {/* Hint letters */}
                    {hintLevel > 0 && (
                        <Text fontSize="md" color="brand.solid" fontWeight="bold" letterSpacing="3px">
                            {getHintText()}
                        </Text>
                    )}
                </VStack>

                {/* Pre-submit example */}
                {showExample && word.example && (
                    <Box bg="bg.subtle" p={4} borderRadius="xl" mb={5} border="1px dashed" borderColor="border.strong">
                        <Text fontStyle="italic" color="fg" fontSize="sm">
                            "{word.example.replace(new RegExp(word.english, "gi"), "______")}"
                        </Text>
                        {word.exampleTranslation && (
                            <Text fontSize="xs" color="fg.muted" mt={1}>
                                → {word.exampleTranslation}
                            </Text>
                        )}
                    </Box>
                )}

                {/* ── Input state ── */}
                {!submitted ? (
                    <VStack gap={4}>
                        <Box w="full" position="relative" maxW="320px" mx="auto">
                            <Input
                                ref={inputRef}
                                placeholder="Type English word..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                size="lg"
                                textAlign="center"
                                fontSize="xl"
                                fontWeight="bold"
                                borderRadius="xl"
                                h="56px"
                                bg="bg.subtle"
                                borderColor={input.length > 0 ? (isOnRightTrack ? "green.300" : "red.300") : "border.muted"}
                                _focus={{
                                    borderColor: isOnRightTrack ? "green.400" : "red.400",
                                    bg: "bg.panel",
                                }}
                            />
                            {input.length > 0 && (
                                <Text
                                    position="absolute" bottom="-20px" left="50%" transform="translateX(-50%)"
                                    fontSize="9px" fontWeight="900" color={isOnRightTrack ? "green.500" : "red.500"}
                                    textTransform="uppercase" letterSpacing="0.5px" w="full"
                                >
                                    {isOnRightTrack ? "✔ Đúng hướng" : "✘ Sai rồi"}
                                </Text>
                            )}
                        </Box>

                        <Flex gap={2} w="full" justify="center" flexWrap="wrap" mt={4}>
                            <Button
                                variant="ghost" size="sm" borderRadius="lg"
                                onClick={() => setShowExample(!showExample)}
                            >
                                <FiEye style={{ marginRight: 6 }} /> Ví dụ (Ctrl+E)
                            </Button>
                            <Button
                                variant="ghost" size="sm" borderRadius="lg"
                                onClick={handleHint}
                                disabled={hintLevel >= word.english.length}
                            >
                                <FiHelpCircle style={{ marginRight: 6 }} /> Gợi ý (Ctrl+Space)
                            </Button>
                            <Button
                                colorPalette="blue" size="md" borderRadius="xl" px={8}
                                onClick={handleSubmit}
                                disabled={!input.trim()}
                            >
                                Kiểm tra (Enter)
                            </Button>
                        </Flex>
                    </VStack>
                ) : (
                    <VStack gap={5}>
                        {/* Result box */}
                        <Box
                            p={6} borderRadius="2xl" w="full"
                            bg={correct ? "green.50" : "red.50"}
                            borderWidth="1px"
                            borderColor={correct ? "green.200" : "red.200"}
                            _dark={{ bg: correct ? "green.900/20" : "red.900/20" }}
                        >
                            <Flex align="center" gap={3} justify="center" mb={2}>
                                <Icon as={correct ? FiCheck : FiX} boxSize={6} color={correct ? "green.500" : "red.500"} />
                                <Text fontSize="xl" fontWeight="800" color={correct ? "green.600" : "red.600"}>
                                    {correct ? "Chính xác! 🎉" : "Sai rồi bạn ơi 😢"}
                                </Text>
                            </Flex>
                            {/* Quality badge */}
                            {quality && (
                                <Flex justify="center" mb={2}>
                                    <Badge
                                        colorPalette={quality === "EASY" ? "green" : quality === "GOOD" ? "blue" : quality === "HARD" ? "orange" : "red"}
                                        variant="solid" px={3} py={1} borderRadius="lg" fontSize="xs" fontWeight="bold"
                                    >
                                        {quality === "EASY" ? "⚡ EASY — Rất nhanh" : quality === "GOOD" ? "👍 GOOD" : quality === "HARD" ? "😓 HARD — Hơi chậm" : "🔁 AGAIN — Quá chậm / Sai"}
                                    </Badge>
                                </Flex>
                            )}

                            {/* Show user's wrong input */}
                            {!correct && (
                                <Text fontSize="lg" color="red.400" fontWeight="600" mb={1} textDecoration="line-through" opacity={0.8}>
                                    {input}
                                </Text>
                            )}

                            {/* Word + speak button (inline, no circle) */}
                            <Flex align="center" gap={2} justify="center">
                                <Text fontSize="3xl" fontWeight="900" color="brand.solid" letterSpacing="1px">
                                    {word.english}
                                </Text>
                                <Box
                                    as="button"
                                    onClick={() => speak(word.english)}
                                    display="inline-flex" alignItems="center" justifyContent="center"
                                    w="28px" h="28px" borderRadius="md"
                                    bg="bg.subtle"
                                    border="1px solid"
                                    borderColor="border.muted"
                                    color="fg.muted"
                                    cursor="pointer"
                                    _hover={{ color: "blue.500", borderColor: "blue.300" }}
                                    transition="all 0.15s"
                                    title="Nghe phát âm"
                                >
                                    <FiVolume2 size={14} />
                                </Box>
                            </Flex>

                            {word.pronunciation && (
                                <Text fontSize="md" color="fg.muted" fontStyle="italic" mt={1}>
                                    {word.pronunciation}
                                </Text>
                            )}
                        </Box>

                        {/* Example + translation */}
                        {word.example && (
                            <Box bg="bg.subtle" p={4} borderRadius="xl" w="full" border="1px dashed" borderColor="border.strong">
                                <Text fontStyle="italic" color="fg" fontSize="sm">
                                    "{word.example}"
                                </Text>
                                {word.exampleTranslation && (
                                    <Text fontSize="xs" color="fg.muted" mt={1}>
                                        → {word.exampleTranslation}
                                    </Text>
                                )}
                            </Box>
                        )}

                        <Button
                            colorPalette="blue" size="lg" w="full" borderRadius="xl"
                            onClick={handleNext} fontWeight="800"
                        >
                            Từ tiếp theo →
                        </Button>
                    </VStack>
                )}
            </Box>
        </Flex>
    );
};

export default ReadType;
