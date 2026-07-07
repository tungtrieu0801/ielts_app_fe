import React, { useEffect, useState } from "react";
import { Box, Flex, Text, Button, SimpleGrid, Input, VStack, IconButton, Badge, Spinner, Image } from "@chakra-ui/react";
import { FiPlus, FiUsers, FiArrowRight, FiX, FiLock, FiUnlock, FiZap, FiAward, FiHeart, FiActivity } from "react-icons/fi";
import BaseLayout from "../../../layouts/BaseLayout.jsx";
import { useGameStore } from "../../../stores/useGameStore.js";
import { useAuthStore } from "../../../stores/useAuthStore.js";
import { useSocketStore } from "../../../stores/useSocketStore.js";
import { useSurvivalStore } from "../../../stores/useSurvivalStore.js";
import { useNavigate } from "react-router-dom";

const LOBBY_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Orbitron:wght@700;900&display=swap');
.font-orbitron { font-family: 'Orbitron', sans-serif; }
.font-rajdhani { font-family: 'Rajdhani', sans-serif; }

@keyframes lobbyFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
.lobby-float { animation: lobbyFloat 3s ease-in-out infinite; }
.room-card { transition: all 0.3s cubic-bezier(0.175,0.885,0.32,1.275); }
.room-card:hover { transform: translateY(-6px); }
.modal-in { animation: lobbyFloat 0.25s ease-out; }
`;

const StyledInput = ({ label, ...props }) => (
    <Box>
        <Text fontSize="10px" color="fg.muted" letterSpacing="widest" className="font-rajdhani" mb={1}
            textTransform="uppercase" fontWeight="700">{label}</Text>
        <Input
            bg="bg.subtle" color="fg"
            borderColor="border.muted"
            _placeholder={{ color: "fg.subtle" }}
            _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px rgba(66,153,225,0.4)" }}
            borderRadius="10px" className="font-rajdhani" fontSize="15px" fontWeight="600"
            {...props}
        />
    </Box>
);

const Modal = ({ title, icon, onClose, children }) => (
    <Box position="fixed" inset={0} zIndex={1000} display="flex" alignItems="center" justifyContent="center" p={4}
        bg="blackAlpha.600" style={{ backdropFilter: "blur(6px)" }}>
        <Box className="modal-in" w="full" maxW="400px" p={8}
            bg="bg.panel" border="1px solid" borderColor="border.muted"
            borderRadius="20px" shadow="2xl">
            <Flex justify="space-between" align="center" mb={6}>
                <Flex align="center" gap={2}>
                    {icon}
                    <Text fontSize="lg" fontWeight="900" color="fg" className="font-orbitron">{title}</Text>
                </Flex>
                <IconButton variant="ghost" onClick={onClose} color="fg.muted" size="sm"><FiX /></IconButton>
            </Flex>
            {children}
        </Box>
    </Box>
);

const GameLobbyPage = () => {
    const { rooms, getRooms, createRoom, joinRoom, currentRoom } = useGameStore();
    const { user } = useAuthStore();
    const { socket } = useSocketStore();
    const navigate = useNavigate();

    // Survival singleplayer store
    const { leaderboard, stats, fetchLeaderboard, fetchStats, loading: survivalLoading } = useSurvivalStore();

    // Tab state: 'singleplayer' | 'multiplayer'
    const [gameMode, setGameMode] = useState("singleplayer");

    // Modal state
    const [newRoomName, setNewRoomName] = useState("");
    const [newRoomPassword, setNewRoomPassword] = useState("");
    const [creating, setCreating] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [joinRoomId, setJoinRoomId] = useState(null);
    const [joinPassword, setJoinPassword] = useState("");
    const [isJoinOpen, setIsJoinOpen] = useState(false);

    useEffect(() => {
        if (socket && gameMode === "multiplayer") getRooms();
    }, [socket, gameMode]);

    useEffect(() => {
        if (gameMode === "singleplayer") {
            fetchLeaderboard();
            fetchStats();
        }
    }, [gameMode]);

    useEffect(() => { if (currentRoom) navigate(`/game/${currentRoom.id}`); }, [currentRoom, navigate]);

    const handleCreate = () => {
        if (!newRoomName.trim()) return;
        setCreating(true);
        createRoom(newRoomName, user, newRoomPassword);
        setNewRoomName(""); setNewRoomPassword("");
        setCreating(false); setIsCreateOpen(false);
    };

    const handleJoinClick = (room) => {
        if (room.isPrivate) { setJoinRoomId(room.id); setJoinPassword(""); setIsJoinOpen(true); }
        else joinRoom(room.id, user, "");
    };

    const handleConfirmJoin = () => {
        if (!joinPassword) return;
        joinRoom(joinRoomId, user, joinPassword);
        setIsJoinOpen(false);
    };

    // Find current user's high score from leaderboard
    const userHighScore = leaderboard.find(p => p.name === user?.name || p.email === user?.email)?.score || 0;

    return (
        <BaseLayout>
            <style>{LOBBY_CSS}</style>
            <Box maxW="1100px" mx="auto" px={{ base: 2, md: 4 }}>

                {/* Header Title */}
                <Flex align="center" gap={3} mb={6}>
                    <Box className="lobby-float" fontSize="32px">🎮</Box>
                    <Box>
                        <Text fontSize={{ base: "22px", md: "26px" }} fontWeight="900" className="font-orbitron"
                            color="fg" lineHeight="1" letterSpacing="-0.5px">
                            TRÒ CHƠI TỪ VỰNG
                        </Text>
                        <Text fontSize="11px" className="font-rajdhani" color="blue.500" letterSpacing="widest" fontWeight="700">
                            LEARN AND PLAY ARENA
                        </Text>
                    </Box>
                </Flex>

                {/* Mode Selector Tabs */}
                <Flex gap={3} mb={8} bg="bg.panel" p={1.5} borderRadius="2xl" border="1px solid" borderColor="border.muted">
                    <Button
                        flex={1}
                        h="46px"
                        borderRadius="xl"
                        variant={gameMode === "singleplayer" ? "solid" : "ghost"}
                        colorPalette={gameMode === "singleplayer" ? "blue" : "gray"}
                        className="font-rajdhani"
                        fontWeight="700"
                        fontSize="15px"
                        onClick={() => setGameMode("singleplayer")}
                        gap={2}
                    >
                        <FiHeart fill={gameMode === "singleplayer" ? "currentColor" : "none"} /> CHƠI ĐƠN: SINH TỒN
                    </Button>
                    <Button
                        flex={1}
                        h="46px"
                        borderRadius="xl"
                        variant={gameMode === "multiplayer" ? "solid" : "ghost"}
                        colorPalette={gameMode === "multiplayer" ? "orange" : "gray"}
                        className="font-rajdhani"
                        fontWeight="700"
                        fontSize="15px"
                        onClick={() => setGameMode("multiplayer")}
                        gap={2}
                    >
                        <FiUsers /> CHƠI ĐẤU: ARENA
                    </Button>
                </Flex>

                {/* ════ SINGLEPLAYER GAME MODE ════ */}
                {gameMode === "singleplayer" && (
                    <SimpleGrid columns={{ base: 1, lg: 3 }} gap={6}>
                        
                        {/* Main Description & Play Info (Span 2) */}
                        <Box gridColumn={{ lg: "span 2" }} display="flex" flexDirection="column" gap={6}>
                            {/* Card Intro */}
                            <Box bg="bg.panel" p={6} borderRadius="3xl" border="1px solid" borderColor="border.muted" shadow="sm">
                                <Flex justify="space-between" align="start" mb={4} flexWrap="wrap" gap={3}>
                                    <Box>
                                        <Heading fontSize="2xl" fontWeight="900" color="fg" mb={1} className="font-rajdhani">
                                            Multiple Choice Survival
                                        </Heading>
                                        <Text fontSize="xs" color="fg.muted" className="font-rajdhani" fontWeight="700" letterSpacing="wide">
                                            TRẮC NGHIỆM SINH TỒN TIẾNG ANH
                                        </Text>
                                    </Box>
                                    <Badge colorPalette="blue" size="lg" className="font-orbitron">
                                        CEFR A1 - C1
                                    </Badge>
                                </Flex>

                                <Text fontSize="sm" color="fg.muted" mb={6} lineHeight="1.6">
                                    Thử thách khả năng dịch nghĩa từ vựng tiếng Anh. Bạn có <strong>3 mạng (trái tim)</strong>. 
                                    Mỗi câu trả lời sai sẽ mất 1 mạng. Hãy duy trì chuỗi trả lời đúng liên tục (combo streak) để gia tăng số điểm của mình. 
                                    Dữ liệu từ vựng lấy trực tiếp từ bộ 6,000 từ chuẩn Oxford (A1 - C1).
                                </Text>

                                <Flex align="center" justify="space-between" bg="bg.subtle" p={4} borderRadius="2xl" mb={6} borderWidth="1px" borderColor="border.muted" flexWrap="wrap" gap={3}>
                                    <Box>
                                        <Text fontSize="11px" className="font-rajdhani" color="fg.muted" fontWeight="700">KỶ LỤC CỦA BẠN</Text>
                                        <Text fontSize="2xl" fontWeight="900" color="orange.500" className="font-orbitron">{userHighScore} điểm</Text>
                                    </Box>
                                    <Box>
                                        <Text fontSize="11px" className="font-rajdhani" color="fg.muted" fontWeight="700">TỪ ĐÃ GẶP</Text>
                                        <Text fontSize="2xl" fontWeight="900" color="blue.500" className="font-orbitron">
                                            {stats?.totalGameWords || 0} từ
                                        </Text>
                                    </Box>
                                    <Button
                                        colorPalette="blue"
                                        size="lg"
                                        h="50px"
                                        borderRadius="xl"
                                        className="font-rajdhani"
                                        fontWeight="700"
                                        fontSize="15px"
                                        onClick={() => navigate("/game/survival/play")}
                                        gap={2}
                                        shadow="md"
                                        _hover={{ transform: "translateY(-2px)" }}
                                    >
                                        CHƠI NGAY <FiArrowRight />
                                    </Button>
                                </Flex>
                            </Box>

                            {/* Weak Words & Stats */}
                            <Box bg="bg.panel" p={6} borderRadius="3xl" border="1px solid" borderColor="border.muted" shadow="sm">
                                <Flex align="center" gap={2} mb={4}>
                                    <FiActivity size={18} color="#e53e3e" />
                                    <Text fontSize="lg" fontWeight="900" className="font-rajdhani">TỪ VỰNG CẦN LƯU Ý (SAI NHIỀU NHẤT)</Text>
                                </Flex>
                                
                                {survivalLoading ? (
                                    <Flex justify="center" py={6}><Spinner /></Flex>
                                ) : !stats || stats.wrongWords.length === 0 ? (
                                    <Text fontSize="sm" color="fg.muted" fontStyle="italic" py={4}>
                                        Bạn chưa trả lời sai từ nào trong game. Hãy tiếp tục phát huy!
                                    </Text>
                                ) : (
                                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
                                        {stats.wrongWords.map((item, idx) => (
                                            <Flex key={idx} justify="space-between" align="center" p={3} bg="bg.subtle" borderRadius="xl" border="1px solid" borderColor="border.muted">
                                                <Box>
                                                    <Text fontWeight="bold" fontSize="md" color="red.500">{item.word}</Text>
                                                    <Text fontSize="xs" color="fg.muted" isTruncated maxW="180px">{item.vietnamese}</Text>
                                                </Box>
                                                <Badge colorPalette="red" variant="subtle" size="md">
                                                    Sai {item.wrongCount} lần
                                                </Badge>
                                            </Flex>
                                        ))}
                                    </SimpleGrid>
                                )}
                            </Box>
                        </Box>

                        {/* Leaderboard Column */}
                        <Box bg="bg.panel" p={6} borderRadius="3xl" border="1px solid" borderColor="border.muted" shadow="sm" display="flex" flexDirection="column" maxH="600px">
                            <Flex align="center" gap={2} mb={5}>
                                <FiAward size={20} color="#ecc94b" />
                                <Text fontSize="lg" fontWeight="900" className="font-orbitron">XẾP HẠNG</Text>
                            </Flex>

                            <VStack align="stretch" gap={3} flex={1} overflowY="auto" pr={1}>
                                {survivalLoading ? (
                                    <Flex justify="center" py={10}><Spinner /></Flex>
                                ) : leaderboard.length === 0 ? (
                                    <Text fontSize="sm" color="fg.muted" fontStyle="italic">Chưa có ai ghi danh bảng xếp hạng.</Text>
                                ) : (
                                    leaderboard.map((player) => (
                                        <Flex key={player.rank} align="center" gap={3} p={2.5} bg="bg.subtle" borderRadius="2xl" border="1px solid" borderColor="border.muted">
                                            {/* Rank Indicator */}
                                            <Flex w="24px" h="24px" align="center" justify="center" borderRadius="full" 
                                                bg={player.rank === 1 ? "yellow.400" : player.rank === 2 ? "gray.300" : player.rank === 3 ? "orange.300" : "transparent"}
                                                color={player.rank <= 3 ? "white" : "fg.muted"}
                                                fontWeight="bold" fontSize="xs">
                                                {player.rank}
                                            </Flex>

                                            {/* Avatar */}
                                            {player.picture ? (
                                                <Image src={player.picture} w="28px" h="28px" borderRadius="full" />
                                            ) : (
                                                <Flex w="28px" h="28px" borderRadius="full" bg="blue.100" _dark={{ bg: "blue.900/30" }} align="center" justify="center" fontSize="10px" fontWeight="bold">
                                                    {player.name?.charAt(0).toUpperCase()}
                                                </Flex>
                                            )}

                                            {/* Name / Score */}
                                            <Box flex={1} overflow="hidden">
                                                <Text fontSize="xs" fontWeight="700" isTruncated color="fg">{player.name}</Text>
                                                <Text fontSize="10px" color="fg.muted" isTruncated>{player.email}</Text>
                                            </Box>
                                            <Text fontSize="sm" fontWeight="900" color="blue.500" className="font-orbitron">{player.score}</Text>
                                        </Flex>
                                    ))
                                )}
                            </VStack>
                        </Box>
                    </SimpleGrid>
                )}

                {/* ════ MULTIPLAYER GAME MODE ════ */}
                {gameMode === "multiplayer" && (
                    <Box>
                        {/* Lobby Room Header */}
                        <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
                            <Box>
                                <Heading fontSize="xl" fontWeight="900" className="font-rajdhani">Phòng Thách Đấu</Heading>
                                <Text fontSize="xs" color="fg.muted">Tham gia hoặc tạo phòng để đấu trực diện với người khác.</Text>
                            </Box>
                            <Button gap={2} px={6} h="42px" borderRadius="xl"
                                className="font-rajdhani" fontWeight="700" letterSpacing="wider" fontSize="13px"
                                colorPalette="orange" variant="solid"
                                shadow="0 4px 15px rgba(246,173,85,0.25)"
                                _hover={{ shadow: "0 6px 20px rgba(246,173,85,0.4)", transform: "translateY(-1.5px)" }}
                                onClick={() => setIsCreateOpen(true)}>
                                <FiPlus /> TẠO PHÒNG MỚI
                            </Button>
                        </Flex>

                        {/* Rooms List */}
                        {rooms.length === 0 ? (
                            <Flex direction="column" align="center" justify="center" py={20}
                                borderRadius="20px" border="2px dashed" borderColor="border.muted">
                                <Text fontSize="48px" mb={3} className="lobby-float">🎮</Text>
                                <Text fontWeight="900" fontSize="lg" color="fg" className="font-orbitron" mb={1}>
                                    Chưa có phòng nào
                                </Text>
                                <Text fontSize="sm" color="fg.muted" className="font-rajdhani">
                                    Hãy tạo phòng đầu tiên để thách đấu!
                                </Text>
                            </Flex>
                        ) : (
                            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={5}>
                                {rooms.map((room) => {
                                    const isFull = room.playerCount >= 2 || room.status === "playing";
                                    return (
                                        <Box key={room.id} className="room-card" p={5}
                                            bg="bg.panel" border="1px solid" borderColor="border.muted"
                                            borderRadius="16px" shadow="sm"
                                            _hover={{ borderColor: "blue.300", shadow: "lg",
                                                _dark: { borderColor: "cyan.800" } }}>

                                            {/* Status + player count */}
                                            <Flex justify="space-between" align="center" mb={4}>
                                                <Box px={3} py={1} borderRadius="full"
                                                    bg={room.status === "playing" ? "red.50" : "green.50"}
                                                    border="1px solid"
                                                    borderColor={room.status === "playing" ? "red.200" : "green.200"}
                                                    _dark={{
                                                        bg: room.status === "playing" ? "rgba(255,30,60,0.12)" : "rgba(0,200,100,0.12)",
                                                        borderColor: room.status === "playing" ? "rgba(255,30,60,0.35)" : "rgba(0,200,100,0.35)"
                                                    }}>
                                                    <Text fontSize="9px" className="font-rajdhani" letterSpacing="widest" fontWeight="700"
                                                        color={room.status === "playing" ? "red.500" : "green.600"}
                                                        _dark={{ color: room.status === "playing" ? "red.300" : "green.300" }}>
                                                        {room.status === "playing" ? "⚔ ĐANG ĐẤU" : "⏳ CHỜ NGƯỜI"}
                                                    </Text>
                                                </Box>
                                                <Flex align="center" gap={1} color="fg.muted">
                                                    <FiUsers size={12} />
                                                    <Text fontSize="xs" className="font-rajdhani" fontWeight="700">
                                                        {room.playerCount}/2
                                                    </Text>
                                                </Flex>
                                            </Flex>

                                            {/* Room name */}
                                            <Flex align="center" gap={2} mb={5}>
                                                <Box color={room.isPrivate ? "orange.400" : "fg.subtle"}>
                                                    {room.isPrivate ? <FiLock size={14} /> : <FiUnlock size={14} />}
                                                </Box>
                                                <Text fontWeight="700" color="fg" className="font-rajdhani" fontSize="lg"
                                                    lineHeight="1.2" noOfLines={1}>
                                                    {room.name}
                                                </Text>
                                            </Flex>

                                            {/* Join button */}
                                            {isFull ? (
                                                <Box h="42px" borderRadius="10px" bg="bg.subtle"
                                                    display="flex" alignItems="center" justifyContent="center">
                                                    <Text fontSize="12px" className="font-rajdhani" fontWeight="700"
                                                        color="fg.subtle" letterSpacing="widest">
                                                        PHÒNG ĐÃ ĐẦY
                                                    </Text>
                                                </Box>
                                            ) : (
                                                <Button w="full" h="42px" borderRadius="10px" colorPalette="blue"
                                                    className="font-rajdhani" fontWeight="700" letterSpacing="wider" fontSize="13px"
                                                    gap={2} onClick={() => handleJoinClick(room)}
                                                    _hover={{ transform: "translateY(-1px)", shadow: "md" }}>
                                                    <FiArrowRight /> THAM GIA NGAY
                                                </Button>
                                            )}
                                        </Box>
                                    );
                                })}
                            </SimpleGrid>
                        )}
                    </Box>
                )}
            </Box>

            {/* Create Room Modal */}
            {isCreateOpen && (
                <Modal title="TẠO PHÒNG ĐẤU" icon={<FiZap color="#ed8936" />} onClose={() => setIsCreateOpen(false)}>
                    <VStack gap={4} align="stretch">
                        <StyledInput label="Tên phòng" placeholder="VD: Thách đấu tiếng Anh..."
                            value={newRoomName} onChange={e => setNewRoomName(e.target.value)} autoFocus
                            onKeyPress={e => e.key === "Enter" && handleCreate()} />
                        <StyledInput label="Mật khẩu (tùy chọn)" type="password"
                            placeholder="Để trống nếu phòng mở"
                            value={newRoomPassword} onChange={e => setNewRoomPassword(e.target.value)}
                            onKeyPress={e => e.key === "Enter" && handleCreate()} />
                        <Flex align="center" gap={2} p={3} borderRadius="10px"
                            bg={newRoomPassword ? "orange.50" : "bg.subtle"}
                            border="1px solid" borderColor={newRoomPassword ? "orange.200" : "border.muted"}
                            _dark={{ bg: newRoomPassword ? "rgba(246,173,85,0.08)" : "bg.subtle",
                                     borderColor: newRoomPassword ? "rgba(246,173,85,0.3)" : "border.muted" }}>
                            <Box color={newRoomPassword ? "orange.400" : "fg.subtle"}>
                                {newRoomPassword ? <FiLock size={12} /> : <FiUnlock size={12} />}
                            </Box>
                            <Text fontSize="11px" className="font-rajdhani" fontWeight="600"
                                color={newRoomPassword ? "orange.600" : "fg.muted"}
                                _dark={{ color: newRoomPassword ? "orange.300" : "fg.muted" }}>
                                {newRoomPassword ? "Phòng riêng tư — Cần mật khẩu để vào" : "Phòng mở — Ai cũng có thể vào"}
                            </Text>
                        </Flex>
                        <Button w="full" h="48px" borderRadius="10px" colorPalette="orange"
                            className="font-rajdhani" fontWeight="700" letterSpacing="wider" fontSize="14px"
                            disabled={!newRoomName.trim()} loading={creating} onClick={handleCreate} gap={2}>
                            ⚔ BẮT ĐẦU CHIẾN
                        </Button>
                    </VStack>
                </Modal>
            )}

            {/* Join Private Room Modal */}
            {isJoinOpen && (
                <Modal title="PHÒNG RIÊNG TƯ" icon={<FiLock color="#ed8936" />} onClose={() => setIsJoinOpen(false)}>
                    <VStack gap={4} align="stretch">
                        <Text fontSize="sm" color="fg.muted" className="font-rajdhani">
                            Phòng này được bảo vệ bằng mật khẩu. Nhập đúng để tham gia.
                        </Text>
                        <StyledInput label="Mật khẩu" type="password" placeholder="Nhập mật khẩu phòng..."
                            value={joinPassword} onChange={e => setJoinPassword(e.target.value)} autoFocus
                            onKeyPress={e => e.key === "Enter" && handleConfirmJoin()} />
                        <Button w="full" h="48px" borderRadius="10px" colorPalette="blue"
                            className="font-rajdhani" fontWeight="700" letterSpacing="wider" fontSize="14px"
                            disabled={!joinPassword} onClick={handleConfirmJoin} gap={2}>
                            <FiArrowRight /> VÀO PHÒNG
                        </Button>
                    </VStack>
                </Modal>
            )}
        </BaseLayout>
    );
};

export default GameLobbyPage;
