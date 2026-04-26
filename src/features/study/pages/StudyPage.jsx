import React, { useEffect, useState } from "react";
import {
    Box,
    Flex,
    Text,
    Button,
    Spinner,
    IconButton,
    Progress,
    Badge,
} from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiArrowRight, FiLogOut, FiSend, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { FaFire } from "react-icons/fa";
import { useStudyStore } from "../../../stores/useStudyStore.js";
import { useVocabularyStore } from "../../../stores/useVocabularyStore.js";
import { useAuthStore } from "../../../stores/useAuthStore.js";
import Flashcard from "../components/Flashcard.jsx";
import FillInBlank from "../components/FillInBlank.jsx";
import StudyComplete from "../components/StudyComplete.jsx";

const StudyPage = () => {
    const { setId } = useParams();
    const navigate = useNavigate();

    const { user, logout } = useAuthStore();
    const [showDropdown, setShowDropdown] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const {
        currentSetId,
        queue,
        currentIndex,
        mode,
        loading,
        submitting,
        sessionComplete,
        submitResult,
        answers,
        nextReviewAt,
        startSession,
        startGlobalSession,
        answerCard,
        goToCard,
        setMode,
        submitSession,
        resetSession,
        streakInfo,
    } = useStudyStore();

    const { wordSets, fetchWordSets } = useVocabularyStore();
    const currentSet = setId === "global" ? { title: "Học Tổng Hợp" } : wordSets.find((s) => s._id === setId);

    // Boot session
    useEffect(() => {
        if (!wordSets.length && setId !== "global") fetchWordSets();

        // Only (re)start if switching to a different set, or no active session
        if (currentSetId === setId && queue.length > 0 && !sessionComplete) return;
        if (currentSetId === setId && sessionComplete) return;

        if (setId === "global") {
            startGlobalSession();
        } else {
            startSession(setId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [setId]);

    const currentWord = queue[currentIndex];
    const answeredCount = Object.keys(answers).length;
    const totalCards = queue.length;
    const allAnswered = totalCards > 0 && answeredCount === totalCards;
    const progress = totalCards > 0 ? Math.round((answeredCount / totalCards) * 100) : 0;

    const handleAnswer = (cardId, quality) => {
        answerCard(cardId, quality);
    };

    const handleSubmit = async () => {
        try {
            await submitSession();
        } catch (e) {
            console.error("Submit failed:", e);
        }
    };

    // ── Loading ────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <Flex h="100vh" align="center" justify="center" direction="column" gap={4}>
                <Spinner size="xl" color="blue.500" />
                <Text color="fg.muted">Đang tải session học...</Text>
            </Flex>
        );
    }

    // ── No cards ───────────────────────────────────────────────────────────
    if (!loading && queue.length === 0 && !sessionComplete) {
        const nextDate = nextReviewAt ? new Date(nextReviewAt) : null;
        const diffMs = nextDate ? nextDate - Date.now() : null;
        const diffMin = diffMs ? Math.max(1, Math.round(diffMs / 60000)) : null;
        const nextLabel = diffMin
            ? diffMin < 60
                ? `${diffMin} phút nữa`
                : diffMin < 1440
                    ? `${Math.ceil(diffMin / 60)} giờ nữa`
                    : `${Math.round(diffMin / 1440)} ngày nữa`
            : null;

        return (
            <Flex h="100vh" align="center" justify="center" direction="column" gap={5} p={8}>
                <Box
                    bg="bg.panel" borderRadius="3xl" p={8} maxW="420px" w="full"
                    shadow="xl" borderWidth="1px" borderColor="border.subtle" textAlign="center"
                    position="relative" overflow="hidden"
                >
                    <Box
                        position="absolute" top="-40px" left="50%" transform="translateX(-50%)"
                        w="160px" h="160px" bg="green.400" opacity={0.12} filter="blur(40px)"
                        borderRadius="full" pointerEvents="none"
                    />
                    <Flex direction="column" align="center" gap={4} position="relative">
                        <Text fontSize="6xl">🎉</Text>
                        <Box>
                            <Text fontSize="xl" fontWeight="900" mb={1}>Bạn đã hoàn thành hôm nay!</Text>
                            <Text color="fg.muted" fontSize="sm">
                                Không có từ nào cần ôn lúc này. SRS đang hoạt động tốt!
                            </Text>
                        </Box>

                        {nextLabel && (
                            <Flex
                                align="center" gap={2} px={4} py={2.5}
                                borderRadius="xl" bg="blue.50"
                                _dark={{ bg: "blue.900/30" }}
                                borderWidth="1px" borderColor="blue.200"
                                _dark_borderColor="blue.700"
                            >
                                <Text fontSize="lg">⏳</Text>
                                <Text fontSize="sm" fontWeight="600" color="blue.700" _dark={{ color: "blue.300" }}>
                                    Từ tiếp theo sau {nextLabel}
                                </Text>
                            </Flex>
                        )}

                        <Flex w="full" gap={3} direction="column" mt={2}>
                            <Button
                                bg="linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)"
                                color="white" borderRadius="xl" fontWeight="bold" size="lg"
                                onClick={() => navigate("/home")}
                                _hover={{ opacity: 0.9 }}
                            >
                                Về trang chủ
                            </Button>
                            <Button
                                variant="ghost" size="sm" color="fg.muted"
                                onClick={() => navigate(`/sets/${setId}`)}
                            >
                                Quản lý bộ từ
                            </Button>
                        </Flex>
                    </Flex>
                </Box>
            </Flex>
        );
    }

    return (
        <Box minH="100vh" bg="bg.main" p={{ base: 3, md: 6 }} position="relative">
            {/* ── Completion Popup ─────────────────────────────────────────── */}
            {sessionComplete && (
                <Flex
                    position="fixed"
                    inset={0}
                    zIndex={100}
                    align="center"
                    justify="center"
                    bg="blackAlpha.700"
                    backdropFilter="blur(6px)"
                >
                    <StudyComplete
                        submitResult={submitResult}
                        setId={setId}
                        setTitle={currentSet?.title}
                        onRestart={() => {
                            resetSession();
                            startSession(setId);
                        }}
                    />
                </Flex>
            )}

            {/* ── Header ───────────────────────────────────────────────────── */}
            <Flex
                direction={{ base: "column", lg: "row" }}
                align={{ base: "stretch", lg: "center" }}
                justify="space-between"
                mb={5}
                gap={3}
                maxW="1100px"
                mx="auto"
                bg="bg.panel"
                p={4}
                px={{ base: 4, md: 6 }}
                borderRadius="2xl"
                borderWidth="1px"
                borderColor="border.subtle"
                shadow="sm"
            >
                {/* Left */}
                <Flex align="center" justify="space-between" gap={3}>
                    <Flex align="center" gap={2}>
                        <IconButton
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/sets/${setId}`)}
                            _hover={{ bg: "bg.subtle" }}
                        >
                            <FiArrowLeft size={18} />
                        </IconButton>
                        <Box>
                            <Text fontWeight="bold" fontSize="md" color="fg">
                                {currentSet?.title || "Học từ vựng"}
                            </Text>
                            <Text fontSize="xs" color="fg.muted">
                                {answeredCount}/{totalCards} đã đánh giá
                            </Text>
                        </Box>
                    </Flex>

                    {/* Streak (mobile) */}
                    <Flex
                        display={{ base: "flex", lg: "none" }}
                        align="center"
                        gap={1}
                        px={2}
                        py={1}
                        borderRadius="lg"
                        bg="warning.bg"
                    >
                        <Box as={FaFire} color="orange.400" fontSize="sm" />
                        <Text fontSize="sm" fontWeight="bold" color="orange.500">
                            {streakInfo?.currentStreak ?? 0}
                        </Text>
                    </Flex>
                </Flex>

                {/* Center: Mode switcher */}
                <Flex justify="center" w={{ lg: "auto" }} flex={{ lg: 1 }}>
                    <Flex
                        bg="bg.subtle"
                        borderRadius="xl"
                        p={1}
                        borderWidth="1px"
                        borderColor="border.muted"
                        gap={1}
                        w={{ base: "full", sm: "auto" }}
                    >
                        {[
                            { key: "flashcard", label: "🃏 Flashcard" },
                            { key: "fill", label: "✏️ Fill-in" },
                        ].map(({ key, label }) => (
                            <Button
                                key={key}
                                flex={{ base: 1, sm: "auto" }}
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

                {/* Right */}
                <Flex align="center" justify={{ base: "space-between", lg: "flex-end" }} gap={3}>
                    {/* Streak (desktop) */}
                    <Flex
                        display={{ base: "none", lg: "flex" }}
                        align="center"
                        gap={1.5}
                        px={3}
                        py={1.5}
                        borderRadius="lg"
                        bg="warning.bg"
                        borderWidth="1px"
                        borderColor="border.muted"
                    >
                        <Box as={FaFire} color="orange.400" fontSize="sm" />
                        <Text fontSize="sm" fontWeight="bold" color="orange.500">
                            {streakInfo?.currentStreak ?? 0}
                        </Text>
                        <Text fontSize="xs" color="fg.muted">streak</Text>
                    </Flex>

                    {/* Submit button */}
                    <Button
                        size="sm"
                        bg={allAnswered
                            ? "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)"
                            : "bg.subtle"
                        }
                        color={allAnswered ? "white" : "fg.muted"}
                        borderRadius="xl"
                        fontWeight="bold"
                        gap={1.5}
                        onClick={handleSubmit}
                        disabled={answeredCount === 0 || submitting}
                        loading={submitting}
                        _hover={allAnswered ? { opacity: 0.9 } : {}}
                        transition="all 0.2s"
                        title={allAnswered ? "Nộp bài" : `Còn ${totalCards - answeredCount} từ chưa trả lời`}
                    >
                        <FiSend size={14} />
                        {allAnswered ? "Nộp bài" : `Nộp (${answeredCount}/${totalCards})`}
                    </Button>

                    {/* User avatar */}
                    <Box position="relative">
                        <Flex
                            as="button"
                            onClick={() => setShowDropdown(!showDropdown)}
                            align="center"
                            justify="center"
                            w="34px"
                            h="34px"
                            bg="blue.500"
                            color="white"
                            borderRadius="full"
                            fontWeight="bold"
                            cursor="pointer"
                            _hover={{ bg: "blue.600" }}
                        >
                            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                        </Flex>
                        {showDropdown && (
                            <Box
                                position="absolute"
                                right={0}
                                top="42px"
                                bg="bg.panel"
                                py={2}
                                shadow="md"
                                borderRadius="lg"
                                borderWidth="1px"
                                borderColor="border.subtle"
                                w="150px"
                                zIndex={10}
                            >
                                <Button
                                    variant="ghost"
                                    w="full"
                                    justifyContent="flex-start"
                                    color="red.500"
                                    onClick={handleLogout}
                                    px={4}
                                    size="sm"
                                >
                                    <FiLogOut style={{ marginRight: "8px" }} /> Đăng xuất
                                </Button>
                            </Box>
                        )}
                    </Box>
                </Flex>
            </Flex>

            {/* ── Progress bar ─────────────────────────────────────────────── */}
            <Box maxW="1100px" mx="auto" mb={4}>
                <Flex justify="space-between" align="center" mb={1}>
                    <Text fontSize="xs" color="fg.muted">
                        Tiến độ đánh giá
                    </Text>
                    <Text fontSize="xs" color="fg.muted">
                        {progress}%
                    </Text>
                </Flex>
                <Box h="6px" bg="bg.subtle" borderRadius="full" overflow="hidden">
                    <Box
                        h="full"
                        w={`${progress}%`}
                        bg="linear-gradient(90deg, #3b82f6, #6366f1)"
                        borderRadius="full"
                        transition="width 0.4s ease"
                    />
                </Box>
            </Box>

            {/* ── Card mini-map (dots) ──────────────────────────────────────── */}
            <Flex
                maxW="1100px"
                mx="auto"
                mb={5}
                gap={1.5}
                flexWrap="wrap"
                justify="center"
            >
                {queue.map((card, idx) => {
                    const answered = answers[card.cardId];
                    const isCurrent = idx === currentIndex;
                    const colorMap = {
                        AGAIN: "red.400",
                        HARD: "orange.400",
                        GOOD: "blue.400",
                        EASY: "green.400",
                    };
                    return (
                        <Box
                            key={card.cardId ?? card._id}
                            as="button"
                            onClick={() => goToCard(idx)}
                            w="28px"
                            h="28px"
                            borderRadius="lg"
                            bg={answered ? colorMap[answered] : "bg.subtle"}
                            borderWidth={isCurrent ? "2px" : "1px"}
                            borderColor={isCurrent ? "brand.solid" : "border.muted"}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            fontSize="xs"
                            fontWeight="bold"
                            color={answered ? "white" : "fg.muted"}
                            cursor="pointer"
                            transition="all 0.15s"
                            _hover={{ transform: "scale(1.15)" }}
                            title={`Từ ${idx + 1}: ${card.english}${answered ? ` (${answered})` : ""}`}
                        >
                            {idx + 1}
                        </Box>
                    );
                })}
            </Flex>

            {/* ── Main Content ──────────────────────────────────────────────── */}
            <Box maxW="800px" mx="auto">
                {currentWord ? (
                    mode === "flashcard" ? (
                        <Flashcard
                            word={currentWord}
                            onAnswer={handleAnswer}
                            existingAnswer={answers[currentWord.cardId]}
                        />
                    ) : (
                        <FillInBlank
                            word={currentWord}
                            onAnswer={handleAnswer}
                            existingAnswer={answers[currentWord.cardId]}
                        />
                    )
                ) : (
                    <Flex
                        justify="center"
                        py={20}
                        color="fg.muted"
                        bg="bg.panel"
                        borderRadius="2xl"
                        shadow="sm"
                    >
                        <Text fontWeight="medium">Không có thẻ nào để học hôm nay.</Text>
                    </Flex>
                )}

                {/* ── Card navigation ──────────────────────────────────────── */}
                {totalCards > 1 && (
                    <Flex justify="space-between" align="center" mt={6} px={2}>
                        <Button
                            variant="ghost"
                            size="sm"
                            gap={1}
                            onClick={() => goToCard(currentIndex - 1)}
                            disabled={currentIndex === 0}
                            borderRadius="xl"
                        >
                            <FiChevronLeft /> Trước
                        </Button>
                        <Text fontSize="sm" color="fg.muted">
                            {currentIndex + 1} / {totalCards}
                        </Text>
                        <Button
                            variant="ghost"
                            size="sm"
                            gap={1}
                            onClick={() => goToCard(currentIndex + 1)}
                            disabled={currentIndex === totalCards - 1}
                            borderRadius="xl"
                        >
                            Tiếp <FiChevronRight />
                        </Button>
                    </Flex>
                )}

                {/* ── Submit hint ───────────────────────────────────────────── */}
                <Box
                    mt={6}
                    p={4}
                    bg={allAnswered ? "blue.50" : "bg.panel"}
                    _dark={{ bg: allAnswered ? "blue.900/30" : "bg.panel" }}
                    borderRadius="xl"
                    borderWidth="1px"
                    borderColor={allAnswered ? "blue.200" : "border.muted"}
                    textAlign="center"
                    transition="all 0.3s"
                >
                    {allAnswered ? (
                        <Flex direction="column" align="center" gap={2}>
                            <Text fontWeight="bold" color="blue.600" _dark={{ color: "blue.300" }}>
                                ✅ Đã đánh giá hết {totalCards} từ! Nhấn "Nộp bài" để hoàn thành.
                            </Text>
                            <Button
                                bg="linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)"
                                color="white"
                                borderRadius="xl"
                                fontWeight="bold"
                                gap={2}
                                onClick={handleSubmit}
                                loading={submitting}
                                size="lg"
                                _hover={{ opacity: 0.9, transform: "translateY(-1px)" }}
                                transition="all 0.2s"
                            >
                                <FiSend /> Nộp bài ngay
                            </Button>
                        </Flex>
                    ) : (
                        <Text fontSize="sm" color="fg.muted">
                            Đánh giá tất cả {totalCards} từ rồi nhấn{" "}
                            <Text as="span" fontWeight="bold" color="fg">
                                Nộp bài
                            </Text>{" "}
                            để lưu kết quả · Đã đánh giá:{" "}
                            <Text as="span" fontWeight="bold" color="blue.500">
                                {answeredCount}
                            </Text>
                        </Text>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default StudyPage;