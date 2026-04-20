import React, { useEffect, useState } from "react";
import { Box, Flex, Text, Button, Spinner, IconButton } from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiLogOut } from "react-icons/fi";
import { FaFire } from "react-icons/fa";
import { useStudyStore } from "../../../stores/useStudyStore.js";
import { useVocabularyStore } from "../../../stores/useVocabularyStore.js";
import { useAuthStore } from "../../../stores/useAuthStore.js";
import Flashcard from "../components/Flashcard.jsx";
import FillInBlank from "../components/FillInBlank.jsx";
import StudyComplete from "../components/StudyComplete.jsx";
import StudySidebarStats from "../components/StudySidebarStats.jsx";
import StudySidebarShortcuts from "../components/StudySidebarShortcuts.jsx";

const StudyPage = () => {
    const { setId } = useParams();
    const navigate = useNavigate();

    const { user, logout } = useAuthStore();
    const [showDropdown, setShowDropdown] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const {
        currentSetId, queue, currentIndex, mode, loading, sessionComplete, reviewedCount,
        startSession, submitCard, setMode, streakInfo
    } = useStudyStore();

    const { wordSets, fetchWordSets } = useVocabularyStore();
    const currentSet = wordSets.find((s) => s._id === setId);

    useEffect(() => {
        if (!wordSets.length) fetchWordSets();
        
        // Prevent F5 reload from wiping an active session
        if (currentSetId === setId && queue.length > 0 && !sessionComplete) {
            return;
        }

        startSession(setId, "flashcard");
    }, [setId, currentSetId, queue.length, sessionComplete]);

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
        <Box minH="100vh" bg="bg.main" p={{ base: 4, md: 8 }}>
            
            {/* Header / Navbar */}
            <Flex
                align="center" justify="space-between" mb={8}
                maxW="1300px" mx="auto" bg="bg.panel" p={3} px={6}
                borderRadius="2xl" borderWidth="1px" borderColor="border.subtle" shadow="sm"
            >
                {/* Left: Tên bộ thẻ */}
                <Flex align="center" gap={4} flex={1}>
                    <IconButton variant="ghost" size="sm" onClick={() => navigate(`/sets/${setId}`)} _hover={{ bg: "bg.subtle" }}>
                        <FiArrowLeft size={18} />
                    </IconButton>
                    <Box>
                        <Text fontWeight="bold" fontSize="lg" color="fg">{currentSet?.title || "Học từ vựng"}</Text>
                        <Text fontSize="xs" fontWeight="medium" color="fg.muted" letterSpacing="wide">
                            {queue.length > 0 ? `${queue.length} THẺ HÔM NAY` : "ĐANG TẢI"}
                        </Text>
                    </Box>
                </Flex>

                {/* Center: Mode switcher */}
                <Flex justify="center" flex={1}>
                    <Flex
                        bg="bg.subtle" borderRadius="xl" p={1}
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
                                fontWeight="bold"
                            >
                                {label}
                            </Button>
                        ))}
                    </Flex>
                </Flex>

                {/* Right: User Info & Streak */}
                <Flex align="center" justify="flex-end" gap={4} flex={1}>
                    {/* Streak badge */}
                    <Flex
                        align="center" gap={1.5}
                        px={3} py={1.5}
                        borderRadius="lg"
                        bg="warning.bg"
                        borderWidth="1px"
                        borderColor="border.muted"
                        className="streak-badge"
                    >
                        <style>{`
                            .streak-badge { border-color: var(--chakra-colors-border-muted); }
                            .dark .streak-badge { border-color: rgba(251,146,60,0.2); }
                        `}</style>
                        <Box as={FaFire} color="orange.400" fontSize="sm" />
                        <Text fontSize="sm" fontWeight="bold" color="orange.500">{streakInfo?.currentStreak ?? 0}</Text>
                        <Text fontSize="xs" color="fg.muted">streak</Text>
                    </Flex>

                    <Box position="relative">
                        <Flex 
                            as="button" 
                            onClick={() => setShowDropdown(!showDropdown)} 
                            align="center" justify="center" 
                            w="36px" h="36px" bg="blue.500" color="white" 
                            borderRadius="full" shadow="sm" fontWeight="bold"
                            cursor="pointer"
                            transition="all 0.2s"
                            _hover={{ bg: "blue.600" }}
                        >
                            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                        </Flex>
                        {showDropdown && (
                            <Box 
                                position="absolute" right={0} top="45px" 
                                bg="bg.panel" py={2} shadow="md" 
                                borderRadius="lg" borderWidth="1px" borderColor="border.subtle" 
                                w="150px" zIndex={10}
                            >
                                <Button variant="ghost" w="full" justifyContent="flex-start" color="red.500" onClick={handleLogout} px={4}>
                                    <FiLogOut style={{ marginRight: '8px' }} /> Đăng xuất
                                </Button>
                            </Box>
                        )}
                    </Box>
                </Flex>
            </Flex>

            {/* 3-Column Content Layout */}
            <Flex maxW="1300px" mx="auto" justify="center" alignItems="flex-start">
                
                {/* Left Sidebar - Stats */}
                <Box display={{ base: "none", xl: "block" }} w="280px" mr={10} flexShrink={0} position="sticky" top="100px">
                    <StudySidebarStats reviewedCount={reviewedCount} queueLength={queue.length} />
                </Box>

                {/* Main Study Area */}
                <Box w="full" maxW="800px">
                    {/* Card */}
                    {currentWord ? (
                        mode === "flashcard" ? (
                            <Flashcard word={currentWord} onAnswer={handleAnswer} />
                        ) : (
                            <FillInBlank word={currentWord} onAnswer={handleAnswer} />
                        )
                    ) : (
                        <Flex justify="center" py={20} color="fg.muted" bg="bg.panel" borderRadius="2xl" shadow="sm">
                            <Text fontWeight="medium">Không có thẻ nào cần học. Hãy thêm từ vựng trước!</Text>
                        </Flex>
                    )}
                </Box>

                {/* Right Sidebar - Shortcuts */}
                <Box display={{ base: "none", xl: "block" }} w="280px" ml={10} flexShrink={0} position="sticky" top="100px">
                    <StudySidebarShortcuts />
                </Box>
            </Flex>
        </Box>
    );
};

export default StudyPage;