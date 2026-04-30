import React, { useEffect, useState } from "react";
import { Box, Flex, Text, Button, SimpleGrid, Input, VStack, IconButton } from "@chakra-ui/react";
import { FiPlus, FiUsers, FiArrowRight, FiX, FiLock, FiUnlock, FiZap } from "react-icons/fi";
import BaseLayout from "../../../layouts/BaseLayout.jsx";
import { useGameStore } from "../../../stores/useGameStore.js";
import { useAuthStore } from "../../../stores/useAuthStore.js";
import { useSocketStore } from "../../../stores/useSocketStore.js";
import { useNavigate } from "react-router-dom";

const LOBBY_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Orbitron:wght@700;900&display=swap');
@keyframes lobbyFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
.lobby-float { animation: lobbyFloat 3s ease-in-out infinite; }
.room-card { transition: all 0.3s cubic-bezier(0.175,0.885,0.32,1.275); }
.room-card:hover { transform: translateY(-6px); }
.modal-in { animation: lobbyFloat 0.25s ease-out; }
`;

const StyledInput = ({ label, ...props }) => (
    <Box>
        <Text fontSize="10px" color="fg.muted" letterSpacing="widest" fontFamily="Rajdhani" mb={1}
            textTransform="uppercase" fontWeight="700">{label}</Text>
        <Input
            bg="bg.subtle" color="fg"
            borderColor="border.muted"
            _placeholder={{ color: "fg.subtle" }}
            _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px rgba(66,153,225,0.4)" }}
            borderRadius="10px" fontFamily="Rajdhani" fontSize="15px" fontWeight="600"
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
                    <Text fontSize="lg" fontWeight="900" color="fg" fontFamily="Orbitron">{title}</Text>
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

    const [newRoomName, setNewRoomName] = useState("");
    const [newRoomPassword, setNewRoomPassword] = useState("");
    const [creating, setCreating] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [joinRoomId, setJoinRoomId] = useState(null);
    const [joinPassword, setJoinPassword] = useState("");
    const [isJoinOpen, setIsJoinOpen] = useState(false);

    useEffect(() => { if (socket) getRooms(); }, [socket]);
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

    return (
        <BaseLayout>
            <style>{LOBBY_CSS}</style>
            <Box maxW="1000px" mx="auto">

                {/* Header */}
                <Flex justify="space-between" align="center" mb={10} flexWrap="wrap" gap={4}>
                    <Flex align="center" gap={3}>
                        <Box className="lobby-float" fontSize="32px">⚔️</Box>
                        <Box>
                            <Text fontSize={{ base: "22px", md: "26px" }} fontWeight="900" fontFamily="Orbitron"
                                color="fg" lineHeight="1" letterSpacing="-0.5px">
                                ĐẤU TRƯỜNG
                            </Text>
                            <Text fontSize="11px" fontFamily="Rajdhani" color="blue.500" letterSpacing="widest" fontWeight="700">
                                TỪ VỰNG TIẾNG ANH
                            </Text>
                        </Box>
                    </Flex>
                    <Button gap={2} px={6} h="46px" borderRadius="12px"
                        fontFamily="Rajdhani" fontWeight="700" letterSpacing="wider" fontSize="14px"
                        colorPalette="orange" variant="solid"
                        shadow="0 4px 20px rgba(246,173,85,0.3)"
                        _hover={{ shadow: "0 6px 28px rgba(246,173,85,0.5)", transform: "translateY(-2px)" }}
                        onClick={() => setIsCreateOpen(true)}>
                        <FiPlus /> TẠO PHÒNG MỚI
                    </Button>
                </Flex>

                {/* Empty state */}
                {rooms.length === 0 ? (
                    <Flex direction="column" align="center" justify="center" py={24}
                        borderRadius="20px" border="2px dashed" borderColor="border.muted">
                        <Text fontSize="48px" mb={3} className="lobby-float">🎮</Text>
                        <Text fontWeight="900" fontSize="lg" color="fg" fontFamily="Orbitron" mb={1}>
                            Chưa có phòng nào
                        </Text>
                        <Text fontSize="sm" color="fg.muted" fontFamily="Rajdhani">
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
                                            <Text fontSize="9px" fontFamily="Rajdhani" letterSpacing="widest" fontWeight="700"
                                                color={room.status === "playing" ? "red.500" : "green.600"}
                                                _dark={{ color: room.status === "playing" ? "red.300" : "green.300" }}>
                                                {room.status === "playing" ? "⚔ ĐANG ĐẤU" : "⏳ CHỜ NGƯỜI"}
                                            </Text>
                                        </Box>
                                        <Flex align="center" gap={1} color="fg.muted">
                                            <FiUsers size={12} />
                                            <Text fontSize="xs" fontFamily="Rajdhani" fontWeight="700">
                                                {room.playerCount}/2
                                            </Text>
                                        </Flex>
                                    </Flex>

                                    {/* Room name */}
                                    <Flex align="center" gap={2} mb={5}>
                                        <Box color={room.isPrivate ? "orange.400" : "fg.subtle"}>
                                            {room.isPrivate ? <FiLock size={14} /> : <FiUnlock size={14} />}
                                        </Box>
                                        <Text fontWeight="700" color="fg" fontFamily="Rajdhani" fontSize="lg"
                                            lineHeight="1.2" noOfLines={1}>
                                            {room.name}
                                        </Text>
                                    </Flex>

                                    {/* Join button */}
                                    {isFull ? (
                                        <Box h="42px" borderRadius="10px" bg="bg.subtle"
                                            display="flex" alignItems="center" justifyContent="center">
                                            <Text fontSize="12px" fontFamily="Rajdhani" fontWeight="700"
                                                color="fg.subtle" letterSpacing="widest">
                                                PHÒNG ĐÃ ĐẦY
                                            </Text>
                                        </Box>
                                    ) : (
                                        <Button w="full" h="42px" borderRadius="10px" colorPalette="blue"
                                            fontFamily="Rajdhani" fontWeight="700" letterSpacing="wider" fontSize="13px"
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
                            <Text fontSize="11px" fontFamily="Rajdhani" fontWeight="600"
                                color={newRoomPassword ? "orange.600" : "fg.muted"}
                                _dark={{ color: newRoomPassword ? "orange.300" : "fg.muted" }}>
                                {newRoomPassword ? "Phòng riêng tư — Cần mật khẩu để vào" : "Phòng mở — Ai cũng có thể vào"}
                            </Text>
                        </Flex>
                        <Button w="full" h="48px" borderRadius="10px" colorPalette="orange"
                            fontFamily="Rajdhani" fontWeight="700" letterSpacing="wider" fontSize="14px"
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
                        <Text fontSize="sm" color="fg.muted" fontFamily="Rajdhani">
                            Phòng này được bảo vệ bằng mật khẩu. Nhập đúng để tham gia.
                        </Text>
                        <StyledInput label="Mật khẩu" type="password" placeholder="Nhập mật khẩu phòng..."
                            value={joinPassword} onChange={e => setJoinPassword(e.target.value)} autoFocus
                            onKeyPress={e => e.key === "Enter" && handleConfirmJoin()} />
                        <Button w="full" h="48px" borderRadius="10px" colorPalette="blue"
                            fontFamily="Rajdhani" fontWeight="700" letterSpacing="wider" fontSize="14px"
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
