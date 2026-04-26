import React, { useState, useEffect, useRef } from "react";
import { Box, Flex, Text, Input, Button, Badge, Icon, VStack, Grid, IconButton } from "@chakra-ui/react";
import { FiCheck, FiX, FiHelpCircle, FiEye, FiType, FiVolume2 } from "react-icons/fi";
import { speak } from "../../../shared/utils/speech.js";

const ReadType = ({ word, onAnswer }) => {
    const [input, setInput] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [correct, setCorrect] = useState(false);
    const [hintLevel, setHintLevel] = useState(0);
    const [showExample, setShowExample] = useState(false);
    const inputRef = useRef(null);

    // Reset when word changes
    useEffect(() => {
        setInput("");
        setSubmitted(false);
        setCorrect(false);
        setHintLevel(0);
        setShowExample(false);
        setTimeout(() => {
            inputRef.current?.focus();
        }, 100);
    }, [word?._id]);

    const handleSubmit = () => {
        if (!input.trim() || submitted) return;
        const isCorrect = input.trim().toLowerCase() === word.english.toLowerCase();
        setCorrect(isCorrect);
        setSubmitted(true);
        if (isCorrect) speak(word.english);
    };

    const handleNext = () => {
        const quality = correct ? (hintLevel > 0 ? "GOOD" : "EASY") : "AGAIN";
        onAnswer(word.cardId, quality);
    };

    const handleHint = () => {
        if (hintLevel < 3) setHintLevel(v => v + 1);
        if (hintLevel === 0) setShowExample(true);
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Control") {
                e.preventDefault();
                speak(word.english);
            }
            if (e.key === "e" && e.ctrlKey) {
                e.preventDefault();
                setShowExample(v => !v);
            }
            if (e.code === "Space" && e.ctrlKey) {
                e.preventDefault();
                handleHint();
            }
            if (e.key === "Enter") {
                if (submitted) {
                    handleNext();
                } else if (input.trim()) {
                    handleSubmit();
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [word, input, submitted, hintLevel, correct]);

    const getHintText = () => {
        if (hintLevel >= 2) {
            const letters = word.english.split("");
            return letters.map((l, i) => (i === 0 || hintLevel === 3 ? l : "_")).join(" ");
        }
        return "Chưa có gợi ý";
    };

    // Progress feedback: is user on the right track?
    const isOnRightTrack = input.length > 0 && word.english.toLowerCase().startsWith(input.toLowerCase());

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
                {/* Header info */}
                <Flex position="absolute" top={4} left={4} gap={2} align="center">
                    <Box w="6px" h="6px" borderRadius="full" bg="blue.400" />
                    <Text fontSize="10px" fontWeight="800" color="blue.600" letterSpacing="1px" textTransform="uppercase">
                        Gõ từ theo nghĩa
                    </Text>
                </Flex>

                <VStack gap={4} mb={8} mt={2}>
                    <Text fontSize="10px" color="fg.muted" fontWeight="800" textTransform="uppercase" letterSpacing="widest">
                        Nghĩa của từ vựng
                    </Text>
                    <Text fontSize="3xl" fontWeight="900" color="fg" lineHeight="1.1" letterSpacing="-0.5px">
                        {word.vietnamese}
                    </Text>
                    {word.partOfSpeech && (
                        <Badge colorPalette="blue" variant="solid" px={3} py={0.5} borderRadius="full" fontSize="xs">
                            {word.partOfSpeech}
                        </Badge>
                    )}
                    {hintLevel > 0 && (
                        <Text fontSize="md" color="brand.solid" fontWeight="bold" letterSpacing="3px">
                            {getHintText()}
                        </Text>
                    )}
                </VStack>

                {showExample && word.example && (
                    <Box bg="bg.subtle" p={4} borderRadius="xl" mb={6} border="1px dashed" borderColor="border.strong">
                        <Text fontStyle="italic" color="fg" fontSize="sm">
                            "{word.example.replace(new RegExp(word.english, 'gi'), '______')}"
                        </Text>
                    </Box>
                )}

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
                                    bg: "bg.panel"
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
                                leftIcon={<FiEye />}
                            >
                                Ví dụ (Ctrl+E)
                            </Button>

                            <Button
                                variant="ghost" size="sm" borderRadius="lg"
                                onClick={handleHint}
                                disabled={hintLevel >= 3}
                                leftIcon={<FiHelpCircle />}
                            >
                                Gợi ý (Ctrl+Space)
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
                    <VStack gap={6}>
                        <Box
                            p={6} borderRadius="2xl" w="full"
                            bg={correct ? "green.50" : "red.50"}
                            borderWidth="1px"
                            borderColor={correct ? "green.200" : "red.200"}
                            _dark={{ bg: correct ? "green.900/20" : "red.900/20" }}
                        >
                            <Flex align="center" gap={3} justify="center" mb={3}>
                                <Icon as={correct ? FiCheck : FiX} boxSize={6} color={correct ? "green.500" : "red.500"} />
                                <Text fontSize="xl" fontWeight="800" color={correct ? "green.600" : "red.600"}>
                                    {correct ? "Chính xác!" : "Sai rồi bạn ơi"}
                                </Text>
                            </Flex>

                            <Flex align="center" gap={3} justify="center">
                                <Text fontSize="3xl" fontWeight="900" color="brand.solid" letterSpacing="1px">
                                    {word.english}
                                </Text>
                                <IconButton
                                    icon={<FiVolume2 />} size="sm" colorPalette="blue" borderRadius="full" variant="subtle"
                                    onClick={() => speak(word.english)}
                                />
                            </Flex>
                            {word.pronunciation && (
                                <Text fontSize="md" color="fg.muted" fontStyle="italic" mt={1}>
                                    {word.pronunciation}
                                </Text>
                            )}
                        </Box>

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
