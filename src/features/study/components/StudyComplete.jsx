import React from "react";
import { Box, Flex, Text, Button, SimpleGrid } from "@chakra-ui/react";
import { FiRepeat, FiHome } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const QUALITY_CONFIG = {
    AGAIN: { emoji: "❌", label: "Lại", color: "#ef4444", bg: "#fef2f2" },
    HARD: { emoji: "😓", label: "Khó", color: "#f97316", bg: "#fff7ed" },
    GOOD: { emoji: "👍", label: "Nhớ", color: "#3b82f6", bg: "#eff6ff" },
    EASY: { emoji: "✅", label: "Dễ", color: "#22c55e", bg: "#f0fdf4" },
};

const StudyComplete = ({ submitResult, setId, setTitle, onRestart }) => {
    const navigate = useNavigate();
    const summary = submitResult?.summary ?? {};
    const reviewed = submitResult?.reviewed ?? 0;

    // Accuracy = (GOOD + EASY) / total
    const correct = (summary.GOOD ?? 0) + (summary.EASY ?? 0);
    const accuracy = reviewed > 0 ? Math.round((correct / reviewed) * 100) : 0;

    return (
        <Box
            bg="bg.panel"
            borderRadius="3xl"
            p={{ base: 6, md: 8 }}
            w="full"
            maxW="480px"
            shadow="2xl"
            borderWidth="1px"
            borderColor="border.subtle"
            textAlign="center"
            position="relative"
            overflow="hidden"
            mx={4}
        >
            {/* Glow blob */}
            <Box
                position="absolute"
                top="-60px"
                left="50%"
                transform="translateX(-50%)"
                w="200px"
                h="200px"
                bg="blue.400"
                opacity={0.15}
                filter="blur(50px)"
                borderRadius="full"
                pointerEvents="none"
            />

            <Flex direction="column" align="center" gap={5} position="relative" zIndex={1}>
                <Text fontSize={{ base: "6xl", md: "7xl" }} mb={-2}>
                    {accuracy >= 80 ? "🎉" : accuracy >= 50 ? "💪" : "📚"}
                </Text>

                <Box>
                    <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="900" letterSpacing="tight" mb={1}>
                        {accuracy >= 80 ? "Xuất sắc!" : accuracy >= 50 ? "Tiếp tục cố gắng!" : "Cần ôn luyện thêm!"}
                    </Text>
                    <Text color="fg.muted" fontSize="sm">
                        {setTitle ?? "Đã hoàn thành session học"}
                    </Text>
                </Box>

                {/* Accuracy ring */}
                <Box
                    bg="bg.subtle"
                    borderRadius="2xl"
                    p={5}
                    w="full"
                    borderWidth="1px"
                    borderColor="border.muted"
                >
                    <Text
                        fontSize="4xl"
                        fontWeight="900"
                        color={accuracy >= 80 ? "green.500" : accuracy >= 50 ? "blue.500" : "orange.500"}
                        lineHeight="1"
                        mb={1}
                    >
                        {accuracy}%
                    </Text>
                    <Text color="fg.muted" fontWeight="600" fontSize="sm">
                        Độ chính xác · {reviewed} từ đã học
                    </Text>
                </Box>

                {/* Quality breakdown */}
                <SimpleGrid columns={4} gap={2} w="full">
                    {Object.entries(QUALITY_CONFIG).map(([quality, cfg]) => {
                        const count = summary[quality] ?? 0;
                        return (
                            <Box
                                key={quality}
                                bg={cfg.bg}
                                borderRadius="xl"
                                p={3}
                                textAlign="center"
                                _dark={{ bg: "bg.subtle" }}
                            >
                                <Text fontSize="xl" mb={0.5}>
                                    {cfg.emoji}
                                </Text>
                                <Text
                                    fontSize="xl"
                                    fontWeight="900"
                                    color={cfg.color}
                                    lineHeight="1"
                                >
                                    {count}
                                </Text>
                                <Text fontSize="xs" color="fg.muted" mt={0.5}>
                                    {cfg.label}
                                </Text>
                            </Box>
                        );
                    })}
                </SimpleGrid>

                {/* Actions */}
                <Flex w="full" gap={3} direction="column" mt={2}>
                    <Button
                        size="lg"
                        w="full"
                        bg="linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)"
                        color="white"
                        borderRadius="xl"
                        fontWeight="bold"
                        onClick={() => navigate("/home")}
                        gap={2}
                        _hover={{ opacity: 0.9, transform: "translateY(-1px)" }}
                        transition="all 0.2s"
                    >
                        <FiHome size={18} /> Về trang chủ
                    </Button>
                    <Flex gap={3}>
                        <Button
                            flex={1}
                            size="md"
                            variant="outline"
                            borderRadius="xl"
                            onClick={onRestart}
                            gap={1}
                        >
                            <FiRepeat size={15} /> Tiếp tục luyện tập
                        </Button>
                        <Button
                            flex={1}
                            size="md"
                            variant="ghost"
                            borderRadius="xl"
                            color="fg.muted"
                            onClick={() => navigate(setId === "global" ? "/sets" : `/sets/${setId}`)}
                        >
                            Quản lý bộ từ
                        </Button>
                    </Flex>
                </Flex>
            </Flex>
        </Box>
    );
};

export default StudyComplete;
