import React, { useState } from "react";
import { Box, Flex, Text, Input, Button } from "@chakra-ui/react";
import { FiCheck, FiX } from "react-icons/fi";
import { speak } from "../../../shared/utils/speech.js";
import SpeakButton from "../../../shared/components/SpeakButton.jsx";

// Tạo câu ví dụ với ô trống thay thế từ cần điền
const createBlankSentence = (example, english) => {
    if (!example) return null;
    const regex = new RegExp(`\\b${english}\\b`, "gi");
    return example.replace(regex, "______");
};

const FillInBlank = ({ word, onAnswer, existingAnswer }) => {
    const [input, setInput] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [correct, setCorrect] = useState(false);
    const isFirstRender = React.useRef(true);

    React.useEffect(() => {
        if (!word?.example) return;
        const timer = setTimeout(() => {
            speak(word.example, "en-US", 0.9);
        }, isFirstRender.current ? 500 : 300);
        isFirstRender.current = false;
        return () => clearTimeout(timer);
    }, [word?._id]);

    // Reset when card changes
    React.useEffect(() => {
        setInput("");
        setSubmitted(false);
        setCorrect(false);
    }, [word?._id]);

    const blankSentence = createBlankSentence(word.example, word.english)
        || `What is the English word for "${word.vietnamese}"?`;

    const handleSubmit = () => {
        const isCorrect = input.trim().toLowerCase() === word.english.toLowerCase();
        setCorrect(isCorrect);
        setSubmitted(true);
    };

    const handleNext = () => {
        // Map fill-in result to quality string
        const quality = correct ? "GOOD" : "AGAIN";
        onAnswer(word.cardId, quality);
    };

    React.useEffect(() => {
        const handleKeyDown = (e) => {
            if (submitted) {
                if (e.key === "Enter" || e.code === "Space") {
                    e.preventDefault();
                    handleNext();
                }
            }
        };

        if (submitted) {
            window.addEventListener("keydown", handleKeyDown);
        }
        return () => window.removeEventListener("keydown", handleKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [submitted, correct, word?._id, input]);

    return (
        <Flex direction="column" align="center" w="full" maxW="620px" mx="auto" gap={6}>
            <Box
                bg="bg.panel"
                borderRadius="3xl"
                borderWidth="1px"
                borderColor="border.muted"
                shadow="lg"
                p={10}
                w="full"
                textAlign="center"
            >
                <Flex align="center" justify="center" gap={3} mb={6}>
                    <Text color="fg.muted" fontSize="xs" textTransform="uppercase" letterSpacing="wider">
                        Điền từ còn thiếu
                    </Text>
                    {word.example && (
                        <SpeakButton text={word.example} lang="en-US" size="xs" label="Nghe lại câu ví dụ" />
                    )}
                </Flex>
                <Text fontSize="xl" fontWeight="medium" mb={8} lineHeight="tall">
                    {blankSentence.split("______").map((part, i, arr) => (
                        <React.Fragment key={i}>
                            {part}
                            {i < arr.length - 1 && (
                                <Box
                                    as="span"
                                    display="inline-block"
                                    minW="100px"
                                    borderBottomWidth="2px"
                                    borderColor={submitted ? (correct ? "green.400" : "red.400") : "blue.400"}
                                    mx={1}
                                    px={2}
                                    color={submitted ? (correct ? "green.500" : "red.500") : "fg"}
                                    fontWeight="bold"
                                >
                                    {submitted ? word.english : (input || " ")}
                                </Box>
                            )}
                        </React.Fragment>
                    ))}
                </Text>

                {!submitted ? (
                    <Flex gap={3} justify="center">
                        <Input
                            placeholder="Gõ từ tiếng Anh..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter" && input.trim()) handleSubmit(); }}
                            maxW="280px"
                            textAlign="center"
                            fontSize="lg"
                            fontWeight="medium"
                            borderRadius="xl"
                        />
                        <Button colorPalette="blue" onClick={handleSubmit} disabled={!input.trim()}>
                            Kiểm tra
                        </Button>
                    </Flex>
                ) : (
                    <Flex direction="column" align="center" gap={4}>
                        <Flex
                            align="center" gap={2} px={5} py={3} borderRadius="xl"
                            bg={correct ? "green.50" : "red.50"}
                            _dark={{ bg: correct ? "green.900/30" : "red.900/30" }}
                        >
                            {correct ? <FiCheck color="var(--chakra-colors-green-500)" /> : <FiX color="var(--chakra-colors-red-500)" />}
                            <Text fontWeight="bold" color={correct ? "green.600" : "red.600"}>
                                {correct ? "Chính xác! 🎉" : `Đáp án đúng: ${word.english}`}
                            </Text>
                        </Flex>
                        {word.vietnamese && (
                            <Text color="fg.muted" fontSize="sm">Nghĩa: {word.vietnamese}</Text>
                        )}
                        <Button colorPalette={correct ? "green" : "blue"} onClick={handleNext} mt={2}>
                            Từ tiếp theo →
                        </Button>
                    </Flex>
                )}
            </Box>
        </Flex>
    );
};

export default FillInBlank;
