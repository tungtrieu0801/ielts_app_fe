import React, { useEffect, useState, useCallback } from "react";
import { Box, Flex, Text, Button, Spinner } from "@chakra-ui/react";
import { FiPlay, FiClock, FiCalendar, FiRefreshCw } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { getSchedule } from "../../../services/studyApi.js";
import { useVocabularyStore } from "../../../stores/useVocabularyStore.js";

/**
 * SRSScheduleWidget — shows the user what's available NOW vs what's upcoming,
 * with a big "Study Now" CTA and a timeline of future review milestones.
 */
const SRSScheduleWidget = () => {
    const navigate = useNavigate();
    const { wordSets } = useVocabularyStore();

    const [schedule, setSchedule] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchSchedule = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getSchedule();
            setSchedule(data);
        } catch (_) {
            setSchedule(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSchedule();
        // Auto-refresh every 60 seconds so the countdown stays live
        const timer = setInterval(fetchSchedule, 60_000);
        return () => clearInterval(timer);
    }, [fetchSchedule]);

    // Pick the first set to study (could be smarter, but good enough for now)
    const firstSet = wordSets[0];

    const handleStudyNow = () => {
        if (firstSet) navigate(`/study/${firstSet._id}`);
        else navigate("/sets");
    };

    const available = schedule?.availableNow ?? 0;
    const hasAvailable = available > 0;
    const nextMin = schedule?.minutesUntilNext;
    const timeline = schedule?.timeline ?? [];

    return (
        <Box
            bg="bg.panel"
            borderRadius="2xl"
            borderWidth="1px"
            borderColor="border.muted"
            overflow="hidden"
            mb={8}
        >
            {/* Header */}
            <Flex
                p={5}
                pb={0}
                justify="space-between"
                align="center"
            >
                <Flex align="center" gap={2}>
                    <FiCalendar size={16} style={{ opacity: 0.6 }} />
                    <Text fontWeight="bold" fontSize="md">Lịch ôn tập SRS</Text>
                </Flex>
                <Button
                    size="xs"
                    variant="ghost"
                    color="fg.muted"
                    onClick={fetchSchedule}
                    disabled={loading}
                >
                    <FiRefreshCw size={12} />
                </Button>
            </Flex>

            {loading ? (
                <Flex justify="center" py={8}><Spinner size="sm" /></Flex>
            ) : (
                <Box p={5} pt={4}>
                    {/* Available now section */}
                    <Flex
                        align="center"
                        justify="space-between"
                        p={4}
                        borderRadius="xl"
                        bg={hasAvailable
                            ? "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)"
                            : "bg.subtle"}
                        mb={4}
                        gap={3}
                    >
                        <Flex align="center" gap={3}>
                            <Box
                                w="44px" h="44px"
                                borderRadius="xl"
                                bg={hasAvailable ? "white/20" : "bg.muted"}
                                display="flex" alignItems="center" justifyContent="center"
                                fontSize="xl"
                            >
                                {hasAvailable ? "📚" : "✅"}
                            </Box>
                            <Box>
                                <Text
                                    fontWeight="900"
                                    fontSize="2xl"
                                    color={hasAvailable ? "white" : "fg"}
                                    lineHeight="1"
                                >
                                    {available}
                                </Text>
                                <Text
                                    fontSize="xs"
                                    color={hasAvailable ? "white/80" : "fg.muted"}
                                    fontWeight="500"
                                >
                                    {hasAvailable ? "từ có thể học ngay" : "Hôm nay đã xong!"}
                                </Text>
                            </Box>
                        </Flex>

                        {hasAvailable ? (
                            <Button
                                size="sm"
                                bg="white"
                                color="blue.600"
                                borderRadius="xl"
                                fontWeight="bold"
                                gap={1.5}
                                flexShrink={0}
                                onClick={handleStudyNow}
                                _hover={{ bg: "white", opacity: 0.9 }}
                            >
                                <FiPlay size={13} /> Học ngay
                            </Button>
                        ) : (
                            nextMin && (
                                <Flex
                                    align="center"
                                    gap={1.5}
                                    px={3}
                                    py={2}
                                    borderRadius="lg"
                                    bg="blue.50"
                                    _dark={{ bg: "blue.900/30" }}
                                    flexShrink={0}
                                >
                                    <FiClock size={13} color="var(--chakra-colors-blue-500)" />
                                    <Text fontSize="sm" fontWeight="bold" color="blue.600" _dark={{ color: "blue.300" }}>
                                        {nextMin < 60
                                            ? `${nextMin} phút nữa`
                                            : nextMin < 1440
                                                ? `${Math.ceil(nextMin / 60)} giờ nữa`
                                                : `${Math.round(nextMin / 1440)} ngày nữa`}
                                    </Text>
                                </Flex>
                            )
                        )}
                    </Flex>

                    {/* No cards at all */}
                    {available === 0 && timeline.length === 0 && (
                        <Text fontSize="sm" color="fg.muted" textAlign="center" py={2}>
                            Chưa có từ nào trong hệ thống. Thêm từ vào bộ từ để bắt đầu!
                        </Text>
                    )}

                    {/* Timeline */}
                    {timeline.length > 0 && (
                        <Box>
                            <Text fontSize="xs" fontWeight="600" color="fg.muted" textTransform="uppercase" letterSpacing="wider" mb={3}>
                                Sắp tới
                            </Text>
                            <Flex direction="column" gap={2}>
                                {timeline.map((bucket, i) => (
                                    <Flex
                                        key={i}
                                        align="center"
                                        justify="space-between"
                                        p={3}
                                        borderRadius="lg"
                                        bg="bg.subtle"
                                        borderWidth="1px"
                                        borderColor="border.muted"
                                    >
                                        <Flex align="center" gap={2}>
                                            <Box
                                                w="6px" h="6px" borderRadius="full"
                                                bg={i === 0 ? "blue.400" : "fg.subtle"}
                                                flexShrink={0}
                                            />
                                            <Text fontSize="sm" color="fg.muted">{bucket.label}</Text>
                                        </Flex>
                                        <Flex align="center" gap={1.5}>
                                            <Text fontSize="sm" fontWeight="700" color="fg">
                                                {bucket.count}
                                            </Text>
                                            <Text fontSize="xs" color="fg.muted">từ</Text>
                                        </Flex>
                                    </Flex>
                                ))}
                            </Flex>
                        </Box>
                    )}
                </Box>
            )}
        </Box>
    );
};

export default SRSScheduleWidget;
