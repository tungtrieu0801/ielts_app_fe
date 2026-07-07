import React from "react";
import { Box, Flex, Text, Button, SimpleGrid, Badge } from "@chakra-ui/react";
import { FiRepeat, FiHome, FiVolume2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const speakWord = (text) => {
    if (!text || !window.speechSynthesis) return;
    try {
        window.speechSynthesis.cancel();
        const cleaned = text.replace(/[()]/g, "").trim();
        const utterance = new SpeechSynthesisUtterance(cleaned);
        utterance.lang = "en-US";
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
    } catch (e) {
        console.error("Speech synthesis failed:", e);
    }
};

const QUALITY_CONFIG = {
    AGAIN: { emoji: "❌", label: "Rất khó", color: "#ef4444", bg: "#fef2f2" },
    HARD: { emoji: "😓", label: "Khó", color: "#f97316", bg: "#fff7ed" },
    GOOD: { emoji: "👍", label: "Nhớ được", color: "#3b82f6", bg: "#eff6ff" },
    EASY: { emoji: "✅", label: "Dễ dàng", color: "#22c55e", bg: "#f0fdf4" },
};

const StudyComplete = ({ submitResult, setId, setTitle, onRestart, sessionHistory }) => {
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
            p={{ base: 6, md: 8, lg: 10 }}
            w="full"
            maxW={{ base: "95%", sm: "92%", md: "90%", lg: "1200px", xl: "1450px" }}
            shadow="2xl"
            borderWidth="1px"
            borderColor="border.subtle"
            position="relative"
            overflow="hidden"
            mx="auto"
        >
            {/* Glow blob */}
            <Box
                position="absolute"
                top="-120px"
                left="50%"
                transform="translateX(-50%)"
                w="500px"
                h="350px"
                bg="blue.500"
                opacity={0.12}
                filter="blur(85px)"
                borderRadius="full"
                pointerEvents="none"
            />

            <Flex
                direction={{ base: "column", md: "row" }}
                align={{ base: "center", md: "stretch" }}
                gap={{ base: 6, md: 8, lg: 10 }}
                position="relative"
                zIndex={1}
                w="full"
            >
                {/* ── Left Column: Stats & Actions ── */}
                <Flex direction="column" align="center" gap={5} w={{ base: "full", md: "320px", lg: "340px" }} flexShrink={0} textAlign="center">
                    <Flex direction="column" align="center" gap={1}>
                        <Text fontSize={{ base: "6xl", md: "7xl" }} mb={-2}>
                            {accuracy >= 80 ? "🎉" : accuracy >= 50 ? "💪" : "📚"}
                        </Text>
                        <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="900" letterSpacing="tight" mb={1} color="fg">
                            {accuracy >= 80 ? "Xuất sắc!" : accuracy >= 50 ? "Tiếp tục cố gắng!" : "Cần ôn luyện thêm!"}
                        </Text>
                        <Text color="fg.muted" fontSize="sm" fontWeight="600">
                            {setTitle ?? "Đã hoàn thành session học"}
                        </Text>
                    </Flex>

                    {/* Accuracy card */}
                    <Box
                        background="linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%)"
                        borderRadius="2xl"
                        p={5}
                        w="full"
                        borderWidth="1px"
                        borderColor="border.muted"
                        position="relative"
                        overflow="hidden"
                    >
                        <Text
                            fontSize="5xl"
                            fontWeight="900"
                            color={accuracy >= 80 ? "green.500" : accuracy >= 50 ? "blue.500" : "orange.500"}
                            lineHeight="1"
                            mb={2}
                        >
                            {accuracy}%
                        </Text>
                        <Text color="fg" fontWeight="800" fontSize="sm">
                            Độ chính xác học tập
                        </Text>
                        <Text color="fg.muted" fontWeight="600" fontSize="xs" mt={1}>
                            Đã hoàn thành {reviewed} từ vựng
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
                                    p={2.5}
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
                                    <Text fontSize="9px" color="fg.muted" fontWeight="bold" mt={0.5}>
                                        {cfg.label}
                                    </Text>
                                </Box>
                            );
                        })}
                    </SimpleGrid>

                    {/* Actions */}
                    <Flex w="full" gap={2.5} direction="column" mt="auto">
                        <Button
                            size="lg"
                            w="full"
                            bg="linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)"
                            color="white"
                            borderRadius="xl"
                            fontWeight="bold"
                            onClick={() => navigate("/home")}
                            gap={2}
                            _hover={{ opacity: 0.9, transform: "translateY(-1px)", shadow: "sm" }}
                            transition="all 0.2s"
                        >
                            <FiHome size={18} /> Về trang chủ
                        </Button>
                        <Flex gap={2}>
                            <Button
                                flex={1}
                                size="md"
                                variant="outline"
                                borderRadius="xl"
                                onClick={onRestart}
                                gap={1.5}
                                fontSize="xs"
                                fontWeight="800"
                                _hover={{ bg: "bg.subtle" }}
                            >
                                <FiRepeat size={13} /> Luyện tiếp
                            </Button>
                            <Button
                                flex={1}
                                size="md"
                                variant="ghost"
                                borderRadius="xl"
                                color="fg.muted"
                                onClick={() => navigate(setId === "global" ? "/sets" : `/sets/${setId}`)}
                                fontSize="xs"
                                fontWeight="800"
                                _hover={{ bg: "bg.subtle", color: "fg" }}
                            >
                                Quản lý bộ từ
                            </Button>
                        </Flex>
                    </Flex>
                </Flex>

                {/* ── Vertical Divider (Desktop only) ── */}
                <Box
                    display={{ base: "none", md: "block" }}
                    w="1px"
                    bg="border.subtle"
                    alignSelf="stretch"
                    my={2}
                />

                {/* ── Right Column: Detailed Word List ── */}
                <Flex direction="column" flex={1} w="full" minW="0" textAlign="left">
                    <Text fontSize="xs" fontWeight="800" textTransform="uppercase" letterSpacing="wider" mb={4} color="fg.muted" display="flex" alignItems="center" gap={2}>
                        <span>📊 CHI TIẾT TỪ VỰNG ({Object.keys(sessionHistory).length})</span>
                        <Badge colorPalette="blue" variant="solid" borderRadius="full" px={2.5} py={0.5} fontSize="9px" fontWeight="bold">
                            KẾT QUẢ VỪA HỌC
                        </Badge>
                    </Text>

                    <Box
                        maxH={{ base: "300px", md: "520px", lg: "580px", xl: "650px" }}
                        overflowY="auto"
                        pr={2}
                        w="full"
                        borderRadius="2xl"
                        borderWidth="1px"
                        borderColor="border.subtle"
                        bg="bg.subtle"
                        _dark={{ bg: "bg.panel" }}
                        p={4}
                        css={{
                            '&::-webkit-scrollbar': { width: '6px' },
                            '&::-webkit-scrollbar-track': { background: 'transparent' },
                            '&::-webkit-scrollbar-thumb': { background: 'var(--chakra-colors-border-muted)', borderRadius: '10px' },
                        }}
                    >
                        {sessionHistory && Object.keys(sessionHistory).length > 0 ? (
                            <SimpleGrid minChildWidth={{ base: "100%", sm: "200px", md: "230px" }} gap={4}>
                                {Object.values(sessionHistory).map((item, idx) => {
                                    const modeLabelMap = {
                                        flashcard: { label: "🃏 Flash", color: "purple" },
                                        fill: { label: "✏️ Điền", color: "orange" },
                                        listen: { label: "🎧 Nghe", color: "teal" },
                                        read: { label: "⌨️ Đọc", color: "blue" },
                                    };
                                    const modeInfo = modeLabelMap[item.mode] || { label: item.mode, color: "gray" };

                                    const qualityKey = item.quality || (item.isCorrect ? "GOOD" : "AGAIN");
                                    const qualityInfo = QUALITY_CONFIG[qualityKey] || QUALITY_CONFIG.AGAIN;

                                    const levelColors = {
                                        AGAIN: { cardBorder: "red.200", cardBorderHover: "red.450", barBg: "red.400", pillBg: "red.50", pillDarkBg: "red.950/40", pillColor: "red.600", pillDarkColor: "red.400", pillBorder: "red.200/50" },
                                        HARD: { cardBorder: "orange.200", cardBorderHover: "orange.450", barBg: "orange.400", pillBg: "orange.50", pillDarkBg: "orange.950/40", pillColor: "orange.600", pillDarkColor: "orange.400", pillBorder: "orange.200/50" },
                                        GOOD: { cardBorder: "blue.200", cardBorderHover: "blue.450", barBg: "blue.400", pillBg: "blue.50", pillDarkBg: "blue.950/40", pillColor: "blue.600", pillDarkColor: "blue.400", pillBorder: "blue.200/50" },
                                        EASY: { cardBorder: "green.200", cardBorderHover: "green.450", barBg: "green.400", pillBg: "green.50", pillDarkBg: "green.950/40", pillColor: "green.600", pillDarkColor: "green.400", pillBorder: "green.200/50" },
                                    };
                                    const themeColors = levelColors[qualityKey] || levelColors.AGAIN;

                                    const chakraColorNames = {
                                        AGAIN: "red",
                                        HARD: "orange",
                                        GOOD: "blue",
                                        EASY: "green",
                                    };
                                    const chakraColor = chakraColorNames[qualityKey] || "red";

                                    return (
                                        <Box
                                            key={idx}
                                            p={4}
                                            bg="bg.panel"
                                            borderRadius="2xl"
                                            borderWidth="1px"
                                            borderColor={themeColors.cardBorder}
                                            _dark={{ bg: "bg.subtle", borderColor: `${chakraColor}.900/40` }}
                                            shadow="xs"
                                            cursor="pointer"
                                            onClick={() => speakWord(item.english)}
                                            _hover={{ 
                                                transform: "translateY(-2px)", 
                                                shadow: "md", 
                                                borderColor: themeColors.cardBorderHover,
                                                _dark: { borderColor: `${chakraColor}.600` }
                                            }}
                                            transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                                            display="flex"
                                            flexDirection="column"
                                            justifyContent="space-between"
                                            gap={3.5}
                                            position="relative"
                                            overflow="hidden"
                                        >
                                            {/* Left status bar */}
                                            <Box 
                                                position="absolute"
                                                left={0}
                                                top={0}
                                                bottom={0}
                                                w="4px"
                                                bg={themeColors.barBg}
                                            />
                                            
                                            <Box pl={1}>
                                                <Flex align="center" justify="space-between" mb={1} gap={2}>
                                                    <Text fontSize="sm" fontWeight="800" color="fg" lineHeight="short" title={item.english} isTruncated>
                                                        {item.english}
                                                    </Text>
                                                    <Box color={`${chakraColor}.500`} opacity={0.65} _hover={{ opacity: 1 }} transition="opacity 0.2s" flexShrink={0}>
                                                        <FiVolume2 size={14} />
                                                    </Box>
                                                </Flex>
                                                <Text fontSize="xs" color="fg.muted" fontWeight="600" lineHeight="normal" title={item.vietnamese} isTruncated>
                                                    {item.vietnamese}
                                                </Text>
                                            </Box>

                                            <Flex justify="space-between" align="center" pl={1} mt="auto">
                                                <Badge 
                                                    colorPalette={modeInfo.color} 
                                                    variant="subtle" 
                                                    size="sm" 
                                                    borderRadius="lg" 
                                                    fontWeight="700"
                                                    px={2.5}
                                                    py={0.5}
                                                >
                                                    {modeInfo.label}
                                                </Badge>

                                                <Flex
                                                    align="center"
                                                    gap={1}
                                                    bg={themeColors.pillBg}
                                                    _dark={{ bg: themeColors.pillDarkBg }}
                                                    color={themeColors.pillColor}
                                                    _dark_color={themeColors.pillDarkColor}
                                                    px={2.5}
                                                    py={0.5}
                                                    borderRadius="lg"
                                                    fontSize="xs"
                                                    fontWeight="800"
                                                    borderWidth="1px"
                                                    borderColor={themeColors.pillBorder}
                                                >
                                                    <span>{qualityInfo.emoji} {qualityInfo.label}</span>
                                                    {item.timeMs !== null && item.timeMs !== undefined && (
                                                        <span style={{ opacity: 0.85, fontWeight: "900", marginLeft: "2px" }}>
                                                            · {(item.timeMs / 1000).toFixed(1)}s
                                                        </span>
                                                    )}
                                                </Flex>
                                            </Flex>
                                        </Box>
                                    );
                                })}
                            </SimpleGrid>
                        ) : (
                            <Flex justify="center" align="center" h="100px" color="fg.muted">
                                <Text fontSize="sm">Chưa có thông tin từ vựng.</Text>
                            </Flex>
                        )}
                    </Box>
                </Flex>
            </Flex>
        </Box>
    );
};

export default StudyComplete;
