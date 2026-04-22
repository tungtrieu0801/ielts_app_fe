import React, { useState } from "react";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { FiArrowLeft } from "react-icons/fi";
import BaseLayout from "../../../layouts/BaseLayout.jsx";
import InputStep from "../components/InputStep.jsx";
import TextExercise from "../components/TextExercise.jsx";
import YoutubeExercise from "../components/YoutubeExercise.jsx";

/**
 * DictationPage — top-level page for the Dictation feature.
 *
 * State machine:
 *   "input"    → InputStep (user pastes text / YouTube URL)
 *   "exercise" → TextExercise | YoutubeExercise
 */
const DictationPage = () => {
    const [phase, setPhase] = useState("input");      // "input" | "exercise"
    const [exerciseData, setExerciseData] = useState(null);
    // exerciseData: { mode:"text"|"youtube", exercises:[], total, videoId? }

    const handleReady = (data) => {
        setExerciseData(data);
        setPhase("exercise");
    };

    const handleReset = () => {
        setExerciseData(null);
        setPhase("input");
    };

    return (
        <BaseLayout>
            <Box
                maxW={
                    phase === "exercise" && exerciseData?.mode === "youtube"
                        ? "1200px"
                        : "860px"
                }
                mx="auto"
                transition="max-width 0.3s ease"
            >

                {/* Back button while in exercise */}
                {phase === "exercise" && (
                    <Flex mb={5} align="center" gap={2}>
                        <Button
                            variant="ghost" size="sm" gap={1.5}
                            color="fg.muted"
                            _hover={{ color: "fg" }}
                            onClick={handleReset}
                        >
                            <FiArrowLeft size={15} />
                            <Text fontSize="sm">Quay lại</Text>
                        </Button>

                        {/* Mode badge */}
                        <Box
                            px={2.5} py={0.5}
                            bg={exerciseData?.mode === "youtube" ? "red.100" : "blue.100"}
                            _dark={{
                                bg: exerciseData?.mode === "youtube"
                                    ? "red.900/30"
                                    : "blue.900/30",
                            }}
                            borderRadius="full"
                            color={exerciseData?.mode === "youtube" ? "red.600" : "blue.600"}
                            _dark={{
                                color: exerciseData?.mode === "youtube"
                                    ? "red.300"
                                    : "blue.300",
                            }}
                            fontSize="xs" fontWeight="700"
                        >
                            {exerciseData?.mode === "youtube"
                                ? "▶️ YouTube"
                                : "📄 Đoạn văn"}
                        </Box>

                        <Text fontSize="xs" color="fg.muted">
                            {exerciseData?.total} câu
                        </Text>
                    </Flex>
                )}

                {/* Phase routing */}
                {phase === "input" && (
                    <InputStep onReady={handleReady} />
                )}

                {phase === "exercise" && exerciseData?.mode === "text" && (
                    <TextExercise data={exerciseData} onReset={handleReset} />
                )}

                {phase === "exercise" && exerciseData?.mode === "youtube" && (
                    <YoutubeExercise data={exerciseData} onReset={handleReset} />
                )}
            </Box>
        </BaseLayout>
    );
};

export default DictationPage;
