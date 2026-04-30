import React, { useEffect, useState, useRef } from "react";
import { Box, Flex, Text, Button, Input, Image, HStack, VStack, Portal, Spinner, IconButton } from "@chakra-ui/react";
import { FiArrowLeft, FiSend } from "react-icons/fi";
import { useParams, useNavigate } from "react-router-dom";
import BaseLayout from "../../../layouts/BaseLayout.jsx";
import { useGameStore } from "../../../stores/useGameStore.js";
import { useAuthStore } from "../../../stores/useAuthStore.js";
import { useSocketStore } from "../../../stores/useSocketStore.js";
import { playCorrect, playWrong, playCardPlay, unlockAudio } from "../../../utils/audioUtils.js";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Orbitron:wght@700;900&display=swap');
@keyframes cardIn { from { transform: translateY(60px) scale(0.7) rotate(-5deg); opacity:0; } to { transform: translateY(0) scale(1) rotate(0deg); opacity:1; } }
@keyframes floatUp { 0% { transform: translateY(0); opacity:1; } 100% { transform: translateY(-80px); opacity:0; } }
@keyframes shake { 0%,100%{transform:translateX(0) rotate(0)} 20%{transform:translateX(-8px) rotate(-2deg)} 40%{transform:translateX(8px) rotate(2deg)} 60%{transform:translateX(-6px) rotate(-1deg)} 80%{transform:translateX(6px) rotate(1deg)} }
@keyframes glowGreen { 0%,100%{box-shadow:0 0 15px #00ff88, 0 0 40px #00ff8840} 50%{box-shadow:0 0 30px #00ff88, 0 0 80px #00ff8880} }
@keyframes glowRed { 0%,100%{box-shadow:0 0 15px #ff2255, 0 0 40px #ff225540} 50%{box-shadow:0 0 30px #ff2255, 0 0 80px #ff225580} }
@keyframes pulseOrb { 0%,100%{transform:scale(1);opacity:0.7} 50%{transform:scale(1.15);opacity:1} }
@keyframes borderFlow { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
@keyframes slideUp { from{transform:translateY(30px);opacity:0} to{transform:translateY(0);opacity:1} }
@keyframes winPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
.card-in { animation: cardIn 0.5s cubic-bezier(0.175,0.885,0.32,1.275) forwards; }
.shake { animation: shake 0.5s ease-in-out; }
.glow-green { animation: glowGreen 1.5s infinite; }
.glow-red { animation: glowRed 1.5s infinite; }
.float-score { animation: floatUp 1.5s ease-out forwards; }
.slide-up { animation: slideUp 0.4s cubic-bezier(0.175,0.885,0.32,1.275); }
.win-pulse { animation: winPulse 1s infinite; }
`;

const ARENA_BG = "linear-gradient(135deg, #0f0c29 0%, #1a1040 40%, #0f2027 100%)";
const GLASS = { bg: "rgba(255,255,255,0.06)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.12)" };

const PlayerHUD = ({ player, score, isActive, isMe, cardsLeft }) => (
    <Flex align="center" gap={3} px={5} py={3} borderRadius="full"
        style={{ ...GLASS, border: isActive ? "1.5px solid #f6ad55" : "1px solid rgba(255,255,255,0.12)", boxShadow: isActive ? "0 0 20px rgba(246,173,85,0.4)" : "none", transition: "all 0.3s" }}>
        <Box position="relative">
            <Image src={player?.picture} boxSize="44px" borderRadius="full"
                border="2px solid" borderColor={isMe ? "cyan.400" : "red.400"}
                style={{ boxShadow: isMe ? "0 0 12px cyan" : "0 0 12px red" }} />
            {isActive && <Box position="absolute" top="-4px" right="-4px" w="12px" h="12px" bg="orange.400" borderRadius="full" style={{ boxShadow: "0 0 8px orange", animation: "pulseOrb 1s infinite" }} />}
        </Box>
        <Box>
            <Text fontSize="xs" color="whiteAlpha.600" fontFamily="Rajdhani" letterSpacing="widest" textTransform="uppercase">{isMe ? "Bạn" : player?.name || "Đối thủ"}</Text>
            <Text fontSize="2xl" fontWeight="900" color={isMe ? "cyan.300" : "red.300"} lineHeight="1" fontFamily="Orbitron">{score || 0}</Text>
        </Box>
        <Box>
            <Text fontSize="9px" color="whiteAlpha.500" letterSpacing="wider">CARDS</Text>
            <Flex gap="3px" mt="2px">{Array.from({ length: cardsLeft || 0 }).map((_, i) => <Box key={i} w="8px" h="12px" borderRadius="2px" bg={isMe ? "cyan.500" : "red.500"} opacity={0.8} />)}</Flex>
        </Box>
    </Flex>
);

const OpponentMiniCard = ({ count }) => (
    <HStack gap={2} justify="center" py={2}>
        {Array.from({ length: count }).map((_, i) => (
            <Box key={i} w="38px" h="56px" borderRadius="6px"
                style={{ background: "linear-gradient(135deg, #1a237e, #283593)", border: "1px solid rgba(100,150,255,0.3)", boxShadow: "0 4px 12px rgba(0,0,0,0.5)", transform: `rotate(${(i - Math.floor(count / 2)) * 4}deg)`, transition: "all 0.3s" }}>
                <Flex align="center" justify="center" h="full">
                    <Text fontSize="16px" opacity={0.4}>🂠</Text>
                </Flex>
            </Box>
        ))}
    </HStack>
);

const ActiveChallenge = ({ word, isFromMe, shake }) => (
    <Box className={`card-in ${shake ? "shake" : ""}`} textAlign="center">
        <Text fontSize="10px" letterSpacing="widest" color="orange.300" fontFamily="Rajdhani" mb={2}>⚔ ĐANG THỬ THÁCH ⚔</Text>
        <Box px={10} py={8} borderRadius="2xl" textAlign="center" position="relative" minW="280px"
            style={{ background: "linear-gradient(135deg, rgba(30,20,60,0.95), rgba(20,10,40,0.98))", border: "2px solid #f6ad55", boxShadow: "0 0 30px rgba(246,173,85,0.4), inset 0 1px 0 rgba(255,255,255,0.1)" }}>
            <Box position="absolute" top="-12px" left="50%" transform="translateX(-50%)" px={3} py={0.5}
                style={{ background: "linear-gradient(90deg, #f6ad55, #ed8936)", borderRadius: "20px" }}>
                <Text fontSize="9px" fontWeight="900" color="white" letterSpacing="widest" fontFamily="Rajdhani">NGHĨA TIẾNG VIỆT</Text>
            </Box>
            <Text fontSize="2xl" fontWeight="900" color="white" lineHeight="1.3" fontFamily="Rajdhani" mb={3}>{word.vietnamese}</Text>
            <Box h="1px" bg="rgba(246,173,85,0.3)" mb={3} />
            <Text fontSize="xs" color="orange.300" letterSpacing="widest" fontFamily="Rajdhani">GỢI Ý: {word.hint}</Text>
        </Box>
    </Box>
);

const MyCard = ({ card, canPick, onPick, index, total }) => {
    const angle = (index - Math.floor(total / 2)) * 6;
    return (
        <Box flexShrink={0} position="relative" style={{ transform: `rotate(${angle}deg) translateY(${Math.abs(angle) * 1.5}px)`, transformOrigin: "bottom center", transition: "all 0.3s cubic-bezier(0.175,0.885,0.32,1.275)" }}
            _hover={canPick ? { transform: `rotate(${angle}deg) translateY(-40px) scale(1.1)`, zIndex: 10 } : {}}
            onClick={() => canPick && onPick(card._id)} cursor={canPick ? "pointer" : "default"}>
            <Box w="110px" h="160px" borderRadius="12px" display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={3} textAlign="center" position="relative" overflow="hidden"
                style={{ background: canPick ? "linear-gradient(135deg, #1a1a4e, #2d1b69)" : "linear-gradient(135deg, #1a2a3a, #0d1f2d)", border: canPick ? "1.5px solid rgba(100,200,255,0.5)" : "1px solid rgba(255,255,255,0.1)", boxShadow: canPick ? "0 8px 24px rgba(0,0,0,0.6), 0 0 15px rgba(100,200,255,0.2)" : "0 4px 12px rgba(0,0,0,0.5)", transition: "all 0.3s" }}>
                <Box position="absolute" top={0} left={0} right={0} h="2px" style={{ background: canPick ? "linear-gradient(90deg, transparent, cyan, transparent)" : "transparent" }} />
                <Text fontSize="8px" color={canPick ? "cyan.400" : "whiteAlpha.400"} letterSpacing="widest" fontFamily="Rajdhani" mb={2}>VOCAB</Text>
                <Text fontSize="sm" fontWeight="700" color={canPick ? "white" : "whiteAlpha.600"} lineHeight="1.3" fontFamily="Rajdhani">{card.vietnamese}</Text>
                <Box position="absolute" bottom={2}>
                    <Text fontSize="8px" color="whiteAlpha.300">#{card._id?.toString().slice(-4)}</Text>
                </Box>
            </Box>
        </Box>
    );
};

const FloatingScore = ({ value, id }) => (
    <Box key={id} position="fixed" top="50%" left="50%" transform="translate(-50%,-50%)" zIndex={200} pointerEvents="none" className="float-score">
        <Text fontSize="5xl" fontWeight="900" color={value > 0 ? "green.300" : "red.400"} fontFamily="Orbitron"
            style={{ textShadow: value > 0 ? "0 0 20px #00ff88" : "0 0 20px #ff2255" }}>{value > 0 ? "+1" : "-1"}</Text>
    </Box>
);

const GamePlayPage = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { socket } = useSocketStore();
    const { currentRoom, players, gameState, currentTurn, scores, phase, activeWord, lastResult, submitAnswer, pickCard, leaveRoom, initListeners } = useGameStore();

    const [answer, setAnswer] = useState("");
    const [shakeCard, setShakeCard] = useState(false);
    const [flashBg, setFlashBg] = useState(null);
    const [floatingScore, setFloatingScore] = useState(null);
    const [floatKey, setFloatKey] = useState(0);
    const inputRef = useRef(null);

    useEffect(() => {
        unlockAudio();
        initListeners(socket);
        if (!currentRoom) navigate("/game");
    }, [socket]);

    useEffect(() => {
        if (lastResult) {
            if (lastResult.isCorrect) {
                playCorrect();
                setFlashBg("green");
                setFloatingScore(1);
            } else {
                playWrong();
                setFlashBg("red");
                setFloatingScore(-1);
                setShakeCard(true);
                setTimeout(() => setShakeCard(false), 600);
            }
            setFloatKey(k => k + 1);
            setTimeout(() => setFlashBg(null), 600);
            setTimeout(() => setFloatingScore(null), 1500);
        }
    }, [lastResult]);

    useEffect(() => {
        if (phase === "answering" && activeWord) {
            playCardPlay();
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [activeWord]);

    const me = players.find(p => p.socketId === socket?.id);
    const opponent = players.find(p => p.socketId !== socket?.id);
    const isMyTurnToPick = players[currentTurn]?.socketId === socket?.id && phase === "picking";
    const isMyTurnToAnswer = players[currentTurn]?.socketId !== socket?.id && phase === "answering";

    const handlePickCard = (cardId) => { if (!isMyTurnToPick) return; pickCard(roomId, cardId); };
    const handleSubmit = () => { if (!answer.trim()) return; submitAnswer(roomId, answer); setAnswer(""); };
    const handleBack = () => { if (window.confirm("Rời khỏi phòng đấu?")) { leaveRoom(roomId); navigate("/game"); } };

    if (!currentRoom) return <Flex justify="center" align="center" minH="100vh" bg="#0f0c29"><Spinner size="xl" color="cyan.400" /></Flex>;

    const myScore = scores[me?.socketId] || 0;
    const oppScore = scores[opponent?.socketId] || 0;
    const isMyTurnActive = isMyTurnToPick || isMyTurnToAnswer;

    return (
        <Box minH="100vh" position="relative" overflow="hidden" style={{ background: ARENA_BG }}>
            <style>{CSS}</style>

            {/* Background orbs */}
            <Box position="absolute" top="10%" left="5%" w="300px" h="300px" borderRadius="full" style={{ background: "radial-gradient(circle, rgba(0,200,255,0.07) 0%, transparent 70%)", animation: "pulseOrb 4s infinite" }} />
            <Box position="absolute" bottom="10%" right="5%" w="250px" h="250px" borderRadius="full" style={{ background: "radial-gradient(circle, rgba(255,50,100,0.07) 0%, transparent 70%)", animation: "pulseOrb 3s infinite 1s" }} />

            {/* Screen flash on result */}
            {flashBg && (
                <Box position="fixed" inset={0} zIndex={50} pointerEvents="none"
                    style={{ background: flashBg === "green" ? "rgba(0,255,136,0.08)" : "rgba(255,30,60,0.1)", transition: "opacity 0.3s" }} />
            )}

            {/* Floating score */}
            {floatingScore !== null && <FloatingScore value={floatingScore} id={floatKey} />}

            <Flex direction="column" h="100vh" px={4} py={3} maxW="600px" mx="auto">
                {/* Top bar */}
                <Flex justify="space-between" align="center" mb={3}>
                    <Button size="sm" variant="ghost" color="whiteAlpha.600" _hover={{ color: "white" }} onClick={handleBack} gap={1}>
                        <FiArrowLeft /> Rời
                    </Button>
                    <Box textAlign="center">
                        <Text fontSize="xs" fontFamily="Orbitron" color={gameState === "playing" ? "orange.300" : "whiteAlpha.500"} letterSpacing="widest">
                            {gameState === "playing" ? "⚔ ĐANG GIAO CHIẾN" : "⏳ CHỜ ĐỐI THỦ..."}
                        </Text>
                    </Box>
                    <Box w="60px" />
                </Flex>

                {/* Opponent HUD */}
                <Flex direction="column" align="center" gap={2} mb={3}>
                    <PlayerHUD player={opponent} score={oppScore} isActive={!isMyTurnToPick && phase === "picking"} isMe={false} cardsLeft={opponent?.cards?.length} />
                    <OpponentMiniCard count={opponent?.cards?.length || 0} />
                </Flex>

                {/* Center Arena */}
                <Flex flex={1} align="center" justify="center" direction="column" gap={4} position="relative">
                    {/* Turn indicator */}
                    <Box px={6} py={1} borderRadius="full" style={{ ...GLASS, border: isMyTurnActive ? "1px solid rgba(100,200,255,0.4)" : "1px solid rgba(255,255,255,0.08)" }}>
                        <Text fontSize="10px" fontFamily="Rajdhani" letterSpacing="widest" color={isMyTurnActive ? "cyan.300" : "whiteAlpha.400"} textTransform="uppercase">
                            {isMyTurnToPick ? "🎯 Lượt chọn bài của bạn" : isMyTurnToAnswer ? "⚡ Hãy nhập từ tiếng Anh!" : phase === "picking" ? "⏳ Đợi đối thủ chọn bài..." : "⏳ Đối thủ đang trả lời..."}
                        </Text>
                    </Box>

                    {/* Active challenge card */}
                    {phase === "answering" && activeWord ? (
                        <ActiveChallenge word={activeWord} isFromMe={players[currentTurn]?.socketId === socket?.id} shake={shakeCard} />
                    ) : (
                        <Box textAlign="center" opacity={0.15}>
                            <Text fontSize="80px" lineHeight="1" style={{ fontFamily: "Orbitron", fontWeight: 900 }}>VS</Text>
                        </Box>
                    )}

                    {/* Last result feedback */}
                    {lastResult && (
                        <Box className="slide-up" px={6} py={3} borderRadius="xl" textAlign="center"
                            style={{ background: lastResult.isCorrect ? "rgba(0,255,136,0.12)" : "rgba(255,30,60,0.12)", border: `1px solid ${lastResult.isCorrect ? "rgba(0,255,136,0.4)" : "rgba(255,30,60,0.4)"}` }}>
                            <Text fontSize="lg" fontWeight="900" fontFamily="Orbitron" color={lastResult.isCorrect ? "green.300" : "red.300"}>
                                {lastResult.isCorrect ? "✓ CORRECT!" : "✗ WRONG!"}
                            </Text>
                            {!lastResult.isCorrect && (
                                <Text fontSize="sm" color="whiteAlpha.700" mt={1} fontFamily="Rajdhani">
                                    Đáp án đúng: <Text as="span" color="orange.300" fontWeight="bold">{lastResult.correctMeaning}</Text>
                                </Text>
                            )}
                        </Box>
                    )}

                    {/* Answer input */}
                    {isMyTurnToAnswer && (
                        <Box className="slide-up" w="full" maxW="400px"
                            style={{ background: "rgba(0,200,255,0.06)", border: "1px solid rgba(0,200,255,0.3)", borderRadius: "16px", boxShadow: "0 0 20px rgba(0,200,255,0.1)" }}
                            p={4}>
                            <Text fontSize="10px" color="cyan.400" letterSpacing="widest" fontFamily="Rajdhani" mb={3}>NHẬP TỪ TIẾNG ANH</Text>
                            <HStack>
                                <Input
                                    ref={inputRef}
                                    value={answer}
                                    onChange={e => setAnswer(e.target.value)}
                                    onKeyPress={e => e.key === "Enter" && handleSubmit()}
                                    placeholder="Gõ từ tiếng Anh..."
                                    style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(0,200,255,0.3)", color: "white", borderRadius: "10px", fontFamily: "Rajdhani", fontSize: "16px", fontWeight: 600 }}
                                    _placeholder={{ color: "whiteAlpha.400" }}
                                    _focus={{ borderColor: "cyan.400", boxShadow: "0 0 0 1px cyan" }}
                                    size="lg"
                                />
                                <IconButton onClick={handleSubmit} disabled={!answer.trim()} size="lg" borderRadius="10px"
                                    style={{ background: "linear-gradient(135deg, #00b4d8, #0077b6)", border: "none", color: "white", minW: "52px" }}>
                                    <FiSend />
                                </IconButton>
                            </HStack>
                        </Box>
                    )}
                </Flex>

                {/* My hand */}
                <Box mb={2}>
                    {isMyTurnToPick && (
                        <Text textAlign="center" fontSize="10px" color="orange.300" letterSpacing="widest" fontFamily="Rajdhani" mb={2} style={{ animation: "pulseOrb 1.5s infinite" }}>
                            ▼ CHỌN MỘT LÁ BÀI ĐỂ TẤN CÔNG ▼
                        </Text>
                    )}
                    <Box overflowX="auto" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }} pb={2}>
                        <HStack gap={2} justify="center" px={4} style={{ minWidth: "fit-content" }}>
                            {me?.cards?.map((card, i) => (
                                <MyCard key={card._id} card={card} canPick={isMyTurnToPick} onPick={handlePickCard} index={i} total={me.cards.length} />
                            ))}
                        </HStack>
                    </Box>
                </Box>

                {/* My HUD */}
                <Flex justify="center" pb={2}>
                    <PlayerHUD player={me} score={myScore} isActive={isMyTurnToPick} isMe={true} cardsLeft={me?.cards?.length} />
                </Flex>
            </Flex>

            {/* Result Modal */}
            {gameState === "finished" && (
                <Portal>
                    <Box position="fixed" inset={0} zIndex={200} display="flex" alignItems="center" justifyContent="center"
                        style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }}>
                        <Box p={10} borderRadius="24px" textAlign="center" maxW="440px" w="full" mx={4} className="win-pulse"
                            style={{ background: "linear-gradient(135deg, rgba(20,10,50,0.98), rgba(10,20,40,0.98))", border: `2px solid ${myScore > oppScore ? "#00ff88" : myScore < oppScore ? "#ff2255" : "#f6ad55"}`, boxShadow: `0 0 60px ${myScore > oppScore ? "rgba(0,255,136,0.3)" : myScore < oppScore ? "rgba(255,30,60,0.3)" : "rgba(246,173,85,0.3)"}` }}>
                            <Text fontSize="5xl" mb={2}>{myScore > oppScore ? "🏆" : myScore < oppScore ? "💀" : "🤝"}</Text>
                            <Text fontSize="3xl" fontWeight="900" fontFamily="Orbitron" color={myScore > oppScore ? "green.300" : myScore < oppScore ? "red.300" : "yellow.300"} mb={1}>
                                {myScore > oppScore ? "CHIẾN THẮNG!" : myScore < oppScore ? "THẤT BẠI!" : "HÒA!"}
                            </Text>
                            <Text fontSize="sm" color="whiteAlpha.500" fontFamily="Rajdhani" letterSpacing="widest" mb={6}>KẾT QUẢ CHUNG CUỘC</Text>
                            <HStack gap={8} justify="center" mb={8}>
                                <VStack gap={1}>
                                    <Image src={me?.picture} boxSize="56px" borderRadius="full" border="2px solid" borderColor="cyan.400" style={{ boxShadow: "0 0 15px cyan" }} />
                                    <Text color="cyan.300" fontSize="sm" fontFamily="Rajdhani">Bạn</Text>
                                    <Text fontSize="4xl" fontWeight="900" fontFamily="Orbitron" color="cyan.300">{myScore}</Text>
                                </VStack>
                                <Text fontSize="xl" color="whiteAlpha.400" fontFamily="Orbitron">VS</Text>
                                <VStack gap={1}>
                                    <Image src={opponent?.picture} boxSize="56px" borderRadius="full" border="2px solid" borderColor="red.400" style={{ boxShadow: "0 0 15px red" }} />
                                    <Text color="red.300" fontSize="sm" fontFamily="Rajdhani">{opponent?.name}</Text>
                                    <Text fontSize="4xl" fontWeight="900" fontFamily="Orbitron" color="red.300">{oppScore}</Text>
                                </VStack>
                            </HStack>
                            <Button w="full" size="lg" onClick={() => { leaveRoom(roomId); navigate("/game"); }}
                                style={{ background: "linear-gradient(135deg, #1a237e, #283593)", border: "1px solid rgba(100,150,255,0.4)", color: "white", fontFamily: "Rajdhani", letterSpacing: "widest", fontSize: "16px", borderRadius: "12px", height: "52px" }}>
                                QUAY LẠI LOBBY
                            </Button>
                        </Box>
                    </Box>
                </Portal>
            )}
        </Box>
    );
};

export default GamePlayPage;
