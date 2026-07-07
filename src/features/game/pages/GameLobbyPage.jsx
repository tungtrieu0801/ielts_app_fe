import React, { useEffect, useState } from "react";
import { Box, Flex, Text, Button, SimpleGrid, Input, VStack, Badge, Spinner, Image, Heading, HStack } from "@chakra-ui/react";
import { FiPlus, FiUsers, FiArrowRight, FiX, FiLock, FiUnlock, FiZap, FiAward, FiHeart, FiActivity, FiArrowLeft } from "react-icons/fi";
import BaseLayout from "../../../layouts/BaseLayout.jsx";
import { useGameStore } from "../../../stores/useGameStore.js";
import { useAuthStore } from "../../../stores/useAuthStore.js";
import { useSocketStore } from "../../../stores/useSocketStore.js";
import { useNavigate } from "react-router-dom";
import { useSurvivalStore } from "../../../stores/useSurvivalStore.js";

const LOBBY_CSS = `
@keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-6px); }
    100% { transform: translateY(0px); }
}
.lobby-float { animation: float 3s ease-in-out infinite; }

@keyframes modalIn {
    from { opacity: 0; transform: scale(0.9) translateY(20px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
}
.modal-in { animation: modalIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }

.menu-item {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.menu-item:hover {
    transform: translateX(6px);
}
`;

const StyledInput = ({ label, ...props }) => (
    <Box>
        <Text fontSize="10px" color="fg.muted" letterSpacing="widest" mb={1}
            textTransform="uppercase" fontWeight="700">{label}</Text>
        <Input
            bg="bg.subtle" color="fg"
            borderColor="border.muted"
            _placeholder={{ color: "fg.subtle" }}
            _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px rgba(66,153,225,0.4)" }}
            borderRadius="10px" fontSize="15px" fontWeight="600"
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
                    <Text fontSize="lg" fontWeight="900" color="fg">{title}</Text>
                </Flex>
                <Button variant="ghost" onClick={onClose} color="fg.muted" size="sm" borderRadius="full" p={0} minW="32px" h="32px"><FiX /></Button>
            </Flex>
            {children}
        </Box>
    </Box>
);

const GAMES_LIST = [
    {
        id: "survival",
        title: "Multiple Choice Survival",
        subtitle: "Trắc nghiệm sinh tồn",
        icon: "❤️",
        category: "singleplayer",
        description: "Thử thách khả năng dịch nghĩa từ vựng tiếng Anh. Bạn có 3 mạng (trái tim). Trả lời sai mất 1 mạng. Hãy duy trì chuỗi trả lời đúng liên tục để leo combo và ghi điểm kỷ lục.",
        badge: "CEFR A1 - C1",
        levels: ["A1", "A2", "B1", "B2", "C1"],
    },
    {
        id: "spelling",
        title: "Spelling Master",
        subtitle: "Chinh phục chính tả",
        icon: "✍️",
        category: "singleplayer",
        comingSoon: true,
        description: "Luyện nghe phát âm từ vựng và gõ chính tả chính xác dưới áp lực thời gian. Giúp ghi nhớ mặt chữ tiếng Anh sâu sắc.",
        badge: "Sắp Ra Mắt",
    },
    {
        id: "arena",
        title: "Đấu Trường Từ Vựng",
        subtitle: "Realtime Battle Arena",
        icon: "⚔️",
        category: "multiplayer",
        description: "Đấu trường đối kháng thời gian thực. Đăng ký phòng đấu hoặc tham gia các phòng có sẵn để thi tài trả lời nhanh và chính xác với những người học khác.",
    },
    {
        id: "speedrun",
        title: "Speed Run Word",
        subtitle: "Đua tốc độ",
        icon: "⚡",
        category: "multiplayer",
        comingSoon: true,
        description: "Ai trả lời nhanh nhất và nhiều nhất trong vòng 60 giây sẽ giành chiến thắng. Phù hợp cho nhóm đấu đông người.",
        badge: "Sắp Ra Mắt",
    }
];

