import React, { useEffect, useState, useRef } from "react";
import {
    Box, Flex, Text, Button, Input, Image, HStack, VStack,
    Icon, Badge, Portal, Spinner, IconButton,
} from "@chakra-ui/react";
import { FiArrowLeft, FiSend, FiZap, FiCheckCircle, FiXCircle, FiTarget } from "react-icons/fi";
import { useParams, useNavigate } from "react-router-dom";
import BaseLayout from "../../../layouts/BaseLayout.jsx";
import { useGameStore } from "../../../stores/useGameStore.js";
import { useAuthStore } from "../../../stores/useAuthStore.js";
import { useSocketStore } from "../../../stores/useSocketStore.js";

const GamePlayPage = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { socket } = useSocketStore();

    // Custom CSS for Game Effects
    const gameStyles = `
        @keyframes cardFlyPlayer {
            0% { transform: translateY(100px) scale(0.5); opacity: 0; }
            100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes cardFlyOpponent {
            0% { transform: translateY(-100px) scale(0.5); opacity: 0; }
            100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes glowPulse {
            0% { box-shadow: 0 0 5px rgba(255, 165, 0, 0.4); }
            50% { box-shadow: 0 0 20px rgba(255, 165, 0, 0.8); }
            100% { box-shadow: 0 0 5px rgba(255, 165, 0, 0.4); }
        }
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px) rotate(-1deg); }
            75% { transform: translateX(5px) rotate(1deg); }
        }
        .active-card {
            animation: glowPulse 2s infinite;
        }
        .shake-effect {
            animation: shake 0.4s ease-in-out;
        }
    `;
    const {
        currentRoom, players, gameState, currentTurn, scores, phase, activeWord,
        lastResult, submitAnswer, pickCard, leaveRoom, initListeners, clearListeners
    } = useGameStore();

    const [answer, setAnswer] = useState("");

    useEffect(() => {
        initListeners(socket);
        if (!currentRoom) {
            navigate("/game");
        }
    }, [socket]);

    const me = players.find(p => p.socketId === socket?.id);
    const opponent = players.find(p => p.socketId !== socket?.id);

    // Who is currently the challenger (picking the card)
    const isMyTurnToPick = players[currentTurn]?.socketId === socket?.id && phase === 'picking';
    // Who is currently the answerer
    const isMyTurnToAnswer = players[currentTurn]?.socketId !== socket?.id && phase === 'answering';

    const handlePickCard = (cardId) => {
        if (!isMyTurnToPick) return;
        pickCard(roomId, cardId);
    };

    const handleSubmitAnswer = () => {
        if (!answer.trim()) return;
        submitAnswer(roomId, answer);
        setAnswer("");
    };

    const handleBack = () => {
        if (window.confirm("Rời khỏi phòng đấu?")) {
            leaveRoom();
            navigate("/game");
        }
    };

    if (!currentRoom) return <Flex justify="center" py={20}><Spinner size="xl" /></Flex>;

    return (
        <BaseLayout>
            <style>{gameStyles}</style>
            <Box h="full" maxW="1400px" mx="auto" position="relative">
                {/* Header */}
                <Flex justify="space-between" align="center" mb={10}>
                    <Button variant="ghost" gap={2} onClick={handleBack} color="fg.muted">
                        <FiArrowLeft /> Rời phòng
                    </Button>
                    <Box textAlign="center">
                        <Flex align="center" gap={2} justify="center">
                            <Icon as={FiZap} color="orange.400" />
                            <Badge colorPalette="orange" size="lg" px={4} py={1} borderRadius="full" variant="subtle" border="1px solid" borderColor="orange.200">
                                {gameState === 'playing' ? "BATTLE MODE" : "WAITING..."}
                            </Badge>
                        </Flex>
                        <Text fontSize="xs" mt={1} fontWeight="bold" color="blue.500" textTransform="uppercase" letterSpacing="widest">
                            {phase === 'picking' ? "Phase: Selecting Challenge" : "Phase: Defending"}
                        </Text>
                    </Box>
                    <Box w="100px" />
                </Flex>

                {/* Battle Area */}
                <Flex direction="column" gap={12} align="center" justify="center" py={4}>

                    {/* Opponent Info */}
                    <VStack gap={4}>
                        <Flex align="center" gap={5} p={4} bg="bg.panel" borderRadius="3xl" shadow="xl" borderWidth="2px" borderColor={!isMyTurnToPick && phase === 'picking' ? "orange.400" : "border.muted"} transition="all 0.3s">
                            <Box position="relative">
                                <Image src={opponent?.picture} borderRadius="full" boxSize="70px" fallbackSrc="https://via.placeholder.com/70" border="3px solid" borderColor="red.400" />
                                {(!isMyTurnToPick && phase === 'picking') && (
                                    <Box position="absolute" top={-2} right={-2} bg="orange.500" borderRadius="full" p={1} animation="pulse 1s infinite">
                                        <FiTarget color="white" size={16} />
                                    </Box>
                                )}
                            </Box>
                            <Box>
                                <Text fontWeight="900" fontSize="xl" color="fg">{opponent?.name || "Player 2"}</Text>
                                <Flex align="center" gap={2}>
                                    <Text fontSize="4xl" fontWeight="900" color="red.500" lineHeight="1">
                                        {scores[opponent?.socketId] || 0}
                                    </Text>
                                    <Text fontSize="xs" fontWeight="bold" color="red.300">POINTS</Text>
                                </Flex>
                            </Box>
                        </Flex>

                        {/* Opponent Cards (Back side) */}
                        <HStack gap={2}>
                            {opponent?.cards?.map((_, i) => (
                                <Box
                                    key={i} w="45px" h="65px"
                                    bgGradient="linear(to-br, blue.600, blue.800)"
                                    borderRadius="md" shadow="lg" border="2px solid" borderColor="whiteAlpha.400"
                                    position="relative"
                                    _after={{
                                        content: '""', position: 'absolute', inset: 1, border: '1px solid', borderColor: 'whiteAlpha.300', borderRadius: 'sm'
                                    }}
                                />
                            ))}
                        </HStack>
                    </VStack>

                    {/* VS Center / Active Card Area */}
                    <Flex direction="column" align="center" justify="center" h="220px" position="relative" w="full">
                        {phase === 'answering' && activeWord ? (
                            <VStack
                                className="active-card"
                                sx={{
                                    animation: players[currentTurn]?.socketId === socket?.id
                                        ? "cardFlyPlayer 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                                        : "cardFlyOpponent 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                                }}
                            >
                                <Text fontSize="xs" fontWeight="black" color="orange.500" letterSpacing="widest" mb={1}>ACTIVE CHALLENGE</Text>
                                <Box
                                    p={8}
                                    bgGradient="linear(to-br, white, gray.50)"
                                    _dark={{ bgGradient: "linear(to-br, gray.700, gray.800)" }}
                                    borderRadius="3xl" shadow="dark-lg" border="5px solid" borderColor="orange.400"
                                    textAlign="center" minW="260px"
                                    position="relative"
                                    className={lastResult && !lastResult.isCorrect ? "shake-effect" : ""}
                                >
                                    <Text fontSize="4xl" fontWeight="1000" color="blue.600" letterSpacing="-1px">{activeWord.english}</Text>
                                    <Text fontSize="lg" color="fg.muted" fontStyle="italic">{activeWord.pronunciation}</Text>
                                    <Box position="absolute" bottom={-3} bg="orange.400" color="white" px={3} py={1} borderRadius="full" fontSize="10px" fontWeight="bold">
                                        THÁCH ĐẤU
                                    </Box>
                                </Box>
                            </VStack>
                        ) : (
                            <Box opacity={0.05} transform="scale(1.5)">
                                <Text fontSize="9xl" fontWeight="1000">VS</Text>
                            </Box>
                        )}

                        {/* Feedback Overlay */}
                        {lastResult && (
                            <Box
                                position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)"
                                zIndex={100} textAlign="center" animation="fadeIn 0.4s ease-out"
                            >
                                {lastResult.isCorrect ? (
                                    <VStack gap={1}>
                                        <Box bg="green.500" p={4} borderRadius="full" shadow="0 0 30px rgba(72, 187, 120, 0.6)">
                                            <Icon as={FiCheckCircle} fontSize="7xl" color="white" />
                                        </Box>
                                        <Text fontSize="2xl" fontWeight="1000" color="green.500" bg="bg.panel" px={6} py={2} borderRadius="2xl" shadow="2xl">
                                            EXCELLENT! +1
                                        </Text>
                                    </VStack>
                                ) : (
                                    <VStack gap={1}>
                                        <Box bg="red.500" p={4} borderRadius="full" shadow="0 0 30px rgba(245, 101, 101, 0.6)">
                                            <Icon as={FiXCircle} fontSize="7xl" color="white" />
                                        </Box>
                                        <Text fontSize="2xl" fontWeight="1000" color="red.500" bg="bg.panel" px={6} py={2} borderRadius="2xl" shadow="2xl">
                                            WRONG! -1
                                        </Text>
                                        <Text fontSize="lg" fontWeight="bold" bg="black" color="white" px={4} py={1} borderRadius="lg">
                                            Mean: {lastResult.correctMeaning}
                                        </Text>
                                    </VStack>
                                )}
                            </Box>
                        )}
                    </Flex>

                    {/* My Info */}
                    <VStack gap={8} w="full">
                        {/* Answer Input Area */}
                        {isMyTurnToAnswer && (
                            <Box
                                w="full" maxW="450px" p={1} bgGradient="linear(to-r, blue.400, purple.500)" borderRadius="3xl" shadow="2xl"
                                animation="slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                            >
                                <VStack gap={4} p={6} bg="bg.panel" borderRadius="2.5xl">
                                    <Text fontSize="md" fontWeight="800" color="blue.600" textTransform="uppercase">Hóa giải thử thách này:</Text>
                                    <HStack w="full">
                                        <Input
                                            placeholder="Nghĩa tiếng Việt..."
                                            bg="bg.subtle"
                                            size="lg"
                                            h="60px"
                                            fontSize="lg"
                                            fontWeight="600"
                                            value={answer}
                                            onChange={(e) => setAnswer(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSubmitAnswer()}
                                            autoFocus
                                            borderRadius="2xl"
                                            border="none"
                                            _focus={{ bg: "bg.panel", ring: "2px", ringColor: "blue.400" }}
                                        />
                                        <IconButton
                                            colorPalette="blue"
                                            size="lg"
                                            h="60px"
                                            w="60px"
                                            borderRadius="2xl"
                                            onClick={handleSubmitAnswer}
                                            disabled={!answer.trim()}
                                        >
                                            <FiSend size={24} />
                                        </IconButton>
                                    </HStack>
                                </VStack>
                            </Box>
                        )}

                        {/* My Hand */}
                        <VStack gap={4}>
                            {isMyTurnToPick && (
                                <Badge colorPalette="orange" variant="solid" px={4} py={1} borderRadius="full" animation="pulse 1.5s infinite">
                                    CHỌN MỘT THẺ ĐỂ TẤN CÔNG
                                </Badge>
                            )}
                            <HStack gap={5} py={2} px={6} bg="blackAlpha.50" _dark={{ bg: "whiteAlpha.50" }} borderRadius="3xl">
                                {me?.cards?.map((card) => (
                                    <Box
                                        key={card._id}
                                        w="130px" h="180px"
                                        bgGradient="linear(to-br, white, gray.50)"
                                        _dark={{ bgGradient: "linear(to-br, gray.700, gray.800)" }}
                                        borderRadius="2xl"
                                        borderWidth="2px"
                                        borderColor="border.muted"
                                        display="flex" alignItems="center" justifyContent="center"
                                        flexDirection="column" p={4} textAlign="center"
                                        cursor={isMyTurnToPick ? "pointer" : "default"}
                                        transition="all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                                        position="relative"
                                        _hover={isMyTurnToPick ? {
                                            transform: "translateY(-30px) rotate(2deg)",
                                            shadow: "dark-lg",
                                            borderColor: "orange.400",
                                            bg: "orange.50"
                                        } : {}}
                                        onClick={() => handlePickCard(card._id)}
                                    >
                                        <Text fontWeight="1000" fontSize="lg" color="blue.500" lineHeight="1.1">{card.english}</Text>
                                        <Text fontSize="xs" color="fg.muted" mt={3} fontStyle="italic">{card.pronunciation}</Text>
                                        <Box position="absolute" top={2} left={2} fontSize="10px" color="gray.300" fontWeight="bold">#VOCAB</Box>
                                    </Box>
                                ))}
                            </HStack>
                        </VStack>

                        {/* My Score Info */}
                        <Flex align="center" gap={6} p={4} bg="bg.panel" borderRadius="3xl" shadow="xl" borderWidth="2px" borderColor={isMyTurnToPick ? "orange.400" : "border.muted"} transition="all 0.3s">
                            <Box textAlign="right">
                                <Text fontWeight="900" fontSize="xl" color="fg">You</Text>
                                <Flex align="center" gap={2} justify="flex-end">
                                    <Text fontSize="xs" fontWeight="bold" color="green.300">POINTS</Text>
                                    <Text fontSize="4xl" fontWeight="900" color="green.500" lineHeight="1">
                                        {scores[me?.socketId] || 0}
                                    </Text>
                                </Flex>
                            </Box>
                            <Image src={me?.picture} borderRadius="full" boxSize="70px" border="3px solid" borderColor="green.400" />
                        </Flex>
                    </VStack>

                </Flex>

                {/* Game Result Modal */}
                {gameState === 'finished' && (
                    <Portal>
                        <Box position="fixed" inset={0} bg="blackAlpha.800" zIndex={100} display="flex" alignItems="center" justifyContent="center">
                            <VStack bg="bg.panel" p={12} borderRadius="3xl" textAlign="center" gap={6} shadow="2xl">
                                <Text fontSize="5xl">🏁</Text>
                                <Box>
                                    <Text fontSize="3xl" fontWeight="900">Trận đấu kết thúc!</Text>
                                    <Text color="fg.muted">Kết quả chung cuộc</Text>
                                </Box>

                                <HStack gap={12}>
                                    <VStack>
                                        <Image src={me?.picture} boxSize="60px" borderRadius="full" />
                                        <Text fontWeight="bold">Bạn</Text>
                                        <Text fontSize="4xl" fontWeight="900">{scores[me?.socketId] || 0}</Text>
                                    </VStack>
                                    <Text fontSize="2xl" fontWeight="bold">VS</Text>
                                    <VStack>
                                        <Image src={opponent?.picture} boxSize="60px" borderRadius="full" />
                                        <Text fontWeight="bold">{opponent?.name}</Text>
                                        <Text fontSize="4xl" fontWeight="900">{scores[opponent?.socketId] || 0}</Text>
                                    </VStack>
                                </HStack>

                                <Button size="lg" colorPalette="blue" w="full" onClick={handleBack}>
                                    Quay lại Lobby
                                </Button>
                            </VStack>
                        </Box>
                    </Portal>
                )}
            </Box>
        </BaseLayout>
    );
};

export default GamePlayPage;
