import React, { useEffect, useState, useRef } from "react";
import { Box, Flex, Text, Button, Spinner, SimpleGrid, Badge, Heading } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiHeart, FiRotateCcw, FiVolume2 } from "react-icons/fi";
import BaseLayout from "../../../layouts/BaseLayout.jsx";
import { getSurvivalQuestions, submitSurvivalScore, getSurvivalLeaderboard } from "../../../services/gameApi.js";
import { speak } from "../../../shared/utils/speech.js";

const GAME_CSS = `
@keyframes heartBeat {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.15); }
}
.heart-active { animation: heartBeat 1.2s infinite; }

@keyframes scorePop {
    0% { transform: scale(1); }
    50% { transform: scale(1.2) rotate(3deg); }
    100% { transform: scale(1); }
}
.score-pop { animation: scorePop 0.3s ease-out; }
`;

const SurvivalPlayPage = () => {
    const navigate = useNavigate();

    // Game States
    const [questions, setQuestions] = useState([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [loading, setLoading] = useState(true);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [lives, setLives] = useState(3);
    const [timeLeft, setTimeLeft] = useState(15);
    const [isGameOver, setIsGameOver] = useState(false);
    const [savingScore, setSavingScore] = useState(false);
    const [newHighScoreCelebration, setNewHighScoreCelebration] = useState(false);

    // Interactive Feedback States
    const [selectedOption, setSelectedOption] = useState(null);
    const [isChecking, setIsChecking] = useState(false);
    const [timerActive, setTimerActive] = useState(false);

    // Track played words for stats saving
    const gameResultsRef = useRef([]); // [{ wordId, correct }]

    // Timer Ref
    const timerRef = useRef(null);

    // Load initial batch of questions
    const initGame = async () => {
        setLoading(true);
        setQuestions([]);
        setCurrentIdx(0);
        setScore(0);
        setCombo(0);
        setLives(3);
        setTimeLeft(15);
        setIsGameOver(false);
        setNewHighScoreCelebration(false);
        setSelectedOption(null);
        setIsChecking(false);
        gameResultsRef.current = [];

        try {
            const queryParams = new URLSearchParams(window.location.search);
            const levels = queryParams.get("levels") || "";
            const res = await getSurvivalQuestions(15, levels);
            setQuestions(res.data || []);
            setTimerActive(true);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // Load questions on mount
    useEffect(() => {
        initGame();
        // Load personal high score
        getSurvivalLeaderboard().then(data => {
            // Highscore is managed by save
        }).catch(() => {});
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    // Prefetch next questions in the background when close to end
    const prefetchQuestions = async () => {
        try {
            const queryParams = new URLSearchParams(window.location.search);
            const levels = queryParams.get("levels") || "";
            const res = await getSurvivalQuestions(15, levels);
            setQuestions(prev => [...prev, ...res.data]);
        } catch (e) {
            console.error("Failed to prefetch questions:", e);
        }
    };

    const currentQuestion = questions[currentIdx];

    // Prefetch trigger
    useEffect(() => {
        if (questions.length > 0 && currentIdx === questions.length - 4) {
            prefetchQuestions();
        }
    }, [currentIdx, questions.length]);

    // Timer Tick
    useEffect(() => {
        if (!timerActive || isGameOver) return;

        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    handleAnswer(null, true); // Timeout counts as wrong
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timerRef.current);
    }, [timerActive, isGameOver, currentIdx]);

    const handleSpeak = (e, text) => {
        e.stopPropagation();
        speak(text);
    };

    // Handle answer submission
    const handleAnswer = async (option, isTimeout = false) => {
        if (isChecking || isGameOver) return;
        setIsChecking(true);
        setTimerActive(false);
        clearInterval(timerRef.current);

        const correctAns = currentQuestion.correctAnswer;
        const isCorrect = !isTimeout && option === correctAns;

        setSelectedOption(option);
        gameResultsRef.current.push({
            wordId: currentQuestion.wordId,
            correct: isCorrect
        });

        if (isCorrect) {
            const comboBonus = Math.floor(combo / 5) * 5;
            const pointsGained = 10 + comboBonus;
            setScore(prev => prev + pointsGained);
            setCombo(prev => prev + 1);

            // Move next after short delay
            setTimeout(() => {
                nextQuestion();
            }, 1000);
        } else {
            const newLives = lives - 1;
            setLives(newLives);
            setCombo(0);

            if (newLives <= 0) {
                setTimeout(async () => {
                    await handleGameOver();
                }, 2500);
            } else {
                setTimeout(() => {
                    nextQuestion();
                }, 2500);
            }
        }
    };

    const nextQuestion = () => {
        setSelectedOption(null);
        setIsChecking(false);
        setTimeLeft(15);
        setCurrentIdx(prev => prev + 1);
        setTimerActive(true);
    };

    const handleGameOver = async () => {
        setIsGameOver(true);
        setTimerActive(false);
        setSavingScore(true);

        try {
            const queryParams = new URLSearchParams(window.location.search);
            const isSaveWords = queryParams.get("saveWords") !== "false";
            const res = await submitSurvivalScore(score, gameResultsRef.current, isSaveWords);
            if (res) {
                setHighScore(res.highScore);
                if (res.isNewHighScore) {
                    setNewHighScoreCelebration(true);
                }
            }
        } catch (e) {
            console.error("Failed to save survival score:", e);
        } finally {
            setSavingScore(false);
        }
    };

    const queryParams = new URLSearchParams(window.location.search);
    const isSaveWords = queryParams.get("saveWords") !== "false";

    if (loading) {
        return (
            <BaseLayout>
                <style>{GAME_CSS}</style>
                <Flex justify="center" align="center" minH="70vh" direction="column" gap={4}>
                    <Spinner size="xl" colorPalette="blue" />
                    <Text fontSize="lg" fontWeight="700">Đang chuẩn bị đấu trường sinh tồn...</Text>
                </Flex>
            </BaseLayout>
        );
    }

    return (
        <BaseLayout>
            <style>{GAME_CSS}</style>
            <Box maxW="800px" mx="auto" px={{ base: 4, md: 6 }} py={{ base: 4, md: 8 }}>

                {/* Back button & Mode Badge */}
                <Flex align="center" justify="space-between" mb={6}>
                    <Button variant="ghost" size="sm" onClick={() => navigate("/game")} gap={2} fontWeight="700">
                        <FiArrowLeft /> RỜI GAME LOBBY
                    </Button>
                    <Badge colorPalette={isSaveWords ? "green" : "gray"} variant="subtle" size="md" borderRadius="full" px={3}>
                        {isSaveWords ? "🟢 Lưu từ vào Trang chủ" : "⚪ Không lưu từ vào Trang chủ"}
                    </Badge>
                </Flex>


                {!isGameOver && currentQuestion ? (
                    <Box>
                        {/* Game Status Banner */}
                        <Flex justify="space-between" align="center" bg="bg.panel" p={4} borderRadius="2xl" shadow="sm" mb={6} borderWidth="1px" borderColor="border.muted">
                            <Flex align="center" gap={2}>
                                <Text fontSize="xs" fontWeight="800" color="fg.muted">LIVES:</Text>
                                <Flex gap={1}>
                                    {[1, 2, 3].map((heart) => (
                                        <Box
                                            key={heart}
                                            color={heart <= lives ? "red.500" : "gray.300"}
                                            className={heart <= lives ? "heart-active" : ""}
                                            style={{ transition: "color 0.3s" }}
                                        >
                                            <FiHeart size={20} fill={heart <= lives ? "currentColor" : "none"} />
                                        </Box>
                                    ))}
                                </Flex>
                            </Flex>

                            {/* Combo Badge */}
                            {combo >= 3 && (
                                <Badge colorPalette="orange" size="lg" variant="solid" borderRadius="full">
                                    🔥 STREAK: {combo}
                                </Badge>
                            )}

                            <Box textAlign="right">
                                <Text fontSize="xs" fontWeight="700" color="fg.muted" lineHeight="1">SCORE</Text>
                                <Text fontSize="2xl" fontWeight="900" color="blue.500" className="score-pop" key={score}>
                                    {score}
                                </Text>
                            </Box>
                        </Flex>

                        {/* Question Timer */}
                        <Box mb={6}>
                            <Flex justify="space-between" mb={1} fontSize="xs" fontWeight="700">
                                <Text color="fg.muted">THỜI GIAN CÒN LẠI</Text>
                                <Text color={timeLeft <= 4 ? "red.500" : "blue.500"}>{timeLeft}s</Text>
                            </Flex>
                            <Box h="6px" bg="bg.subtle" borderRadius="full" overflow="hidden">
                                <Box
                                    h="full"
                                    w={`${(timeLeft / 15) * 100}%`}
                                    bg={timeLeft <= 4 ? "red.500" : "blue.500"}
                                    borderRadius="full"
                                    transition="width 1s linear"
                                />
                            </Box>
                        </Box>

                        {/* Target English Word Card */}
                        <Box bg="bg.panel" p={8} borderRadius="3xl" shadow="md" textAlign="center" mb={6} borderWidth="1px" borderColor="border.muted" position="relative">
                            <Flex justify="center" align="center" gap={2} mb={2}>
                                <Badge colorPalette="purple" size="md">
                                    {currentQuestion.partOfSpeech || "Vocabulary"}
                                </Badge>
                                <Button size="xs" variant="ghost" borderRadius="full" p={0} minW="24px" h="24px" onClick={(e) => handleSpeak(e, currentQuestion.english)}>
                                    <FiVolume2 size={14} />
                                </Button>
                            </Flex>
                            <Heading fontSize={{ base: "3xl", md: "4xl" }} fontWeight="900" mb={2} color="fg">
                                {currentQuestion.english}
                            </Heading>
                            <Text color="fg.muted" fontStyle="italic" fontSize="md">
                                {currentQuestion.pronunciation || "—"}
                            </Text>

                            {/* Show detailed explanation when checking and wrong */}
                            {isChecking && selectedOption !== currentQuestion.correctAnswer && (
                                <Box mt={4} p={3} bg="red.50" _dark={{ bg: "red.900/10" }} borderRadius="2xl" borderWidth="1px" borderColor="red.100" _dark_borderColor="red.900/20">
                                    <Text fontSize="sm" fontWeight="bold" color="red.700" _dark={{ color: "red.300" }} mb={1}>
                                        Đáp án đúng: {currentQuestion.correctAnswer}
                                    </Text>
                                    {currentQuestion.example && (
                                        <Box mt={2} textAlign="left" maxW="500px" mx="auto">
                                            <Text fontSize="xs" fontWeight="600" color="fg">Ví dụ: "{currentQuestion.example}"</Text>
                                            {currentQuestion.exampleTranslation && (
                                                <Text fontSize="10px" color="fg.muted" fontStyle="italic">Dịch: {currentQuestion.exampleTranslation}</Text>
                                            )}
                                        </Box>
                                    )}
                                </Box>
                            )}
                        </Box>

                        {/* Multiple Choice Options */}
                        <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                            {currentQuestion.options.map((option, idx) => {
                                const isSelected = selectedOption === option;
                                const isCorrectAnswer = option === currentQuestion.correctAnswer;

                                // Colors based on checking status
                                let bg = "bg.panel";
                                let color = "fg";
                                let borderColor = "border.muted";
                                let hoverProps = { transform: "translateY(-2px)", shadow: "md" };

                                if (isChecking) {
                                    hoverProps = {}; // disable hover during checking
                                    if (isCorrectAnswer) {
                                        bg = "green.500";
                                        color = "white";
                                        borderColor = "green.500";
                                    } else if (isSelected) {
                                        bg = "red.500";
                                        color = "white";
                                        borderColor = "red.500";
                                    } else {
                                        bg = "bg.panel";
                                        color = "fg.muted";
                                        borderColor = "border.muted";
                                    }
                                }

                                return (
                                    <Button
                                        key={idx}
                                        onClick={() => handleAnswer(option)}
                                        disabled={isChecking}
                                        h="70px"
                                        bg={bg}
                                        color={color}
                                        borderWidth="2px"
                                        borderColor={borderColor}
                                        borderRadius="2xl"
                                        shadow="sm"
                                        fontSize="md"
                                        fontWeight="700"
                                        whiteSpace="normal"
                                        py={2}
                                        px={4}
                                        lineHeight="1.3"
                                        transition="all 0.2s"
                                        _hover={hoverProps}
                                    >
                                        {option}
                                    </Button>
                                );
                            })}
                        </SimpleGrid>
                    </Box>
                ) : (
                    // Game Over Screen
                    <Box bg="bg.panel" p={8} borderRadius="3xl" shadow="xl" border="1px solid" borderColor="border.muted" textAlign="center">
                        <Text fontSize="5xl" mb={4} className="lobby-float">🏆</Text>
                        <Heading fontSize="3xl" fontWeight="900" mb={2} color="fg">
                            GAME OVER
                        </Heading>
                        <Text fontSize="md" color="fg.muted" mb={6} fontWeight="600">
                            Chiến dịch sinh tồn kết thúc! Bạn đã xuất sắc vượt qua các thử thách từ vựng.
                        </Text>

                        {/* Celebratory Banner */}
                        {newHighScoreCelebration && (
                            <Box bg="linear-gradient(135deg, #ECC94B, #D69E2E)" color="white" py={3} px={6} borderRadius="2xl" mb={6} shadow="lg" className="lobby-float">
                                <Text fontWeight="900" fontSize="lg">✨ KỶ LỤC MỚI ĐÃ THIẾT LẬP! ✨</Text>
                            </Box>
                        )}

                        <SimpleGrid columns={2} gap={4} maxW="400px" mx="auto" mb={8}>
                            <Box bg="bg.subtle" p={4} borderRadius="2xl" borderWidth="1px" borderColor="border.muted">
                                <Text fontSize="xs" fontWeight="700" color="fg.muted">ĐIỂM ĐẠT ĐƯỢC</Text>
                                <Text fontSize="3xl" fontWeight="900" color="blue.500">{score}</Text>
                            </Box>
                            <Box bg="bg.subtle" p={4} borderRadius="2xl" borderWidth="1px" borderColor="border.muted">
                                <Text fontSize="xs" fontWeight="700" color="fg.muted">KỶ LỤC CÁ NHÂN</Text>
                                <Text fontSize="3xl" fontWeight="900" color="orange.500">
                                    {savingScore ? "..." : highScore || score}
                                </Text>
                            </Box>
                        </SimpleGrid>

                        <Flex justify="center" gap={4}>
                            <Button
                                colorPalette="blue"
                                size="lg"
                                h="54px"
                                borderRadius="15px"
                                onClick={initGame}
                                gap={2}
                                fontWeight="700"
                                shadow="md"
                                _hover={{ transform: "translateY(-2px)" }}
                            >
                                <FiRotateCcw /> CHƠI LẠI NGAY
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                h="54px"
                                borderRadius="15px"
                                onClick={() => navigate("/game")}
                                fontWeight="700"
                            >
                                QUAY LẠI LOBBY
                            </Button>
                        </Flex>
                    </Box>
                )}
            </Box>
        </BaseLayout>
    );
};

export default SurvivalPlayPage;