const GameLobbyPage = () => {
    const { rooms, getRooms, createRoom, joinRoom, currentRoom } = useGameStore();
    const { user } = useAuthStore();
    const { socket } = useSocketStore();
    const navigate = useNavigate();

    // Survival singleplayer store
    const { leaderboard, stats, fetchLeaderboard, fetchStats, loading: survivalLoading } = useSurvivalStore();

    // Active Game state
    const [activeGameId, setActiveGameId] = useState("survival");

    // Selected CEFR levels for survival
    const [selectedLevels, setSelectedLevels] = useState(["A1", "A2", "B1", "B2", "C1"]);

    // Modal state
    const [newRoomName, setNewRoomName] = useState("");
    const [newRoomPassword, setNewRoomPassword] = useState("");
    const [creating, setCreating] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [joinRoomId, setJoinRoomId] = useState(null);
    const [joinPassword, setJoinPassword] = useState("");
    const [isJoinOpen, setIsJoinOpen] = useState(false);

    // Fetch data based on active game
    useEffect(() => {
        if (activeGameId === "arena" && socket) {
            getRooms();
        }
    }, [activeGameId, socket]);

    useEffect(() => {
        if (activeGameId === "survival") {
            fetchLeaderboard();
            fetchStats();
        }
    }, [activeGameId]);

    useEffect(() => {
        if (currentRoom) navigate(`/game/${currentRoom.id}`);
    }, [currentRoom, navigate]);

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

    const activeGame = GAMES_LIST.find(g => g.id === activeGameId) || GAMES_LIST[0];
    const userHighScore = leaderboard.find(p => p.name === user?.name || p.email === user?.email)?.score || 0;

    return (
        <BaseLayout>
            <style>{LOBBY_CSS}</style>
            <Box maxW="1200px" mx="auto" px={{ base: 2, md: 4 }} py={2}>

                {/* Header Title */}
                <Flex align="center" gap={3} mb={8}>
                    <Box className="lobby-float" fontSize="36px">🎮</Box>
                    <Box>
                        <Text fontSize={{ base: "24px", md: "28px" }} fontWeight="900"
                            color="fg" lineHeight="1" letterSpacing="-0.5px">
                            TRÒ CHƠI TỪ VỰNG
                        </Text>
                        <Text fontSize="11px" color="blue.500" letterSpacing="widest" fontWeight="700">
                            LEARN AND PLAY ARENA
                        </Text>
                    </Box>
                </Flex>

                {/* Dashboard Flex Layout */}
                <Flex direction={{ base: "column", lg: "row" }} gap={6} align="stretch">

                    {/* 1. LEFT SIDEBAR MENU (280px) */}
                    <Box w={{ base: "100%", lg: "280px" }} flexShrink={0} display="flex" flexDirection="column" gap={6}>
                        
                        {/* Play Mode List: Singleplayer */}
                        <Box bg="bg.panel" p={4} borderRadius="2xl" border="1px solid" borderColor="border.muted" shadow="xs">
                            <Text fontSize="11px" fontWeight="800" color="fg.muted" letterSpacing="widest" mb={3} textTransform="uppercase">
                                🎮 Chế độ chơi đơn
                            </Text>
                            <VStack gap={2} align="stretch">
                                {GAMES_LIST.filter(g => g.category === "singleplayer").map((game) => {
                                    const isActive = activeGameId === game.id;
                                    return (
                                        <Flex
                                            key={game.id}
                                            className="menu-item"
                                            onClick={() => setActiveGameId(game.id)}
                                            cursor="pointer"
                                            p={3}
                                            borderRadius="xl"
                                            bg={isActive ? "blue.500" : "transparent"}
                                            color={isActive ? "white" : "fg"}
                                            borderWidth="1px"
                                            borderColor={isActive ? "blue.500" : "transparent"}
                                            _hover={{ bg: isActive ? "blue.500" : "bg.subtle" }}
                                            align="center"
                                            gap={3}
                                        >
                                            <Flex
                                                w="40px" h="40px" borderRadius="lg"
                                                bg={isActive ? "rgba(255,255,255,0.2)" : "bg.subtle"}
                                                align="center" justify="center" fontSize="xl"
                                                flexShrink={0}
                                            >
                                                {game.icon}
                                            </Flex>
                                            <Box flex={1} overflow="hidden">
                                                <Text fontSize="13px" fontWeight="800" isTruncated>{game.title}</Text>
                                                <Text fontSize="10px" opacity={isActive ? 0.9 : 0.6} isTruncated>{game.subtitle}</Text>
                                            </Box>
                                            {game.comingSoon && (
                                                <Badge colorPalette="gray" size="sm" fontSize="8px">LOCK</Badge>
                                            )}
                                        </Flex>
                                    );
                                })}
                            </VStack>
                        </Box>

                        {/* Play Mode List: Multiplayer */}
                        <Box bg="bg.panel" p={4} borderRadius="2xl" border="1px solid" borderColor="border.muted" shadow="xs">
                            <Text fontSize="11px" fontWeight="800" color="fg.muted" letterSpacing="widest" mb={3} textTransform="uppercase">
                                ⚔️ Chế độ thi đấu
                            </Text>
                            <VStack gap={2} align="stretch">
                                {GAMES_LIST.filter(g => g.category === "multiplayer").map((game) => {
                                    const isActive = activeGameId === game.id;
                                    return (
                                        <Flex
                                            key={game.id}
                                            className="menu-item"
                                            onClick={() => setActiveGameId(game.id)}
                                            cursor="pointer"
                                            p={3}
                                            borderRadius="xl"
                                            bg={isActive ? "orange.500" : "transparent"}
                                            color={isActive ? "white" : "fg"}
                                            borderWidth="1px"
                                            borderColor={isActive ? "orange.500" : "transparent"}
                                            _hover={{ bg: isActive ? "orange.500" : "bg.subtle" }}
                                            align="center"
                                            gap={3}
                                        >
                                            <Flex
                                                w="40px" h="40px" borderRadius="lg"
                                                bg={isActive ? "rgba(255,255,255,0.2)" : "bg.subtle"}
                                                align="center" justify="center" fontSize="xl"
                                                flexShrink={0}
                                            >
                                                {game.icon}
                                            </Flex>
                                            <Box flex={1} overflow="hidden">
                                                <Text fontSize="13px" fontWeight="800" isTruncated>{game.title}</Text>
                                                <Text fontSize="10px" opacity={isActive ? 0.9 : 0.6} isTruncated>{game.subtitle}</Text>
                                            </Box>
                                            {game.comingSoon && (
                                                <Badge colorPalette="gray" size="sm" fontSize="8px">LOCK</Badge>
                                            )}
                                        </Flex>
                                    );
                                })}
                            </VStack>
                        </Box>
                    </Box>

                    {/* 2. MIDDLE/MAIN CONTENT AREA */}
                    <Box flex={1} display="flex" flexDirection="column" gap={6}>
                        {activeGame.comingSoon ? (
                            /* Coming Soon Screen */
                            <Box bg="bg.panel" p={12} borderRadius="3xl" border="1px solid" borderColor="border.muted" shadow="sm" textAlign="center" display="flex" flexDirection="column" align="center" justify="center" flex={1}>
                                <Text fontSize="64px" mb={4} className="lobby-float">{activeGame.icon}</Text>
                                <Heading fontSize="2xl" fontWeight="900" mb={2}>{activeGame.title}</Heading>
                                <Text fontSize="xs" fontWeight="700" color="blue.500" letterSpacing="widest" mb={4}>
                                    {activeGame.subtitle.toUpperCase()}
                                </Text>
                                <Text maxW="450px" fontSize="sm" color="fg.muted" mb={8} lineHeight="1.6">
                                    {activeGame.description}
                                </Text>
                                <Badge colorPalette="gray" size="lg" px={4} py={1} borderRadius="full">
                                    🚧 ĐANG PHÁT TRIỂN - SẮP RA MẮT
                                </Badge>
                            </Box>
                        ) : activeGameId === "survival" ? (
                            /* SURVIVAL GAME SETUP PANELS */
                            <Box display="flex" flexDirection="column" gap={6}>
                                {/* Survival Card Info */}
                                <Box bg="bg.panel" p={6} borderRadius="3xl" border="1px solid" borderColor="border.muted" shadow="sm">
                                    <Flex justify="space-between" align="start" mb={4} flexWrap="wrap" gap={3}>
                                        <Box>
                                            <Heading fontSize="2xl" fontWeight="900" color="fg" mb={1}>
                                                {activeGame.title}
                                            </Heading>
                                            <Text fontSize="xs" color="fg.muted" fontWeight="700" letterSpacing="wide">
                                                {activeGame.subtitle.toUpperCase()}
                                            </Text>
                                        </Box>
                                        <Badge colorPalette="blue" size="lg">
                                            {activeGame.badge}
                                        </Badge>
                                    </Flex>

                                    <Text fontSize="sm" color="fg.muted" mb={6} lineHeight="1.6">
                                        {activeGame.description}
                                    </Text>

                                    {/* CEFR Level Selector Pills */}
                                    <Box mb={6} p={4} bg="bg.subtle" borderRadius="2xl" borderWidth="1px" borderColor="border.muted">
                                        <Text fontSize="xs" fontWeight="800" color="fg.muted" mb={3} letterSpacing="wider">
                                            CHỌN CẤP ĐỘ HỌC:
                                        </Text>
                                        <Flex gap={2} flexWrap="wrap">
                                            {activeGame.levels.map((lvl) => {
                                                const isSelected = selectedLevels.includes(lvl);
                                                return (
                                                    <Button
                                                        key={lvl}
                                                        size="sm"
                                                        variant={isSelected ? "solid" : "outline"}
                                                        colorPalette={isSelected ? "blue" : "gray"}
                                                        onClick={() => {
                                                            if (isSelected) {
                                                                if (selectedLevels.length > 1) {
                                                                    setSelectedLevels(selectedLevels.filter(x => x !== lvl));
                                                                }
                                                            } else {
                                                                setSelectedLevels([...selectedLevels, lvl]);
                                                            }
                                                        }}
                                                        borderRadius="xl"
                                                        px={4}
                                                        h="34px"
                                                        fontWeight="bold"
                                                        fontSize="xs"
                                                    >
                                                        Cấp độ {lvl}
                                                    </Button>
                                                );
                                            })}
                                        </Flex>
                                    </Box>

                                    {/* Stats and Play Button */}
                                    <Flex align="center" justify="space-between" bg="bg.subtle" p={4} borderRadius="2xl" borderWidth="1px" borderColor="border.muted" flexWrap="wrap" gap={3}>
                                        <Box>
                                            <Text fontSize="11px" color="fg.muted" fontWeight="700">KỶ LỤC CỦA BẠN</Text>
                                            <Text fontSize="2xl" fontWeight="900" color="orange.500">{userHighScore} điểm</Text>
                                        </Box>
                                        <Box>
                                            <Text fontSize="11px" color="fg.muted" fontWeight="700">TỪ ĐÃ GẶP</Text>
                                            <Text fontSize="2xl" fontWeight="900" color="blue.500">
                                                {stats?.totalGameWords || 0} từ
                                            </Text>
                                        </Box>
                                        <Button
                                            colorPalette="blue"
                                            size="lg"
                                            h="50px"
                                            borderRadius="xl"
                                            fontWeight="700"
                                            fontSize="15px"
                                            onClick={() => navigate(`/game/survival/play?levels=${selectedLevels.join(",")}`)}
                                            gap={2}
                                            shadow="md"
                                            _hover={{ transform: "translateY(-2px)" }}
                                        >
                                            CHƠI NGAY <FiArrowRight />
                                        </Button>
                                    </Flex>
                                </Box>

                                {/* Survival Weak Words */}
                                <Box bg="bg.panel" p={6} borderRadius="3xl" border="1px solid" borderColor="border.muted" shadow="sm">
                                    <Flex align="center" gap={2} mb={4}>
                                        <FiActivity size={18} color="#e53e3e" />
                                        <Text fontSize="lg" fontWeight="900">TỪ VỰNG CẦN LƯU Ý (SAI NHIỀU NHẤT)</Text>
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
                                                    <Box overflow="hidden">
                                                        <Text fontWeight="bold" fontSize="md" color="red.500" isTruncated>{item.word}</Text>
                                                        <Text fontSize="xs" color="fg.muted" isTruncated maxW="150px">{item.vietnamese}</Text>
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
                        ) : (
                            /* MULTIPLAYER ARENA ROOMS LIST */
                            <Box bg="bg.panel" p={6} borderRadius="3xl" border="1px solid" borderColor="border.muted" shadow="sm" flex={1}>
                                <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
                                    <Box>
                                        <Heading fontSize="2xl" fontWeight="900">{activeGame.title}</Heading>
                                        <Text fontSize="xs" color="fg.muted">{activeGame.description}</Text>
                                    </Box>
                                    <Button gap={2} px={6} h="42px" borderRadius="xl"
                                        fontWeight="700" letterSpacing="wider" fontSize="13px"
                                        colorPalette="orange" variant="solid"
                                        shadow="0 4px 15px rgba(246,173,85,0.25)"
                                        _hover={{ shadow: "0 6px 20px rgba(246,173,85,0.4)", transform: "translateY(-1.5px)" }}
                                        onClick={() => setIsCreateOpen(true)}>
                                        <FiPlus /> TẠO PHÒNG MỚI
                                    </Button>
                                </Flex>

                                {rooms.length === 0 ? (
                                    <Flex direction="column" align="center" justify="center" py={20}
                                        borderRadius="20px" border="2px dashed" borderColor="border.muted">
                                        <Text fontSize="48px" mb={3} className="lobby-float">🎮</Text>
                                        <Text fontWeight="900" fontSize="lg" color="fg" mb={1}>
                                            Chưa có phòng nào
                                        </Text>
                                        <Text fontSize="sm" color="fg.muted">
                                            Hãy tạo phòng đầu tiên để thách đấu!
                                        </Text>
                                    </Flex>
                                ) : (
                                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={5}>
                                        {rooms.map((room) => {
                                            const isFull = room.playerCount >= 2 || room.status === "playing";
                                            return (
                                                <Box key={room.id} className="room-card" p={5}
                                                    bg="bg.subtle" border="1px solid" borderColor="border.muted"
                                                    borderRadius="16px" shadow="sm" transition="all 0.2s"
                                                    _hover={{ borderColor: "blue.300", shadow: "md", _dark: { borderColor: "cyan.800" } }}>

                                                    <Flex justify="space-between" align="center" mb={4}>
                                                        <Box px={3} py={1} borderRadius="full"
                                                            bg={room.status === "playing" ? "red.50" : "green.50"}
                                                            border="1px solid"
                                                            borderColor={room.status === "playing" ? "red.200" : "green.200"}
                                                            _dark={{
                                                                bg: room.status === "playing" ? "rgba(255,30,60,0.12)" : "rgba(0,200,100,0.12)",
                                                                borderColor: room.status === "playing" ? "rgba(255,30,60,0.35)" : "rgba(0,200,100,0.35)"
                                                            }}>
                                                            <Text fontSize="9px" letterSpacing="widest" fontWeight="700"
                                                                color={room.status === "playing" ? "red.500" : "green.600"}
                                                                _dark={{ color: room.status === "playing" ? "red.300" : "green.300" }}>
                                                                {room.status === "playing" ? "⚔ ĐANG ĐẤU" : "⏳ CHỜ NGƯỜI"}
                                                            </Text>
                                                        </Box>
                                                        <Flex align="center" gap={1} color="fg.muted">
                                                            <FiUsers size={12} />
                                                            <Text fontSize="xs" fontWeight="700">
                                                                {room.playerCount}/2
                                                            </Text>
                                                        </Flex>
                                                    </Flex>

                                                    <Flex align="center" gap={2} mb={5}>
                                                        <Box color={room.isPrivate ? "orange.400" : "fg.subtle"}>
                                                            {room.isPrivate ? <FiLock size={14} /> : <FiUnlock size={14} />}
                                                        </Box>
                                                        <Text fontWeight="700" color="fg" fontSize="md"
                                                            lineHeight="1.2" noOfLines={1}>
                                                            {room.name}
                                                        </Text>
                                                    </Flex>

                                                    {isFull ? (
                                                        <Box h="40px" borderRadius="10px" bg="bg.subtle"
                                                            display="flex" alignItems="center" justifyContent="center" borderWidth="1px" borderColor="border.muted">
                                                            <Text fontSize="11px" fontWeight="700"
                                                                color="fg.subtle" letterSpacing="widest">
                                                                PHÒNG ĐÃ ĐẦY
                                                            </Text>
                                                        </Box>
                                                    ) : (
                                                        <Button w="full" h="40px" borderRadius="10px" colorPalette="blue"
                                                            fontWeight="700" letterSpacing="wider" fontSize="12px"
                                                            gap={2} onClick={() => handleJoinClick(room)}
                                                            _hover={{ transform: "translateY(-1px)", shadow: "sm" }}>
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

                    {/* 3. RIGHT SIDEBAR INFO PANEL (300px) */}
                    <Box w={{ base: "100%", lg: "300px" }} flexShrink={0}>
                        {activeGameId === "survival" ? (
                            /* Survival Leaderboard */
                            <Box bg="bg.panel" p={6} borderRadius="3xl" border="1px solid" borderColor="border.muted" shadow="xs" display="flex" flexDirection="column" maxH="600px">
                                <Flex align="center" gap={2} mb={5}>
                                    <FiAward size={20} color="#ecc94b" />
                                    <Text fontSize="lg" fontWeight="900">XẾP HẠNG</Text>
                                </Flex>

                                <VStack align="stretch" gap={3} flex={1} overflowY="auto" pr={1}>
                                    {survivalLoading ? (
                                        <Flex justify="center" py={10}><Spinner /></Flex>
                                    ) : leaderboard.length === 0 ? (
                                        <Text fontSize="xs" color="fg.muted" fontStyle="italic">Chưa có ai ghi danh bảng xếp hạng.</Text>
                                    ) : (
                                        leaderboard.map((player) => (
                                            <Flex key={player.rank} align="center" gap={3} p={2.5} bg="bg.subtle" borderRadius="2xl" border="1px solid" borderColor="border.muted">
                                                <Flex w="24px" h="24px" align="center" justify="center" borderRadius="full" 
                                                    bg={player.rank === 1 ? "yellow.400" : player.rank === 2 ? "gray.300" : player.rank === 3 ? "orange.300" : "transparent"}
                                                    color={player.rank <= 3 ? "white" : "fg.muted"}
                                                    fontWeight="bold" fontSize="xs">
                                                    {player.rank}
                                                </Flex>

                                                {player.picture ? (
                                                    <Image src={player.picture} w="28px" h="28px" borderRadius="full" />
                                                ) : (
                                                    <Flex w="28px" h="28px" borderRadius="full" bg="blue.100" _dark={{ bg: "blue.900/30" }} align="center" justify="center" fontSize="10px" fontWeight="bold">
                                                        {player.name?.charAt(0).toUpperCase()}
                                                    </Flex>
                                                )}

                                                <Box flex={1} overflow="hidden">
                                                    <Text fontSize="xs" fontWeight="700" isTruncated color="fg">{player.name}</Text>
                                                    <Text fontSize="9px" color="fg.muted" isTruncated>{player.email}</Text>
                                                </Box>
                                                <Text fontSize="xs" fontWeight="900" color="blue.500">{player.score}</Text>
                                            </Flex>
                                        ))
                                    )}
                                </VStack>
                            </Box>
                        ) : (
                            /* General Instructions / Rules Panel for other modes */
                            <Box bg="bg.panel" p={6} borderRadius="3xl" border="1px solid" borderColor="border.muted" shadow="xs">
                                <Flex align="center" gap={2} mb={4}>
                                    <FiAward size={20} color="#3182ce" />
                                    <Text fontSize="lg" fontWeight="900">LUẬT CHƠI</Text>
                                </Flex>
                                <VStack align="stretch" gap={3} fontSize="xs" color="fg.muted" lineHeight="1.6">
                                    <Box p={3} bg="bg.subtle" borderRadius="xl" border="1px solid" borderColor="border.muted">
                                        <Text fontWeight="bold" color="fg" mb={1}>⚔️ Quyết đấu 1vs1</Text>
                                        <Text>Mỗi phòng thi đấu gồm 2 người chơi. Trả lời các câu hỏi từ vựng để tính điểm.</Text>
                                    </Box>
                                    <Box p={3} bg="bg.subtle" borderRadius="xl" border="1px solid" borderColor="border.muted">
                                        <Text fontWeight="bold" color="fg" mb={1}>⚡ Điểm số & Tốc độ</Text>
                                        <Text>Trả lời nhanh và chính xác hơn đối thủ để ghi được nhiều điểm hơn.</Text>
                                    </Box>
                                    <Box p={3} bg="bg.subtle" borderRadius="xl" border="1px solid" borderColor="border.muted">
                                        <Text fontWeight="bold" color="fg" mb={1}>🏆 Vinh danh</Text>
                                        <Text>Chiến thắng các trận đấu để nâng cao thứ hạng của bạn trên hệ thống.</Text>
                                    </Box>
                                </VStack>
                            </Box>
                        )}
                    </Box>

                </Flex>
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
                            <Text fontSize="11px" fontWeight="600"
                                color={newRoomPassword ? "orange.600" : "fg.muted"}
                                _dark={{ color: newRoomPassword ? "orange.300" : "fg.muted" }}>
                                {newRoomPassword ? "Phòng riêng tư — Cần mật khẩu để vào" : "Phòng mở — Ai cũng có thể vào"}
                            </Text>
                        </Flex>
                        <Button w="full" h="48px" borderRadius="10px" colorPalette="orange"
                            fontWeight="700" letterSpacing="wider" fontSize="14px"
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
                        <Text fontSize="sm" color="fg.muted">
                            Phòng này được bảo vệ bằng mật khẩu. Nhập đúng để tham gia.
                        </Text>
                        <StyledInput label="Mật khẩu" type="password" placeholder="Nhập mật khẩu phòng..."
                            value={joinPassword} onChange={e => setJoinPassword(e.target.value)} autoFocus
                            onKeyPress={e => e.key === "Enter" && handleConfirmJoin()} />
                        <Button w="full" h="48px" borderRadius="10px" colorPalette="blue"
                            fontWeight="700" letterSpacing="wider" fontSize="14px"
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
