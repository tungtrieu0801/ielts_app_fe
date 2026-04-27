import React, { useState, useEffect } from "react";
import { Box, Flex, Text, Spinner, VStack, Icon } from "@chakra-ui/react";
import { FiTrendingUp, FiZap } from "react-icons/fi";
import { getRanking } from "../../../services/studyApi.js";
import { useAuthStore } from "../../../stores/useAuthStore";

const StreakRanking = () => {
    const { user: authUser } = useAuthStore();
    const [rankingData, setRankingData] = useState({ topUsers: [], currentUser: null });
    const [loading, setLoading] = useState(true);

    const fetchRanking = async () => {
        try {
            const data = await getRanking();
            setRankingData(data);
        } catch (err) {
            console.error("Failed to fetch ranking:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRanking();
        const interval = setInterval(fetchRanking, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const renderUser = (user, rank, isCurrentUser = false) => (
        <Flex
            key={user._id || "current"}
            align="center"
            p={3}
            borderRadius="xl"
            bg={isCurrentUser ? "orange.50" : "transparent"}
            _dark={{ bg: isCurrentUser ? "orange.900/30" : "transparent" }}
            _hover={{ bg: isCurrentUser ? "orange.100" : "bg.subtle" }}
            transition="all 0.2s"
            gap={3}
            borderWidth={isCurrentUser ? "1px" : "0"}
            borderColor="orange.200"
        >
            <Text
                fontSize="sm"
                fontWeight="bold"
                color={rank <= 3 ? "orange.500" : "fg.muted"}
                w="24px"
                textAlign="center"
            >
                {rank ? `#${rank}` : "—"}
            </Text>
            <Box 
                w="32px" h="32px" borderRadius="full" overflow="hidden" flexShrink={0}
                bg="orange.100" _dark={{ bg: "orange.800" }}
                borderWidth={isCurrentUser ? "2px" : "0px"}
                borderColor="orange.400"
            >
                <img src={user.picture} alt={user.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </Box>
            <Box flex={1}>
                <Text fontSize="sm" fontWeight="bold" isTruncated maxW="150px" color={isCurrentUser ? "orange.700" : "fg"} _dark={{ color: isCurrentUser ? "orange.300" : "fg" }}>
                    {user.name} {isCurrentUser && "(Bạn)"}
                </Text>
            </Box>
            <Flex align="center" gap={1} bg="orange.100" _dark={{ bg: "orange.900/40" }} px={2} py={0.5} borderRadius="full">
                <Icon as={FiZap} color="orange.500" size={12} />
                <Text fontSize="xs" fontWeight="extrabold" color="orange.600" _dark={{ color: "orange.300" }}>
                    {user.currentStreak}
                </Text>
            </Flex>
        </Flex>
    );

    const isCurrentUserInTop10 = rankingData.topUsers.some(u => authUser && u._id === authUser.id);

    return (
        <Box
            bg="bg.panel"
            borderRadius="2xl"
            borderWidth="1px"
            borderColor="border.muted"
            overflow="hidden"
            shadow="sm"
        >
            <Box bg="orange.50" _dark={{ bg: "orange.900/30" }} p={4} borderBottomWidth="1px" borderColor="orange.100" _dark={{ borderColor: "orange.800/30" }}>
                <Flex align="center" gap={2}>
                    <Icon as={FiTrendingUp} color="orange.500" />
                    <Text fontSize="md" fontWeight="bold" color="orange.700" _dark={{ color: "orange.300" }}>
                        Bảng xếp hạng Streak
                    </Text>
                </Flex>
            </Box>

            <VStack gap={0} align="stretch" p={2}>
                {loading ? (
                    <Flex justify="center" py={8}><Spinner size="sm" color="orange.400" /></Flex>
                ) : rankingData.topUsers.length === 0 ? (
                    <Text fontSize="xs" color="fg.muted" textAlign="center" py={4}>
                        Chưa có dữ liệu xếp hạng. Hãy học bài để lên top!
                    </Text>
                ) : (
                    <>
                        {rankingData.topUsers.map((user, index) => renderUser(user, index + 1, authUser && user._id === authUser.id))}
                        
                        {!isCurrentUserInTop10 && rankingData.currentUser && rankingData.currentUser.currentStreak > 0 && (
                            <>
                                <Box h="1px" bg="border.subtle" my={2} w="full" />
                                {renderUser(rankingData.currentUser, rankingData.currentUser.rank, true)}
                            </>
                        )}
                        {!isCurrentUserInTop10 && (!rankingData.currentUser || rankingData.currentUser.currentStreak === 0) && authUser && (
                            <>
                                <Box h="1px" bg="border.subtle" my={2} w="full" />
                                <Text fontSize="xs" color="fg.muted" textAlign="center" py={2}>
                                    Bạn chưa có streak. Hãy học ngay hôm nay!
                                </Text>
                            </>
                        )}
                    </>
                )}
            </VStack>
        </Box>
    );
};

export default StreakRanking;
