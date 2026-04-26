import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import { Box, Flex, Text, Button, Badge } from "@chakra-ui/react";
import { speak } from "../../../shared/utils/speech.js";
import SpeakButton from "../../../shared/components/SpeakButton.jsx";

const QUALITY_BUTTONS = [
    {
        quality: "AGAIN",
        label: "Again",
        emoji: "❌",
        desc: "Không nhớ",
        color: "red",
        key: "1",
    },
    {
        quality: "HARD",
        label: "Hard",
        emoji: "😓",
        desc: "Rất khó",
        color: "orange",
        key: "2",
    },
    {
        quality: "GOOD",
        label: "Good",
        emoji: "👍",
        desc: "Nhớ được",
        color: "blue",
        key: "3",
    },
    {
        quality: "EASY",
        label: "Easy",
        emoji: "✅",
        desc: "Dễ dàng",
        color: "green",
        key: "4",
    },
];

const LEVEL_COLORS = ["gray", "orange", "yellow", "blue", "purple", "green"];

const Flashcard = ({ word, onAnswer, existingAnswer }) => {
    const [flipped, setFlipped] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const isFirstRender = useRef(true);
    const rafRef = useRef(null);

    // Auto-read when new word appears
    useEffect(() => {
        if (!word?.english) return;
        const timer = setTimeout(
            () => speak(word.english, "en-US", 0.9),
            isFirstRender.current ? 500 : 300
        );
        isFirstRender.current = false;
        return () => clearTimeout(timer);
    }, [word?._id]);

    // Reset flip instantly (no animation) when card changes.
    // useLayoutEffect fires synchronously before paint — React batches the two
    // state updates into a single render, so the browser NEVER sees the new
    // card's back face, not even for one frame.
    useLayoutEffect(() => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        setIsResetting(true);
        setFlipped(false);
        rafRef.current = requestAnimationFrame(() => {
            setIsResetting(false);
            rafRef.current = null;
        });
        return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    }, [word?._id]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;

            if (e.code === "Space") {
                e.preventDefault();
                setFlipped((v) => !v);
            }

            if (flipped) {
                const btn = QUALITY_BUTTONS.find((b) => b.key === e.key);
                if (btn) {
                    e.preventDefault();
                    onAnswer(word.cardId, btn.quality);
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [flipped, word?._id]);

    const handleCardClick = useCallback(() => {
        setFlipped((v) => !v);
    }, []);

    const srsLevel = word?.srs?.level ?? 0;
    const srsStatus = word?.srs?.status ?? "NEW";

    return (
        <Flex direction="column" align="center" w="full" maxW="800px" mx="auto">
            {/* ── Card 3D ── */}
            <Box
                w="full"
                h={{ base: "340px", md: "420px" }}
                cursor="pointer"
                onClick={handleCardClick}
                style={{ perspective: "1200px" }}
                mb={6}
                userSelect="none"
            >
                <Box
                    w="full"
                    h="full"
                    position="relative"
                    style={{
                        transformStyle: "preserve-3d",
                        transition: isResetting ? "none" : "transform 0.55s cubic-bezier(0.4,0,0.2,1)",
                        transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
                    }}
                >
                    {/* ── Front: English ── */}
                    <Box
                        position="absolute"
                        inset={0}
                        bg="bg.panel"
                        borderRadius="3xl"
                        borderWidth="1.5px"
                        borderColor={flipped ? "border.muted" : "brand.solid"}
                        shadow="xl"
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                        p={8}
                        style={{ backfaceVisibility: "hidden" }}
                        transition="border-color 0.3s"
                    >
                        {/* SRS level badge */}
                        <Flex position="absolute" top={4} left={4} gap={2}>
                            {srsStatus === "NEW" ? (
                                <Badge colorPalette="cyan" variant="solid" fontSize="xs" px={2} borderRadius="md">
                                    ✨ TỪ MỚI
                                </Badge>
                            ) : (
                                <Flex gap={2}>
                                    <Badge colorPalette="orange" variant="solid" fontSize="xs" px={2} borderRadius="md">
                                        🔥 CẦN ÔN TẬP
                                    </Badge>
                                    <Badge
                                        colorPalette={LEVEL_COLORS[srsLevel]}
                                        variant="subtle"
                                        fontSize="xs"
                                        px={2}
                                        borderRadius="md"
                                        fontWeight="bold"
                                    >
                                        Level {srsLevel}
                                    </Badge>
                                </Flex>
                            )}
                        </Flex>

                        <Box position="absolute" top={4} right={4}>
                            <SpeakButton text={word.english} lang="en-US" label="Nghe từ tiếng Anh" />
                        </Box>

                        {word.level && (
                            <Badge
                                colorPalette="purple"
                                variant="subtle"
                                fontSize="xs"
                                px={2}
                                borderRadius="md"
                                fontWeight="bold"
                                mb={4}
                            >
                                {word.level}
                            </Badge>
                        )}

                        <Text
                            color="fg.subtle"
                            fontSize="sm"
                            fontWeight="600"
                            textTransform="uppercase"
                            letterSpacing="wider"
                            mb={4}
                        >
                            🇬🇧 Tiếng Anh
                        </Text>
                        <Text
                            fontSize={{ base: "4xl", md: "6xl" }}
                            fontWeight="extrabold"
                            textAlign="center"
                            mb={2}
                            color="fg"
                        >
                            {word.english}
                        </Text>

                        {(word.pronunciation || word.partOfSpeech) && (
                            <Flex gap={3} align="center" mb={3}>
                                {word.partOfSpeech && (
                                    <Badge colorPalette="blue" variant="subtle" px={2} py={1} fontSize="sm">
                                        {word.partOfSpeech}
                                    </Badge>
                                )}
                                {word.pronunciation && (
                                    <Text fontSize="lg" color="fg.muted" fontStyle="italic">
                                        {word.pronunciation}
                                    </Text>
                                )}
                            </Flex>
                        )}

                        {word.synonyms?.length > 0 && (
                            <Text fontSize="sm" color="fg.muted" mt={2} textAlign="center">
                                ≈ {word.synonyms.slice(0, 3).join(" · ")}
                            </Text>
                        )}

                        <Text fontSize="xs" color="fg.subtle" mt={8} opacity={0.6}>
                            {flipped ? "👆 Click để lật lại" : "👆 Click để xem nghĩa"}
                        </Text>
                    </Box>

                    {/* ── Back: Vietnamese ── */}
                    <Box
                        position="absolute"
                        inset={0}
                        bg="brand.muted"
                        borderRadius="3xl"
                        borderWidth="1.5px"
                        borderColor="brand.solid"
                        shadow="xl"
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                        p={8}
                        style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                    >
                        <Box position="absolute" top={4} right={4}>
                            <SpeakButton text={word.vietnamese} lang="vi-VN" label="Nghe nghĩa tiếng Việt" />
                        </Box>
                        <Box position="absolute" top={4} left={4}>
                            <Text fontSize="xs" color="brand.text" opacity={0.8}>
                                ↩ Click để lật lại
                            </Text>
                        </Box>

                        <Text
                            color="brand.text"
                            fontSize="sm"
                            fontWeight="600"
                            textTransform="uppercase"
                            letterSpacing="wider"
                            mb={5}
                        >
                            🇻🇳 Nghĩa tiếng Việt
                        </Text>
                        <Text
                            fontSize={{ base: "3xl", md: "5xl" }}
                            fontWeight="extrabold"
                            color="fg"
                            textAlign="center"
                            mb={6}
                        >
                            {word.vietnamese}
                        </Text>
                        {word.example && (
                            <Box
                                bg="bg.panel"
                                borderRadius="xl"
                                borderWidth="1px"
                                borderColor="border.subtle"
                                p={4}
                                w="full"
                                mt={2}
                                shadow="sm"
                            >
                                <Flex align="flex-start" gap={3}>
                                    <Box flex={1} textAlign="center">
                                        <Text
                                            fontSize="md"
                                            color="fg"
                                            fontStyle="italic"
                                            lineHeight="tall"
                                        >
                                            "{word.example}"
                                        </Text>
                                        {word.exampleTranslation && (
                                            <Text
                                                fontSize="sm"
                                                color="fg.muted"
                                                mt={1.5}
                                                lineHeight="base"
                                            >
                                                {word.exampleTranslation}
                                            </Text>
                                        )}
                                    </Box>
                                    <SpeakButton text={word.example} lang="en-US" size="sm" label="Nghe ví dụ" />
                                </Flex>
                            </Box>
                        )}
                    </Box>
                </Box>
            </Box>

            {/* ── Quality Buttons (always shown, but highlighted after flip) ── */}
            <Box w="full">
                {existingAnswer && (
                    <Flex justify="center" mb={3} align="center" gap={2}>
                        <Text fontSize="sm" color="fg.muted">Đã chọn:</Text>
                        <Badge
                            colorPalette={
                                QUALITY_BUTTONS.find((b) => b.quality === existingAnswer)?.color
                            }
                            variant="solid"
                            px={3}
                            py={1}
                            borderRadius="lg"
                            fontWeight="bold"
                        >
                            {existingAnswer}
                        </Badge>
                        <Text fontSize="xs" color="fg.subtle">(có thể thay đổi)</Text>
                    </Flex>
                )}

                {!flipped && !existingAnswer && (
                    <Text textAlign="center" fontSize="sm" color="fg.subtle" mb={3}>
                        Lật thẻ trước khi đánh giá
                    </Text>
                )}

                <Flex gap={2} justify="center" flexWrap="wrap">
                    {QUALITY_BUTTONS.map(({ quality, label, emoji, desc, color, key }) => {
                        const isSelected = existingAnswer === quality;
                        return (
                            <Button
                                key={quality}
                                colorPalette={color}
                                variant={isSelected ? "solid" : flipped ? "outline" : "ghost"}
                                onClick={() => onAnswer(word.cardId, quality)}
                                size="sm"
                                minW={{ base: "70px", md: "100px" }}
                                flexDirection="column"
                                h="auto"
                                py={3}
                                gap={0.5}
                                borderRadius="xl"
                                opacity={!flipped && !existingAnswer ? 0.4 : 1}
                                _hover={{ transform: "translateY(-2px)", shadow: "md" }}
                                transition="all 0.15s ease"
                                title={`Phím ${key}`}
                            >
                                <Text fontSize="lg">{emoji}</Text>
                                <Text fontWeight="bold" fontSize="sm">{label}</Text>
                                <Text fontSize="xs" opacity={0.8} display={{ base: "none", md: "block" }}>
                                    {desc}
                                </Text>
                            </Button>
                        );
                    })}
                </Flex>
            </Box>

            {/* ── Hint ── */}
            {!flipped && (
                <Flex align="center" gap={2} color="fg.subtle" mt={4}>
                    <Text fontSize="sm">Nghĩ xem, rồi click lật thẻ</Text>
                    <SpeakButton text={word.english} lang="en-US" label="Nghe lại" size="xs" />
                </Flex>
            )}
        </Flex>
    );
};

export default Flashcard;
