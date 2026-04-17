import React, { useState, useCallback, useEffect, useRef } from "react";
import { Box, Flex, Text, Button, IconButton, Badge } from "@chakra-ui/react";
import { FiVolume2 } from "react-icons/fi";

const QUALITY_BUTTONS = [
    { quality: 0, label: "Again", color: "red", emoji: "❌", desc: "Không nhớ" },
    { quality: 1, label: "Hard", color: "orange", emoji: "😓", desc: "Rất khó" },
    { quality: 2, label: "Good", color: "blue", emoji: "👍", desc: "Nhớ được" },
    { quality: 3, label: "Easy", color: "green", emoji: "✅", desc: "Dễ dàng" },
];

// ── Speak helper ──────────────────────────────────────────────
const speak = (text, lang = "en-US", rate = 0.9) => {
    if (!window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang;
    utter.rate = rate;
    // Ưu tiên giọng nội địa (local) cho chất lượng tốt hơn
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find((v) => v.lang.startsWith(lang.slice(0, 2)) && v.localService)
        || voices.find((v) => v.lang.startsWith(lang.slice(0, 2)));
    if (preferred) utter.voice = preferred;
    window.speechSynthesis.speak(utter);
};

// ── SpeakButton ───────────────────────────────────────────────
const SpeakButton = ({ text, lang = "en-US", size = "sm", label, rate }) => {
    const [speaking, setSpeaking] = useState(false);

    const handleSpeak = (e) => {
        e.stopPropagation();
        if (!window.speechSynthesis || !text) return;
        window.speechSynthesis.cancel();
        setSpeaking(true);
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = lang;
        utter.rate = rate || 0.9;
        utter.onend = () => setSpeaking(false);
        utter.onerror = () => setSpeaking(false);
        const voices = window.speechSynthesis.getVoices();
        const preferred = voices.find((v) => v.lang.startsWith(lang.slice(0, 2)) && v.localService)
            || voices.find((v) => v.lang.startsWith(lang.slice(0, 2)));
        if (preferred) utter.voice = preferred;
        window.speechSynthesis.speak(utter);
    };

    return (
        <IconButton
            size={size} variant="ghost" borderRadius="full"
            onClick={handleSpeak}
            color={speaking ? "blue.400" : "fg.muted"}
            _hover={{ color: "blue.500", bg: "brand.muted" }}
            transition="color 0.2s"
            title={label || "Nghe phát âm"}
            aria-label={label || "Speak"}
        >
            <FiVolume2 size={16} />
        </IconButton>
    );
};

// ── Flashcard ─────────────────────────────────────────────────
const Flashcard = ({ word, onAnswer }) => {
    const [flipped, setFlipped] = useState(false);
    const [answered, setAnswered] = useState(false);
    const isFirstRender = useRef(true);

    // ✅ Auto-read: đọc từ tiếng Anh ngay khi thẻ mới xuất hiện
    useEffect(() => {
        if (!word?.english) return;
        // Delay nhỏ để không xung đột với animation lật thẻ cũ
        const timer = setTimeout(() => {
            speak(word.english, "en-US", 0.9);
        }, isFirstRender.current ? 500 : 300);
        isFirstRender.current = false;
        return () => clearTimeout(timer);
    }, [word?._id]); // chỉ kích hoạt khi _id thay đổi (từ mới)

    // Reset state khi từ mới
    useEffect(() => {
        setFlipped(false);
        setAnswered(false);
    }, [word?._id]);

    const handleCardClick = useCallback(() => {
        if (answered) return;
        setFlipped((v) => !v);
    }, [answered]);

    const handleAnswer = (quality) => {
        setAnswered(true);
        setTimeout(() => {
            setFlipped(false);
            setAnswered(false);
            onAnswer(word._id, quality);
        }, 350);
    };

    return (
        <Flex direction="column" align="center" w="full" maxW="620px" mx="auto">
            {/* ── Card 3D ── */}
            <Box
                w="full" h="300px"
                cursor={answered ? "default" : "pointer"}
                onClick={!answered ? handleCardClick : undefined}
                style={{ perspective: "1200px" }}
                mb={6}
                userSelect="none"
            >
                <Box
                    w="full" h="full"
                    position="relative"
                    style={{
                        transformStyle: "preserve-3d",
                        transition: "transform 0.55s cubic-bezier(0.4,0,0.2,1)",
                        transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
                    }}
                >
                    {/* ── Mặt trước: Tiếng Anh ── */}
                    <Box
                        position="absolute" inset={0}
                        bg="bg.panel"
                        borderRadius="3xl"
                        borderWidth="1.5px"
                        borderColor={flipped ? "border.muted" : "brand.solid"}
                        shadow="xl"
                        display="flex" flexDirection="column"
                        alignItems="center" justifyContent="center" p={8}
                        style={{ backfaceVisibility: "hidden" }}
                        transition="border-color 0.3s"
                    >
                        <Box position="absolute" top={4} right={4}>
                            <SpeakButton text={word.english} lang="en-US" label="Nghe từ tiếng Anh" />
                        </Box>

                        <Text color="fg.subtle" fontSize="xs" fontWeight="600"
                            textTransform="uppercase" letterSpacing="wider" mb={5}>
                            🇬🇧 Tiếng Anh
                        </Text>
                        <Text fontSize={{ base: "4xl", md: "5xl" }}
                            fontWeight="extrabold" textAlign="center" mb={2} color="fg">
                            {word.english}
                        </Text>

                        {(word.pronunciation || word.partOfSpeech) && (
                            <Flex gap={3} align="center" mb={3}>
                                {word.partOfSpeech && (
                                    <Badge colorPalette="blue" size="sm" variant="subtle">
                                        {word.partOfSpeech}
                                    </Badge>
                                )}
                                {word.pronunciation && (
                                    <Text fontSize="15px" color="fg.muted" fontStyle="italic">
                                        {word.pronunciation}
                                    </Text>
                                )}
                            </Flex>
                        )}

                        {word.synonyms?.length > 0 && (
                            <Text fontSize="sm" color="fg.muted" mt={1} textAlign="center">
                                ≈ {word.synonyms.slice(0, 3).join(" · ")}
                            </Text>
                        )}
                        <Text fontSize="xs" color="fg.subtle" mt={8} opacity={0.6}>
                            {flipped ? "👆 Click để lật lại" : "👆 Click để xem nghĩa"}
                        </Text>
                    </Box>

                    {/* ── Mặt sau: Tiếng Việt ── */}
                    <Box
                        position="absolute" inset={0}
                        bg="blue.600"
                        borderRadius="3xl"
                        shadow="xl"
                        display="flex" flexDirection="column"
                        alignItems="center" justifyContent="center" p={8}
                        style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                    >
                        <Box position="absolute" top={4} right={4}>
                            <SpeakButton text={word.vietnamese} lang="vi-VN" label="Nghe nghĩa tiếng Việt" />
                        </Box>
                        <Box position="absolute" top={4} left={4}>
                            <Text fontSize="xs" color="blue.200" opacity={0.7}>↩ Click để lật lại</Text>
                        </Box>

                        <Text color="blue.100" fontSize="xs" fontWeight="600"
                            textTransform="uppercase" letterSpacing="wider" mb={5}>
                            🇻🇳 Nghĩa tiếng Việt
                        </Text>
                        <Text fontSize={{ base: "3xl", md: "4xl" }}
                            fontWeight="extrabold" color="white" textAlign="center" mb={4}>
                            {word.vietnamese}
                        </Text>
                        {word.example && (
                            <Box bg="blue.500/50" borderRadius="xl" p={3} w="full" mt={2}>
                                <Flex align="flex-start" gap={2}>
                                    <Text fontSize="sm" color="blue.100"
                                        fontStyle="italic" textAlign="center" flex={1}>
                                        "{word.example}"
                                    </Text>
                                    <SpeakButton text={word.example} lang="en-US" size="xs" label="Nghe ví dụ" />
                                </Flex>
                            </Box>
                        )}
                    </Box>
                </Box>
            </Box>

            {/* ── Answer Buttons ── */}
            {flipped && !answered && (
                <Box w="full" opacity={answered ? 0 : 1} transition="opacity 0.3s">
                    <Text textAlign="center" fontSize="sm" color="fg.muted" mb={3} fontWeight="medium">
                        Bạn nhớ từ này như thế nào?
                    </Text>
                    <Flex gap={2} justify="center" flexWrap="wrap">
                        {QUALITY_BUTTONS.map(({ quality, label, color, emoji, desc }) => (
                            <Button
                                key={quality}
                                colorPalette={color}
                                onClick={(e) => { e.stopPropagation(); handleAnswer(quality); }}
                                size="sm"
                                minW={{ base: "72px", md: "100px" }}
                                flexDirection="column"
                                h="auto" py={3} gap={1}
                                borderRadius="xl"
                                _hover={{ transform: "translateY(-2px)", shadow: "md" }}
                                transition="all 0.15s ease"
                            >
                                <Text fontSize="lg">{emoji}</Text>
                                <Text fontWeight="bold" fontSize="sm">{label}</Text>
                                <Text fontSize="xs" opacity={0.8} display={{ base: "none", md: "block" }}>{desc}</Text>
                            </Button>
                        ))}
                    </Flex>
                </Box>
            )}

            {/* ── Hint ── */}
            {!flipped && !answered && (
                <Flex align="center" gap={2} color="fg.subtle">
                    <Text fontSize="sm">Nghĩ xem, rồi click lật thẻ</Text>
                    <SpeakButton text={word.english} lang="en-US" label="Nghe lại" size="xs" />
                </Flex>
            )}
        </Flex>
    );
};

export default Flashcard;
