import React, { useState, useEffect, useRef } from "react";
import { Box, Flex, Text, IconButton, HStack, Portal } from "@chakra-ui/react";
import { FiMessageSquare, FiX } from "react-icons/fi";
import { useSocketStore } from "../../../stores/useSocketStore";
import { useAuthStore } from "../../../stores/useAuthStore";

const ChatNotificationListener = () => {
    const socket = useSocketStore((s) => s.socket);
    const connected = useSocketStore((s) => s.connected);
    const user = useAuthStore((s) => s.user);
    const userRef = useRef(user);
    const [toasts, setToasts] = useState([]);

    // Keep userRef updated
    useEffect(() => {
        userRef.current = user;
    }, [user]);

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    useEffect(() => {
        if (!socket) return;

        const handleReceiveMessage = (msg) => {
            if (!msg) return;

            console.log("🔔 [Realtime Toast Triggered]:", msg);

            const currentUser = userRef.current;
            const currentUserId = currentUser?._id || currentUser?.id;
            const isMe = currentUserId && msg.userId && String(msg.userId) === String(currentUserId);

            // Do not show notification for own messages
            if (isMe) return;

            const id = Date.now() + "_" + Math.random().toString(36).substr(2, 9);
            const toastItem = {
                id,
                sender: msg.sender || "Thành viên",
                picture: (msg.picture && typeof msg.picture === "string" && msg.picture.trim() !== "") ? msg.picture : null,
                text: msg.text || "",
                isAdmin: !!msg.isAdmin,
                timestamp: msg.timestamp || new Date().toISOString(),
            };

            setToasts((prev) => [toastItem, ...prev].slice(0, 3));

            setTimeout(() => {
                removeToast(id);
            }, 4500);
        };

        socket.on("receive_message", handleReceiveMessage);

        return () => {
            socket.off("receive_message", handleReceiveMessage);
        };
    }, [socket, connected]); // Bind when socket or connected state changes!

    const handleClickToast = () => {
        const chatEl = document.getElementById("community-chat-container");
        if (chatEl) {
            chatEl.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    };

    if (toasts.length === 0) return null;

    return (
        <Portal>
            <Box
                position="fixed"
                top="20px"
                right="20px"
                zIndex={999999}
                display="flex"
                flexDirection="column"
                gap={3}
                maxW="360px"
                w="calc(100vw - 40px)"
                pointerEvents="none"
            >
                {toasts.map((toast) => (
                    <Box
                        key={toast.id}
                        pointerEvents="auto"
                        bg="bg.panel"
                        _dark={{ bg: "gray.900" }}
                        borderRadius="2xl"
                        borderWidth="1px"
                        borderColor="blue.300"
                        shadow="2xl"
                        p={3.5}
                        cursor="pointer"
                        onClick={handleClickToast}
                        style={{
                            animation: "slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                        }}
                        transition="all 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
                        _hover={{ transform: "translateY(-2px)", borderColor: "blue.500" }}
                    >
                        <style>{`
                            @keyframes slideInRight {
                                from {
                                    opacity: 0;
                                    transform: translateX(60px) scale(0.95);
                                }
                                to {
                                    opacity: 1;
                                    transform: translateX(0) scale(1);
                                }
                            }
                        `}</style>
                        <Flex align="center" justify="space-between" mb={2}>
                            <HStack gap={1.5}>
                                <Box
                                    bg="blue.100"
                                    color="blue.600"
                                    _dark={{ bg: "blue.900/60", color: "blue.300" }}
                                    p={1}
                                    borderRadius="md"
                                    display="flex"
                                    align="center"
                                    justify="center"
                                >
                                    <FiMessageSquare size={12} />
                                </Box>
                                <Text fontSize="xs" fontWeight="bold" color="blue.600" _dark={{ color: "blue.300" }}>
                                    Tin nhắn mới từ Cộng đồng
                                </Text>
                            </HStack>
                            <IconButton
                                size="xs"
                                variant="ghost"
                                aria-label="Close notification"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeToast(toast.id);
                                }}
                                color="gray.400"
                                _hover={{ color: "fg", bg: "bg.subtle" }}
                                minW="20px"
                                h="20px"
                                borderRadius="full"
                            >
                                <FiX size={12} />
                            </IconButton>
                        </Flex>

                        <Flex align="flex-start" gap={3}>
                            <Box
                                w="36px"
                                h="36px"
                                borderRadius="full"
                                overflow="hidden"
                                flexShrink={0}
                                bg="blue.50"
                                borderWidth={toast.isAdmin ? "2px" : "1px"}
                                borderColor={toast.isAdmin ? "red.400" : "blue.200"}
                            >
                                {toast.picture ? (
                                    <img
                                        src={toast.picture}
                                        alt={toast.sender}
                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    />
                                ) : (
                                    <Flex align="center" justify="center" h="full" bg="blue.500" color="white" fontWeight="bold" fontSize="xs">
                                        {toast.sender?.charAt(0)?.toUpperCase() || "U"}
                                    </Flex>
                                )}
                            </Box>
                            <Box flex={1} overflow="hidden">
                                <HStack gap={1} align="center" mb={0.5}>
                                    <Text fontSize="xs" fontWeight="extrabold" color="fg" isTruncated maxW="180px">
                                        {toast.sender}
                                    </Text>
                                    {toast.isAdmin && (
                                        <Box bg="red.500" color="white" fontSize="8px" px={1} py={0.2} borderRadius="sm" fontWeight="extrabold">
                                            ADMIN
                                        </Box>
                                    )}
                                </HStack>
                                <Text fontSize="xs" color="fg.muted" noOfLines={2} wordBreak="break-word">
                                    {toast.text}
                                </Text>
                            </Box>
                        </Flex>
                    </Box>
                ))}
            </Box>
        </Portal>
    );
};

export default ChatNotificationListener;
