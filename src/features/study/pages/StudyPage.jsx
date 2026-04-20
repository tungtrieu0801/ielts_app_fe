import React, { useEffect } from "react";
import { Box, Flex, Text, Button, Spinner, IconButton } from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { useStudyStore } from "../../../stores/useStudyStore.js";
import { useVocabularyStore } from "../../../stores/useVocabularyStore.js";
import Flashcard from "../components/Flashcard.jsx";
import FillInBlank from "../components/FillInBlank.jsx";
import StudyProgress from "../components/StudyProgress.jsx";
import StudyComplete from "../components/StudyComplete.jsx";
import StudySidebarStats from "../components/StudySidebarStats.jsx";
import StudySidebarShortcuts from "../components/StudySidebarShortcuts.jsx";

const StudyPage = () => {
    const { setId } = useParams();
    const navigate = useNavigate();

    const {
        queue, currentIndex, mode, loading, sessionComplete, reviewedCount,
        startSession, submitCard, setMode,
    } = useStudyStore();

    const { wordSets, fetchWordSets } = useVocabularyStore();
    const currentSet = wordSets.find((s) => s._id === setId);

    useEffect(() => {
        if (!wordSets.length) fetchWordSets();
        startSession(setId, "flashcard");
    }, [setId]);

    const currentWord = queue[currentIndex];

    const handleAnswer = async (wordId, quality) => {
        await submitCard(wordId, quality);
    };

    if (loading) {
        return (
            <Flex h="100vh" align="center" justify="center" direction="column" gap={4}>
                <Spinner size="xl" color="blue.500" />
                <Text color="fg.muted">Đang tải session học...</Text>
            </Flex>
        );
    }

    if (sessionComplete) {
        return (
            <Box p={8}>
                <StudyComplete
                    reviewedCount={reviewedCount}
                    setId={setId}
                    setTitle={currentSet?.title}
                />
            </Box>
        );
    }

    return (
        <Flex minH="100vh" bg="bg.main" justify="center" p={{ base: 4, md: 8 }}>
            
            {/* Left Sidebar - Stats */}
            <Box display={{ base: "none", xl: "block" }} w="280px" mr={10} flexShrink={0}>
                <StudySidebarStats reviewedCount={reviewedCount} queueLength={queue.length} />
            </Box>

            <Box w="full" maxW="800px">
                {/* Header */}
                <Flex align="center" justify="space-between" mb={8}>
                    <Flex align="center" gap={3}>
                        <IconButton variant="ghost" size="sm" onClick={() => navigate(`/sets/${setId}`)}>
                            <FiArrowLeft />
                        </IconButton>
                        <Box>
                            <Text fontWeight="bold">{currentSet?.title || "Học từ vựng"}</Text>
                            <Text fontSize="xs" color="fg.muted">
                                {queue.length > 0 ? `${queue.length} thẻ hôm nay` : ""}
                            </Text>
                        </Box>
                    </Flex>

                    {/* Mode switcher */}
                    <Flex
                        bg="bg.panel" borderRadius="xl" p={1}
                        borderWidth="1px" borderColor="border.muted"
                        gap={1}
                    >
                        {[
                            { key: "flashcard", label: "🃏 Flashcard" },
                            { key: "fill", label: "✏️ Fill-in" },
                        ].map(({ key, label }) => (
                            <Button
                                key={key}
                                size="sm"
                                variant={mode === key ? "solid" : "ghost"}
                                colorPalette={mode === key ? "blue" : "gray"}
                                onClick={() => setMode(key)}
                                borderRadius="lg"
                            >
                                {label}
                            </Button>
                        ))}
                    </Flex>
                </Flex>

                {/* Main Study Area */}
                <Box>
                    {/* Progress */}
                    <StudyProgress current={currentIndex} total={queue.length} />

                    {/* Card */}
                    {currentWord ? (
                        mode === "flashcard" ? (
                            <Flashcard word={currentWord} onAnswer={handleAnswer} />
                        ) : (
                            <FillInBlank word={currentWord} onAnswer={handleAnswer} />
                        )
                    ) : (
                        <Flex justify="center" py={20} color="fg.muted">
                            <Text>Không có thẻ nào cần học. Hãy thêm từ vựng trước!</Text>
                        </Flex>
                    )}
                </Box>
            </Box>

            {/* Right Sidebar - Shortcuts */}
            <Box display={{ base: "none", xl: "block" }} w="280px" ml={10} flexShrink={0}>
                <StudySidebarShortcuts />
            </Box>
        </Flex>
    );
};

export default StudyPage;