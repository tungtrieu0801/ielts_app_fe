import React, { useEffect, useState, useCallback } from "react";
import { Box, Flex, Text, Spinner, Badge } from "@chakra-ui/react";
import BaseLayout from "../../../layouts/BaseLayout.jsx";
import { getRanking } from "../../../services/rankingApi.js";
import { useAuthStore } from "../../../stores/useAuthStore.js";
import { useSocketStore } from "../../../stores/useSocketStore.js";

const PERIODS = [
    { key: "day", label: "📅 Hôm nay" },
    { key: "week", label: "📆 Tuần này" },
    { key: "month", label: "🗓️ Tháng này" },
];

const MEDAL = ["🥇", "🥈", "🥉"];

function formatTime(seconds) {
    if (!seconds || seconds < 1) return "< 1 phút";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}g ${m}p`;
    if (m > 0) return `${m} phút ${s}s`;
    return `${s} giây`;
}

const RankingPage = () => {
    const { user } = useAuthStore();
    const { socket } = useSocketStore();
    const [period, setPeriod] = useState("day");
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    // Live online status map: userId -> bool
    const [onlineMap, setOnlineMap] = useState({});

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getRanking(period);
            const items = res.data?.data || [];
            setData(items);
            // Build initial online map from API response
            const map = {};
            items.forEach(r => { map[r.userId] = r.isOnline; });
            setOnlineMap(map);
        } catch { setData([]); }
        finally { setLoading(false); }
    }, [period]);

    useEffect(() => { load(); }, [load]);

    // Listen for real-time online status changes
    useEffect(() => {
        if (!socket) return;
        const handler = ({ userId, isOnline }) => {
            setOnlineMap(prev => ({ ...prev, [userId]: isOnline }));
        };
        socket.on("online_status_changed", handler);
        return () => socket.off("online_status_changed", handler);
    }, [socket]);

    return (
        <BaseLayout>
            <Box maxW="720px" mx="auto">
                {/* Header */}
                <Box mb={8} textAlign="center">
                    <Text fontSize={{ base: "3xl", md: "4xl" }} fontWeight="900" mb={1}
                        bgGradient="linear(to-r, #f59e0b, #ef4444)"
                        bgClip="text"
                    >
                        🏆 Bảng Xếp Hạng
                    </Text>
                    <Text color="fg.muted" fontSize="sm">
                        Thời gian hoạt động trên ứng dụng
                    </Text>
                </Box>

                {/* Period tabs */}
                <Flex
                    bg="bg.subtle" borderRadius="2xl" p={1.5} mb={8}
                    borderWidth="1px" borderColor="border.muted" gap={1}
                >
                    {PERIODS.map(p => (
                        <Box
                            key={p.key}
                            flex={1}
                            py={2.5}
                            borderRadius="xl"
                            cursor="pointer"
                            textAlign="center"
                            fontWeight={period === p.key ? "800" : "500"}
                            fontSize="sm"
                            bg={period === p.key ? "bg.panel" : "transparent"}
                            color={period === p.key ? "fg" : "fg.muted"}
                            boxShadow={period === p.key ? "sm" : "none"}
                            transition="all 0.2s ease"
                            onClick={() => setPeriod(p.key)}
                        >
                            {p.label}
                        </Box>
                    ))}
                </Flex>

                {/* Table */}
                {loading ? (
                    <Flex justify="center" py={20}>
                        <Spinner size="xl" color="orange.400" />
                    </Flex>
                ) : data.length === 0 ? (
                    <Flex direction="column" align="center" py={20} gap={3} color="fg.muted">
                        <Text fontSize="4xl">📭</Text>
                        <Text fontWeight="600">Chưa có dữ liệu cho khoảng thời gian này</Text>
                    </Flex>
                ) : (
                    <Flex direction="column" gap={3}>
                        {data.map((item, idx) => {
                            const isMe = user?._id === item.userId?.toString();
                            const isOnline = onlineMap[item.userId] ?? item.isOnline;
                            const rank = idx + 1;

                            return (
                                <Flex
                                    key={item.userId}
                                    align="center"
                                    gap={4}
                                    p={4}
                                    borderRadius="2xl"
                                    borderWidth={isMe ? "2px" : "1px"}
                                    borderColor={isMe ? "orange.300" : "border.muted"}
                                    bg={isMe ? "orange.50" : "bg.panel"}
                                    _dark={{
                                        bg: isMe ? "orange.900/20" : "bg.panel",
                                        borderColor: isMe ? "orange.600" : "border.muted"
                                    }}
                                    boxShadow={isMe ? "0 0 0 4px rgba(251,146,60,0.15)" : "sm"}
                                    transition="all 0.2s"
                                    position="relative"
                                    overflow="hidden"
                                >
                                    {/* Top-3 gradient streak */}
                                    {rank <= 3 && (
                                        <Box
                                            position="absolute" top={0} left={0} right={0} h="3px"
                                            bg={rank === 1 ? "linear-gradient(90deg,#f59e0b,#fcd34d)" :
                                                rank === 2 ? "linear-gradient(90deg,#94a3b8,#e2e8f0)" :
                                                    "linear-gradient(90deg,#cd7f32,#f59e0b)"}
                                        />
                                    )}

                                    {/* Rank */}
                                    <Flex
                                        w="40px" h="40px" borderRadius="xl"
                                        align="center" justify="center"
                                        flexShrink={0}
                                        bg={rank <= 3 ? "transparent" : "bg.subtle"}
                                        fontSize={rank <= 3 ? "2xl" : "sm"}
                                        fontWeight="900"
                                        color={rank > 3 ? "fg.muted" : undefined}
                                    >
                                        {rank <= 3 ? MEDAL[rank - 1] : `#${rank}`}
                                    </Flex>

                                    {/* Avatar */}
                                    <Box position="relative" flexShrink={0}>
                                        {item.picture ? (
                                            <Box
                                                as="img"
                                                src={item.picture}
                                                referrerPolicy="no-referrer"
                                                w="42px" h="42px"
                                                borderRadius="full"
                                                border="2px solid"
                                                borderColor={isMe ? "orange.300" : "border.muted"}
                                            />
                                        ) : (
                                            <Flex
                                                w="42px" h="42px" borderRadius="full"
                                                bg="blue.500" color="white"
                                                align="center" justify="center"
                                                fontWeight="bold" fontSize="lg"
                                            >
                                                {item.name?.charAt(0).toUpperCase() || "?"}
                                            </Flex>
                                        )}
                                        {/* Online dot */}
                                        <Box
                                            position="absolute" bottom="-1px" right="-1px"
                                            w="13px" h="13px" borderRadius="full"
                                            bg={isOnline ? "green.400" : "red.400"}
                                            borderWidth="2px" borderColor="bg.panel"
                                            title={isOnline ? "Đang online" : "Offline"}
                                        />
                                    </Box>

                                    {/* Name + badge */}
                                    <Box flex={1} minW={0}>
                                        <Flex align="center" gap={2} flexWrap="wrap">
                                            <Text fontWeight="700" fontSize="sm" isTruncated>
                                                {item.name}
                                            </Text>
                                            {isMe && (
                                                <Badge colorPalette="orange" size="sm" borderRadius="full">
                                                    Bạn
                                                </Badge>
                                            )}
                                            <Box
                                                px={1.5} py={0.5}
                                                borderRadius="full"
                                                bg={isOnline ? "green.50" : "red.50"}
                                                _dark={{ bg: isOnline ? "green.900/30" : "red.900/30" }}
                                                display="flex" alignItems="center" gap={1}
                                            >
                                                <Box
                                                    w="6px" h="6px" borderRadius="full"
                                                    bg={isOnline ? "green.400" : "red.400"}
                                                    flexShrink={0}
                                                />
                                                <Text fontSize="10px" fontWeight="700"
                                                    color={isOnline ? "green.600" : "red.500"}
                                                    _dark={{ color: isOnline ? "green.300" : "red.300" }}
                                                >
                                                    {isOnline ? "Online" : "Offline"}
                                                </Text>
                                            </Box>
                                        </Flex>
                                        <Text fontSize="xs" color="fg.muted" mt={0.5}>
                                            Thời gian: <strong>{formatTime(item.totalSeconds)}</strong>
                                        </Text>
                                    </Box>

                                    {/* Time bar */}
                                    <Box textAlign="right" flexShrink={0}>
                                        <Text
                                            fontSize="lg" fontWeight="900"
                                            color={rank === 1 ? "orange.500" : rank === 2 ? "gray.500" : rank === 3 ? "orange.700" : "fg"}
                                        >
                                            {formatTime(item.totalSeconds)}
                                        </Text>
                                    </Box>
                                </Flex>
                            );
                        })}
                    </Flex>
                )}

                <Text fontSize="xs" color="fg.muted" textAlign="center" mt={8}>
                    Cập nhật theo thời gian thực · Chỉ tính thời gian khi bạn đang mở ứng dụng
                </Text>
            </Box>
        </BaseLayout>
    );
};

export default RankingPage;
