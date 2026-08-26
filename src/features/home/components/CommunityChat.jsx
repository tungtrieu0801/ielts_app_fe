import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { Box, Flex, Text, Input, IconButton, VStack, HStack, Icon } from "@chakra-ui/react";
import { FiSend, FiMessageSquare, FiX, FiCornerUpLeft, FiSmile } from "react-icons/fi";
import { useAuthStore } from "../../../stores/useAuthStore";
import { useSocketStore } from "../../../stores/useSocketStore";

const formatTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
    });
};

const EMOJI_PRESETS = [
    "😊", "😂", "🤣", "😍", "😎", "🥳", "💩", "👍", "👏", "🔥", "❤️", "💯", "✨", "🎉",
    "📚", "📖", "✏️", "💡", "🧠", "🎯", "🏆", "🌟", "💪", "⚡", "💬", "📍",
    "🥰", "😜", "🤐", "🤩", "😴", "🤔", "😅", "😇", "🙏", "🙌", "💖", "🤝"
];

const CommunityChat = () => {
    const { user } = useAuthStore();
    const { socket, connected } = useSocketStore();
    const [messages, setMessages] = useState([]);
    const [replyingTo, setReplyingTo] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const scrollRef = useRef();
    const previousScrollHeight = useRef(0);

    useEffect(() => {
        if (!socket) return;

        // Request initial history if not already loaded or just to be sure
        socket.emit("load_more_history", 0);

        socket.on("chat_history", (history) => {
            setMessages(history);
            if (history.length < 15) setHasMore(false);
        });

        socket.on("older_messages", (older) => {
            if (older.length < 15) setHasMore(false);
            setMessages((prev) => [...older, ...prev]);
        });

        socket.on("receive_message", (message) => {
            setMessages((prev) => [...prev, message]);
        });

        return () => {
            socket.off("chat_history");
            socket.off("older_messages");
            socket.off("receive_message");
        };
    }, [socket]);

    useLayoutEffect(() => {
        if (scrollRef.current) {
            if (isLoadingMore) {
                // Adjust scroll position after prepending older messages
                const newScrollHeight = scrollRef.current.scrollHeight;
                scrollRef.current.scrollTop = newScrollHeight - previousScrollHeight.current;
                setIsLoadingMore(false);
            } else {
                // Scroll to bottom for initial load or new message
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
        }
    }, [messages]);

    const handleScroll = (e) => {
        if (e.target.scrollTop === 0 && hasMore && !isLoadingMore) {
            setIsLoadingMore(true);
            previousScrollHeight.current = scrollRef.current.scrollHeight;
            socket.emit("load_more_history", messages.length);
        }
    };

    const handleSend = (text) => {
        if (!user) return;

        const messageData = {
            sender: user.name,
            picture: user.picture,
            text,
            userId: user._id || user.id,
            isAdmin: user.email === "trieutungvp@gmail.com",
            replyTo: replyingTo ? { sender: replyingTo.sender, text: replyingTo.text } : null,
        };

        socket.emit("send_message", messageData);
        setReplyingTo(null);
    };

    return (
        <Box
            id="community-chat-container"
            bg="bg.panel"
            borderRadius="2xl"
            borderWidth="1px"
            borderColor="border.muted"
            display="flex"
            flexDirection="column"
            h="450px"
            shadow="sm"
            overflow="hidden"
        >
            <Box bg="blue.50" p={4} borderBottomWidth="1px" borderColor="blue.100" _dark={{ bg: "blue.900/30", borderColor: "blue.800/30" }}>
                <Flex align="center" gap={2}>
                    <Icon as={FiMessageSquare} color="blue.500" />
                    <Text fontSize="md" fontWeight="bold" color="blue.700" _dark={{ color: "blue.300" }}>
                        Chat Cộng đồng
                    </Text>
                </Flex>
            </Box>

            <VStack
                flex={1}
                overflowY="auto"
                p={4}
                align="stretch"
                gap={4}
                ref={scrollRef}
                onScroll={handleScroll}
                css={{
                    "&::-webkit-scrollbar": { width: "4px" },
                    "&::-webkit-scrollbar-track": { background: "transparent" },
                    "&::-webkit-scrollbar-thumb": { background: "var(--chakra-colors-gray-200)", borderRadius: "10px" },
                }}
            >
                {messages.length === 0 && !hasMore ? (
                    <Flex direction="column" align="center" justify="center" h="full" opacity={0.5}>
                        <Text fontSize="4xl" mb={2}>💬</Text>
                        <Text fontSize="xs">Hãy là người đầu tiên lên tiếng!</Text>
                    </Flex>
                ) : (
                    <>
                        {isLoadingMore && (
                            <Flex justify="center" py={2}>
                                <Text fontSize="xs" color="fg.muted">Đang tải thêm...</Text>
                            </Flex>
                        )}
                        {messages.map((msg, idx) => {
                            const isMe = user && msg.userId && (
                                (user._id && msg.userId === user._id) ||
                                (user.id && msg.userId === user.id)
                            );
                            return (
                                <HStack key={idx} align="flex-start" gap={2} flexDirection={isMe ? "row-reverse" : "row"} role="group">
                                    <Box
                                        w="28px" h="28px" borderRadius="full" overflow="hidden" flexShrink={0}
                                        bg="gray.100" _dark={{ bg: "gray.800" }}
                                        borderWidth={msg.isAdmin ? "2px" : "1px"} borderColor={msg.isAdmin ? "red.400" : "border.subtle"}
                                    >
                                        <img src={msg.picture} alt={msg.sender} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    </Box>
                                    <Box maxW="80%">
                                        {!isMe && (
                                            <HStack mb={0.5} ml={1} gap={1} align="center">
                                                <Text fontSize="10px" fontWeight="bold" color={msg.isAdmin ? "red.500" : "blue.500"}>
                                                    {msg.sender}
                                                </Text>
                                                {msg.isAdmin && (
                                                    <Box bg="red.500" color="white" fontSize="8px" px={1} py={0.5} borderRadius="sm" fontWeight="bold">
                                                        ADMIN
                                                    </Box>
                                                )}
                                            </HStack>
                                        )}
                                        {isMe && (
                                            <HStack mb={0.5} mr={1} justify="flex-end" gap={1} align="center">
                                                {msg.isAdmin && (
                                                    <Box bg="red.500" color="white" fontSize="8px" px={1} py={0.5} borderRadius="sm" fontWeight="bold">
                                                        ADMIN
                                                    </Box>
                                                )}
                                                <Text fontSize="10px" fontWeight="bold" color="fg.muted">
                                                    Bạn
                                                </Text>
                                            </HStack>
                                        )}
                                        <Box
                                            bg={isMe ? "blue.500" : "bg.subtle"}
                                            color={isMe ? "white" : "fg"}
                                            p={2} px={3}
                                            borderRadius="xl"
                                            borderTopLeftRadius={!isMe ? "0" : "xl"}
                                            borderTopRightRadius={isMe ? "0" : "xl"}
                                        >
                                            {msg.replyTo && (
                                                <Box
                                                    bg="blackAlpha.200"
                                                    _dark={{ bg: "whiteAlpha.200" }}
                                                    p={1.5} borderRadius="md" mb={1}
                                                    borderLeft="2px solid" borderColor="whiteAlpha.500"
                                                    fontSize="10px" opacity={0.9}
                                                >
                                                    <Text fontWeight="bold">{msg.replyTo.sender}</Text>
                                                    <Text noOfLines={1}>{msg.replyTo.text}</Text>
                                                </Box>
                                            )}
                                            <Text fontSize="sm">
                                                {msg.text}
                                            </Text>
                                        </Box>
                                        <Flex justify={isMe ? "flex-end" : "flex-start"} align="center" mt={1} gap={2} ml={isMe ? 0 : 1} mr={isMe ? 1 : 0}>
                                            <Text fontSize="9px" color="fg.muted">
                                                {formatTime(msg.timestamp)}
                                            </Text>
                                            <IconButton
                                                size="xs" variant="ghost" aria-label="Reply"
                                                color="gray.400" _hover={{ color: "blue.500", bg: "blue.50" }}
                                                onClick={() => setReplyingTo(msg)}
                                            >
                                                <FiCornerUpLeft size={12} />
                                            </IconButton>
                                        </Flex>
                                    </Box>
                                </HStack>
                            );
                        })}
                    </>
                )}
            </VStack>

            <ChatInputArea onSend={handleSend} replyingTo={replyingTo} setReplyingTo={setReplyingTo} />
        </Box>
    );
};

const ChatInputArea = ({ onSend, replyingTo, setReplyingTo }) => {
    const [input, setInput] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const inputRef = useRef(null);
    const pickerRef = useRef(null);

    const handleSendClick = () => {
        if (!input.trim()) return;
        onSend(input.trim());
        setInput("");
        setShowEmojiPicker(false);
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") handleSendClick();
    };

    const handleSelectEmoji = (emoji) => {
        setInput((prev) => prev + emoji);
        inputRef.current?.focus();
    };

    // Close picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (pickerRef.current && !pickerRef.current.contains(e.target)) {
                setShowEmojiPicker(false);
            }
        };
        if (showEmojiPicker) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showEmojiPicker]);

    return (
        <Box p={3} borderTopWidth="1px" borderColor="border.subtle" position="relative">
            {/* Emoji Picker Popup */}
            {showEmojiPicker && (
                <Box
                    ref={pickerRef}
                    position="absolute"
                    bottom="calc(100% + 8px)"
                    right={3}
                    zIndex={100}
                    bg="bg.panel"
                    _dark={{ bg: "gray.900" }}
                    borderRadius="2xl"
                    borderWidth="1px"
                    borderColor="border.subtle"
                    shadow="2xl"
                    p={3}
                    w="280px"
                    style={{ animation: "fadeIn 0.2s ease-out forwards" }}
                >
                    <style>{`
                        @keyframes fadeIn {
                            from { opacity: 0; transform: translateY(6px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
                    `}</style>
                    <Flex justify="space-between" align="center" mb={2} px={1}>
                        <Text fontSize="xs" fontWeight="extrabold" color="fg.muted">
                            😃 Bộ Icon mặc định
                        </Text>
                        <IconButton
                            size="xs"
                            variant="ghost"
                            onClick={() => setShowEmojiPicker(false)}
                            aria-label="Close emoji picker"
                        >
                            <FiX size={12} />
                        </IconButton>
                    </Flex>
                    <Box
                        display="grid"
                        gridTemplateColumns="repeat(7, 1fr)"
                        gap={1.5}
                        maxH="180px"
                        overflowY="auto"
                        p={1}
                        css={{
                            "&::-webkit-scrollbar": { width: "3px" },
                            "&::-webkit-scrollbar-thumb": { background: "var(--chakra-colors-gray-300)", borderRadius: "10px" },
                        }}
                    >
                        {EMOJI_PRESETS.map((emoji, idx) => (
                            <Flex
                                key={idx}
                                align="center"
                                justify="center"
                                p={1.5}
                                borderRadius="lg"
                                cursor="pointer"
                                fontSize="lg"
                                _hover={{ bg: "bg.subtle", transform: "scale(1.25)" }}
                                transition="transform 0.15s ease"
                                onClick={() => handleSelectEmoji(emoji)}
                            >
                                {emoji}
                            </Flex>
                        ))}
                    </Box>
                </Box>
            )}

            {replyingTo && (
                <Flex bg="bg.muted" p={2} mb={2} borderRadius="md" justify="space-between" align="center">
                    <Box fontSize="xs">
                        <Text fontWeight="bold">Trả lời: {replyingTo.sender}</Text>
                        <Text color="fg.muted" noOfLines={1}>{replyingTo.text}</Text>
                    </Box>
                    <IconButton size="xs" variant="ghost" onClick={() => setReplyingTo(null)}>
                        <FiX />
                    </IconButton>
                </Flex>
            )}

            <HStack gap={2}>
                <Input
                    ref={inputRef}
                    placeholder="Nhập tin nhắn..."
                    size="sm"
                    borderRadius="full"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    bg="bg.subtle"
                    border="none"
                    _focus={{ bg: "bg.panel", outline: "2px solid", outlineColor: "blue.400" }}
                />
                <IconButton
                    aria-label="Insert Emoji"
                    size="sm"
                    variant={showEmojiPicker ? "solid" : "ghost"}
                    colorPalette={showEmojiPicker ? "blue" : "gray"}
                    borderRadius="full"
                    onClick={() => setShowEmojiPicker((prev) => !prev)}
                >
                    <FiSmile size={18} />
                </IconButton>
                <IconButton
                    aria-label="Send message"
                    size="sm"
                    colorPalette="blue"
                    borderRadius="full"
                    onClick={handleSendClick}
                    disabled={!input.trim()}
                >
                    <FiSend />
                </IconButton>
            </HStack>
        </Box>
    );
};

export default CommunityChat;
