import React, { useEffect, useState } from "react";
import {
    Box, Flex, Text, Button, SimpleGrid, Input, Badge,
    VStack, Icon, Spinner, useDisclosure,
    IconButton,
} from "@chakra-ui/react";
import {
    FiPlus, FiZap, FiUsers, FiArrowRight, FiX
} from "react-icons/fi";
import BaseLayout from "../../../layouts/BaseLayout.jsx";
import { useGameStore } from "../../../stores/useGameStore.js";
import { useAuthStore } from "../../../stores/useAuthStore.js";
import { useSocketStore } from "../../../stores/useSocketStore.js";
import { useNavigate } from "react-router-dom";

const GameLobbyPage = () => {
    const { rooms, getRooms, createRoom, joinRoom, initListeners, clearListeners, currentRoom } = useGameStore();
    const { user } = useAuthStore();
    const [newRoomName, setNewRoomName] = useState("");
    const [creating, setCreating] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    const { socket } = useSocketStore();

    useEffect(() => {
        if (socket) {
            getRooms();
        }
    }, [socket]);

    useEffect(() => {
        if (currentRoom) {
            navigate(`/game/${currentRoom.id}`);
        }
    }, [currentRoom, navigate]);

    const handleCreate = () => {
        if (!newRoomName.trim()) return;
        setCreating(true);
        createRoom(newRoomName, user);
        setNewRoomName("");
        setCreating(false);
        setIsModalOpen(false);
    };

    return (
        <BaseLayout>
            <Box maxW="1000px" mx="auto">
                <Flex justify="space-between" align="center" mb={8}>
                    <Box>
                        <Flex align="center" gap={3} mb={1}>
                            <Icon as={FiZap} fontSize="3xl" color="orange.400" />
                            <Text fontSize="2xl" fontWeight="900" letterSpacing="tight">
                                Đấu Trường Từ Vựng
                            </Text>
                        </Flex>
                        <Text color="fg.muted" fontSize="sm">
                            Tham gia phòng để so tài vựng cùng người học khác!
                        </Text>
                    </Box>

                    <Button
                        colorPalette="orange"
                        gap={2}
                        onClick={() => setIsModalOpen(true)}
                        size="lg"
                        borderRadius="xl"
                        shadow="0 4px 15px rgba(245, 130, 174, 0.2)"
                    >
                        <FiPlus /> Tạo phòng mới
                    </Button>
                </Flex>

                {/* Create Room Modal - Custom implementation since Chakra v3 Modal needs snippets */}
                {isModalOpen && (
                    <Box position="fixed" inset={0} bg="blackAlpha.700" zIndex={1000} display="flex" alignItems="center" justifyContent="center" p={4}>
                        <Box bg="bg.panel" w="full" maxW="400px" borderRadius="3xl" p={8} shadow="2xl" animation="fadeIn 0.2s">
                            <Flex justify="space-between" align="center" mb={6}>
                                <Text fontSize="xl" fontWeight="800">Tạo phòng đấu</Text>
                                <IconButton variant="ghost" onClick={() => setIsModalOpen(false)}><FiX /></IconButton>
                            </Flex>

                            <VStack gap={4} align="stretch">
                                <Box>
                                    <Text fontSize="sm" fontWeight="bold" mb={2}>Tên phòng</Text>
                                    <Input
                                        placeholder="Ví dụ: Đại chiến tiếng Anh..."
                                        value={newRoomName}
                                        onChange={(e) => setNewRoomName(e.target.value)}
                                        autoFocus
                                        onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
                                    />
                                </Box>
                                <Button
                                    colorPalette="orange"
                                    h="50px"
                                    borderRadius="xl"
                                    onClick={handleCreate}
                                    loading={creating}
                                    disabled={!newRoomName.trim()}
                                >
                                    Bắt đầu ngay
                                </Button>
                            </VStack>
                        </Box>
                    </Box>
                )}

                {rooms.length === 0 ? (
                    <Flex direction="column" align="center" justify="center" py={20} bg="bg.panel" borderRadius="3xl" borderStyle="dashed" borderWidth="2px" borderColor="border.muted">
                        <Icon as={FiZap} fontSize="6xl" color="gray.200" mb={4} />
                        <Text fontWeight="bold" fontSize="lg">Chưa có phòng nào</Text>
                        <Text fontSize="sm" color="fg.muted">Hãy tạo phòng đầu tiên để bắt đầu!</Text>
                    </Flex>
                ) : (
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
                        {rooms.map((room) => (
                            <Box
                                key={room.id}
                                bg="bg.panel"
                                p={6}
                                borderRadius="2xl"
                                borderWidth="1px"
                                borderColor="border.muted"
                                transition="all 0.2s"
                                _hover={{ transform: "translateY(-4px)", shadow: "lg", borderColor: "orange.300" }}
                            >
                                <Flex justify="space-between" align="center" mb={4}>
                                    <Text fontWeight="bold" fontSize="lg" isTruncated>{room.name}</Text>
                                    <Badge colorPalette={room.status === 'playing' ? 'red' : 'green'} variant="subtle">
                                        {room.status === 'playing' ? 'Đang đấu' : 'Chờ...'}
                                    </Badge>
                                </Flex>

                                <Flex align="center" gap={4} mb={6}>
                                    <Flex align="center" gap={1.5} color="fg.muted">
                                        <FiUsers size={14} />
                                        <Text fontSize="sm">{room.playerCount}/2 người</Text>
                                    </Flex>
                                </Flex>

                                <Button
                                    w="full"
                                    colorPalette="blue"
                                    disabled={room.playerCount >= 2 || room.status === 'playing'}
                                    onClick={() => joinRoom(room.id, user)}
                                    gap={2}
                                >
                                    Tham gia ngay <FiArrowRight />
                                </Button>
                            </Box>
                        ))}
                    </SimpleGrid>
                )}
            </Box>
        </BaseLayout>
    );
};

export default GameLobbyPage;
