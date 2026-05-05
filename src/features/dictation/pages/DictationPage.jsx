import React, { useState } from "react";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { FiArrowLeft } from "react-icons/fi";
import BaseLayout from "../../../layouts/BaseLayout.jsx";
import InputStep from "../components/InputStep.jsx";
import TextExercise from "../components/TextExercise.jsx";
import YoutubeExercise from "../components/YoutubeExercise.jsx";

const DictationPage = () => {
    const [phase, setPhase] = useState("input");
    const [exerciseData, setExerciseData] = useState(null);

    const handleReady = (data) => { setExerciseData(data); setPhase("exercise"); };
    const handleReset = () => { setExerciseData(null); setPhase("input"); };

    const isYoutube = phase === "exercise" && exerciseData?.mode === "youtube";

    if (isYoutube) {
        return (
            <div style={{ width: "100%", height: "100vh", overflow: "hidden", display: "flex", flexDirection: "column", background: "var(--chakra-colors-bg-subtle, #F7FAFC)" }}>
                {/* Full-width exercise, no padding */}
                <div style={{ flex: 1, overflow: "hidden" }}>
                    <YoutubeExercise data={exerciseData} onReset={handleReset} />
                </div>
            </div>
        );
    }

    return (
        <BaseLayout>
            <Box maxW="1400px" mx="auto" transition="max-width 0.3s ease">
                {phase === "exercise" && (
                    <Flex mb={5} align="center" gap={2}>
                        <Button variant="ghost" size="sm" gap={1.5} color="fg.muted" _hover={{ color: "fg" }} onClick={handleReset}>
                            <FiArrowLeft size={15} />
                            <Text fontSize="sm">Quay lại</Text>
                        </Button>
                        <Box px={2.5} py={0.5} bg="blue.100" _dark={{ bg: "blue.900/30" }} borderRadius="full" color="blue.600" _dark2={{ color: "blue.300" }} fontSize="xs" fontWeight="700">
                            📄 Đoạn văn
                        </Box>
                        <Text fontSize="xs" color="fg.muted">{exerciseData?.total} câu</Text>
                    </Flex>
                )}

                {phase === "input" && <InputStep onReady={handleReady} />}
                {phase === "exercise" && exerciseData?.mode === "text" && (
                    <TextExercise data={exerciseData} onReset={handleReset} />
                )}
            </Box>
        </BaseLayout>
    );
};

export default DictationPage;
