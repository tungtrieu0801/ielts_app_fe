import React, { useState, useEffect, useRef } from "react";
import { Box, Flex, Text, Input, Button, Badge, Icon, VStack, IconButton, Grid } from "@chakra-ui/react";
import { FiCheck, FiX, FiHeadphones, FiHelpCircle, FiEye, FiVolume2 } from "react-icons/fi";
import { speak } from "../../../shared/utils/speech.js";

const ListenType = ({ word, onAnswer }) => {
    const [input, setInput] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [correct, setCorrect] = useState(false);
    const [hintLevel, setHintLevel] = useState(0); // 0: none, 1: example, 2: 1st letter, 3: full hint
    const [showExample, setShowExample] = useState(false);
    const inputRef = useRef(null);

    // Auto-play sound on load
    useEffect(() => {
        const timer = setTimeout(() => {
            speak(word.english);
        }, 600);
        return () => clearTimeout(timer);
    }, [word?._id]);

    // Reset when word changes
    useEffect(() => {
        setInput("");
        setSubmitted(false);
        setCorrect(false);
        setHintLevel(0);
        setShowExample(false);

        // Auto focus input when word changes
        setTimeout(() => {
            inputRef.current?.focus();
        }, 100);
    }, [word?._id]);

    const handleSubmit = () => {
        if (!input.trim() || submitted) return;
        const isCorrect = input.trim().toLowerCase() === word.english.toLowerCase();
        setCorrect(isCorrect);
        setSubmitted(true);
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
            // Ctrl: Re-play audio
            if (e.key === "Control") {
                e.preventDefault();
                speak(word.english);
            }
            // Ctrl + E: Toggle example
            if (e.key === "e" && e.ctrlKey) {
                e.preventDefault();
                setShowExample(v => !v);
            }
            // Ctrl + Space: Hint
            if (e.code === "Space" && e.ctrlKey) {
                e.preventDefault();
                handleHint();
            }
            // Enter: Submit or Next
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
                    <Box w="6px" h="6px" borderRadius="full" bg="green.400" />
                    <Text fontSize="10px" fontWeight="800" color="green.600" letterSpacing="1px" textTransform="uppercase">
                        Nghe & Gõ từ
                    </Text>
                </Flex>

                <VStack gap={6} mb={8} mt={2}>
                    {/* Compact Audio Icon */}
                    <Box position="relative">
                        <Box 
                            p={6} bg="green.500" borderRadius="2xl" color="white" 
                            cursor="pointer" onClick={() => speak(word.english)}
                            _hover={{ transform: "translateY(-2px)", bg: "green.600" }}
                            transition="all 0.2s"
                            shadow="lg"
                        >
                            <FiHeadphones size={32} />
                        </Box>
                        <Badge 
                            position="absolute" bottom="-8px" left="50%" transform="translateX(-50%)"
                            bg="gray.800" _dark={{ bg: "white", color: "black" }} color="white" 
                            fontSize="8px" px={2} borderRadius="full" fontWeight="900"
                        >
                            CTRL
                        </Badge>
                    </Box>

                    <Box>
                        <Text fontSize="lg" fontWeight="800" color="fg">
                            Nghe và gõ lại từ vựng
                        </Text>
                        {hintLevel > 0 && (
                            <Text mt={1} color="brand.solid" letterSpacing="3px" fontSize="md" fontWeight="bold">
                                {getHintText()}
                            </Text>
                        )}
                    </Box>
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
                        <Input
                            ref={inputRef}
                            placeholder="Type what you hear..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            size="lg"
                            textAlign="center"
                            fontSize="xl"
                            fontWeight="bold"
                            borderRadius="xl"
                            h="56px"
                            maxW="320px"
                            bg="bg.subtle"
                            _focus={{ borderColor: "green.400", bg: "bg.panel" }}
                        />
                        
                        <Flex gap={2} w="full" justify="center" flexWrap="wrap">
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
                                colorPalette="green" size="md" borderRadius="xl" px={8}
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
                                    {correct ? "Chính xác!" : "Chưa đúng rồi"}
                                </Text>
                            </Flex>
                            <Text fontSize="3xl" fontWeight="900" color="brand.solid" letterSpacing="1px">
                                {word.english}
                            </Text>
                            {word.vietnamese && <Text fontSize="sm" fontWeight="bold">({word.vietnamese})</Text>}
                        </Box>

                        <Button 
                            colorPalette="blue" size="lg" w="full" borderRadius="xl" 
                            onClick={handleNext} fontWeight="800"
                        >
                            Từ tiếp theo (Enter)
                        </Button>
                    </VStack>
                )}
            </Box>
        </Flex>
    );
};

export default ListenType;
