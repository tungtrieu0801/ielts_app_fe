import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, Flex, Text, useBreakpointValue } from "@chakra-ui/react";
import { useStudyStore } from "../../../stores/useStudyStore.js";

// ─── Constants ───────────────────────────────────────────────────────────────
const WEEKS = 53;
const DAY_LABELS = ["", "T2", "", "T4", "", "T6", ""];
const MONTH_NAMES = ["Th1", "Th2", "Th3", "Th4", "Th5", "Th6", "Th7", "Th8", "Th9", "Th10", "Th11", "Th12"];

// ─── Color levels ────────────────────────────────────────────────────────────
const getLevel = (words) => {
    if (!words || words === 0) return 0;
    if (words <= 5) return 1;
    if (words <= 15) return 2;
    if (words <= 30) return 3;
    return 4;
};

const LEVEL_COLORS_LIGHT = [
    "hsl(220, 13%, 91%)",   // 0 — xám nhạt
    "hsl(141, 55%, 85%)",   // 1 — xanh rất nhạt
    "hsl(141, 60%, 65%)",   // 2 — xanh nhạt
    "hsl(141, 65%, 42%)",   // 3 — xanh vừa
    "hsl(141, 70%, 25%)",   // 4 — xanh đậm
];

const LEVEL_COLORS_DARK = [
    "hsl(220, 13%, 18%)",   // 0
    "hsl(141, 40%, 18%)",   // 1
    "hsl(141, 50%, 28%)",   // 2
    "hsl(141, 60%, 40%)",   // 3
    "hsl(141, 65%, 55%)",   // 4
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const toDateStr = (d) => d.toISOString().split("T")[0];

const addDays = (date, days) => {
    const d = new Date(date);
    d.setUTCDate(d.getUTCDate() + days);
    return d;
};

const formatDate = (dateStr) => {
    const d = new Date(dateStr + "T00:00:00Z");
    return d.toLocaleDateString("vi-VN", { timeZone: "UTC", day: "numeric", month: "long", year: "numeric" });
};

// ─── Build 53-week grid ───────────────────────────────────────────────────────
// Returns array of 53 columns, each column is array of 7 days (Mon–Sun)
const buildGrid = () => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Find the Sunday of the current week (end of visible grid)
    // We align grid to Sunday as last cell
    const dayOfWeek = today.getUTCDay(); // 0=Sun, 1=Mon,...
    const endDate = addDays(today, 6 - dayOfWeek); // next Sunday (or today if Sunday)

    // Start = endDate - 52 weeks - 6 days
    const startDate = addDays(endDate, -(WEEKS * 7 - 1));

    const grid = []; // grid[week][day]
    let current = new Date(startDate);

    for (let w = 0; w < WEEKS; w++) {
        const week = [];
        for (let d = 0; d < 7; d++) {
            week.push(toDateStr(current));
            current = addDays(current, 1);
        }
        grid.push(week);
    }

    return { grid, startDate, endDate };
};

// ─── Month label positions ────────────────────────────────────────────────────
const buildMonthLabels = (grid) => {
    const labels = [];
    let lastMonth = -1;
    grid.forEach((week, wi) => {
        const firstDay = new Date(week[0] + "T00:00:00Z");
        const month = firstDay.getUTCMonth();
        if (month !== lastMonth) {
            labels.push({ month, weekIndex: wi });
            lastMonth = month;
        }
    });
    return labels;
};

// ─── Tooltip Component ────────────────────────────────────────────────────────
const Tooltip = ({ tooltip }) => {
    if (!tooltip) return null;
    return (
        <Box
            position="fixed"
            left={`${tooltip.x}px`}
            top={`${tooltip.y}px`}
            transform="translate(-50%, -100%)"
            mt={-2}
            bg="gray.800"
            color="white"
            fontSize="xs"
            px={3}
            py={1.5}
            borderRadius="md"
            pointerEvents="none"
            zIndex={9999}
            whiteSpace="nowrap"
            boxShadow="lg"
        >
            {tooltip.content}
        </Box>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const StudyStreakHeatmap = () => {
    const { streakInfo, fetchStreakInfo } = useStudyStore();
    const [heatmapData, setHeatmapData] = useState(null);
    const [tooltip, setTooltip] = useState(null);
    const [isDark, setIsDark] = useState(false);
    const scrollContainerRef = useRef(null);

    useEffect(() => {
        // Fetch heatmap directly (no longer in store)
        import("../../../services/studyApi.js").then(({ getHeatmap }) => {
            getHeatmap().then((data) => setHeatmapData(Array.isArray(data) ? data : [])).catch(() => {});
        });
        fetchStreakInfo();

        // Detect dark mode
        const check = () => setIsDark(document.documentElement.classList.contains("dark"));
        check();
        const observer = new MutationObserver(check);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
        return () => observer.disconnect();
    }, []);

    // Map date -> wordsReviewed
    const dataMap = useMemo(() => {
        const m = {};
        (heatmapData ?? []).forEach((log) => { m[log.date] = log.wordsReviewed; });
        return m;
    }, [heatmapData]);

    const { grid } = useMemo(() => buildGrid(), []);
    const monthLabels = useMemo(() => buildMonthLabels(grid), [grid]);

    const colors = isDark ? LEVEL_COLORS_DARK : LEVEL_COLORS_LIGHT;

    const todayStr = toDateStr(new Date());

    const handleMouseEnter = (e, dateStr) => {
        const words = dataMap[dateStr] || 0;
        const dateLabel = formatDate(dateStr);
        const content = words === 0
            ? `${dateLabel} • Chưa học`
            : `${dateLabel} • ${words} từ đã ôn`;
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltip({
            x: rect.left + rect.width / 2,
            y: rect.top + window.scrollY - 8,
            content,
        });
    };

    const handleMouseLeave = () => setTooltip(null);

    const CELL_SIZE = useBreakpointValue({ base: 9, md: 10, lg: 12 }) || 12;
    const CELL_GAP = useBreakpointValue({ base: 2, md: 3 }) || 3;

    // Scroll to the far right so today is visible
    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
        }
    }, [grid, CELL_SIZE]); // re-run if grid or cell size changes

    return (
        <Box
            bg="bg.panel"
            borderRadius="2xl"
            borderWidth="1px"
            borderColor="border.muted"
            mb={8}
            overflow="hidden"
        >
            {/* ── Header ─────────────────────────────────────────────────────── */}
            <Box px={6} pt={5} pb={4}>
                {/* Title row */}
                <Flex justify="space-between" align="flex-start" mb={3}>
                    <Box>
                        <Text fontSize="md" fontWeight="bold" mb={0.5}>
                            📅 Lịch sử học tập
                        </Text>
                        <Text fontSize="xs" color="fg.muted">
                            {streakInfo
                                ? `${streakInfo.totalStudyDays} ngày đã học trong năm qua`
                                : "Đang tải..."}
                        </Text>
                    </Box>

                    {/* Legend — top right corner */}
                    <Flex align="center" gap={1.5} mt={0.5}>
                        <Text fontSize="10px" color="fg.subtle">Ít</Text>
                        {[0, 1, 2, 3, 4].map((level) => (
                            <Box
                                key={level}
                                w="11px" h="11px"
                                borderRadius="2px"
                                style={{ backgroundColor: colors[level] }}
                            />
                        ))}
                        <Text fontSize="10px" color="fg.subtle">Nhiều</Text>
                    </Flex>
                </Flex>

                {/* Streak chips row */}
                <Flex gap={2} flexWrap="wrap">
                    {/* Current streak */}
                    <Flex
                        align="center" gap={1.5}
                        px={3} py={1.5}
                        borderRadius="full"
                        bg={isDark ? "orange.900/40" : "orange.50"}
                        borderWidth="1px"
                        borderColor={isDark ? "orange.700" : "orange.200"}
                    >
                        <Text fontSize="sm">🔥</Text>
                        <Text fontSize="sm" fontWeight="700" color="orange.500">
                            {streakInfo?.currentStreak ?? "–"}
                        </Text>
                        <Text fontSize="xs" color="fg.muted">ngày liên tiếp</Text>
                    </Flex>

                    {/* Longest streak */}
                    <Flex
                        align="center" gap={1.5}
                        px={3} py={1.5}
                        borderRadius="full"
                        bg={isDark ? "purple.900/40" : "purple.50"}
                        borderWidth="1px"
                        borderColor={isDark ? "purple.700" : "purple.200"}
                    >
                        <Text fontSize="sm">🏆</Text>
                        <Text fontSize="sm" fontWeight="700" color="purple.500">
                            {streakInfo?.longestStreak ?? "–"}
                        </Text>
                        <Text fontSize="xs" color="fg.muted">kỷ lục</Text>
                    </Flex>

                    {/* Total days */}
                    {streakInfo?.totalStudyDays > 0 && (
                        <Flex
                            align="center" gap={1.5}
                            px={3} py={1.5}
                            borderRadius="full"
                            bg={isDark ? "green.900/40" : "green.50"}
                            borderWidth="1px"
                            borderColor={isDark ? "green.700" : "green.200"}
                        >
                            <Text fontSize="sm">📚</Text>
                            <Text fontSize="sm" fontWeight="700" color="green.500">
                                {streakInfo.totalStudyDays}
                            </Text>
                            <Text fontSize="xs" color="fg.muted">ngày đã học</Text>
                        </Flex>
                    )}
                </Flex>
            </Box>

            {/* Divider */}
            <Box h="1px" bg="border.muted" mx={0} />

            {/* Heatmap grid */}
            <Box
                ref={scrollContainerRef}
                overflowX="auto"
                pb={4}
                sx={{
                    "&::-webkit-scrollbar": {
                        height: "6px",
                    },
                    "&::-webkit-scrollbar-track": {
                        background: "transparent",
                    },
                    "&::-webkit-scrollbar-thumb": {
                        background: isDark ? "whiteAlpha.200" : "blackAlpha.200",
                        borderRadius: "full",
                    },
                    "&::-webkit-scrollbar-thumb:hover": {
                        background: isDark ? "whiteAlpha.300" : "blackAlpha.300",
                    },
                }}
            >
                <Box
                    display="inline-flex"
                    gap={0}
                    flexDirection="column"
                    minW="max-content"
                    mx="auto"
                    px={{ base: 4, md: 6 }}
                    pt={4}
                >
                    {/* Month labels */}
                    <Box
                        display="flex"
                        mb={1}
                        pl={`${CELL_SIZE + CELL_GAP + 4}px`}
                        position="relative"
                        h="16px"
                    >
                        {monthLabels.map(({ month, weekIndex }, i) => (
                            <Box
                                key={i}
                                position="absolute"
                                left={`${(CELL_SIZE + CELL_GAP + 4) + weekIndex * (CELL_SIZE + CELL_GAP)}px`}
                                fontSize="11px"
                                color="fg.muted"
                                fontWeight="500"
                                whiteSpace="nowrap"
                            >
                                {MONTH_NAMES[month]}
                            </Box>
                        ))}
                    </Box>

                    {/* Grid body: day labels + cells */}
                    <Box display="flex" gap={`${CELL_GAP}px`}>
                        {/* Day of week labels */}
                        <Box display="flex" flexDirection="column" gap={`${CELL_GAP}px`} mr={1}>
                            {DAY_LABELS.map((label, i) => (
                                <Box
                                    key={i}
                                    h={`${CELL_SIZE}px`}
                                    w="18px"
                                    fontSize="10px"
                                    color="fg.muted"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="flex-end"
                                    pr={1}
                                    flexShrink={0}
                                >
                                    {label}
                                </Box>
                            ))}
                        </Box>

                        {/* Weeks */}
                        {grid.map((week, wi) => (
                            <Box key={wi} display="flex" flexDirection="column" gap={`${CELL_GAP}px`}>
                                {week.map((dateStr, di) => {
                                    const words = dataMap[dateStr] || 0;
                                    const level = getLevel(words);
                                    const isToday = dateStr === todayStr;
                                    const isFuture = dateStr > todayStr;

                                    return (
                                        <Box
                                            key={di}
                                            w={`${CELL_SIZE}px`}
                                            h={`${CELL_SIZE}px`}
                                            borderRadius="2px"
                                            flexShrink={0}
                                            style={{
                                                backgroundColor: isFuture
                                                    ? "transparent"
                                                    : colors[level],
                                                outline: isToday
                                                    ? `2px solid ${isDark ? "hsl(141,65%,55%)" : "hsl(141,70%,35%)"}`
                                                    : "none",
                                                outlineOffset: "1px",
                                                cursor: isFuture ? "default" : "pointer",
                                                transition: "transform 0.1s ease, filter 0.1s ease",
                                            }}
                                            onMouseEnter={isFuture ? undefined : (e) => handleMouseEnter(e, dateStr)}
                                            onMouseLeave={isFuture ? undefined : handleMouseLeave}
                                            _hover={isFuture ? {} : { filter: "brightness(1.2)", transform: "scale(1.3)" }}
                                        />
                                    );
                                })}
                            </Box>
                        ))}
                    </Box>

                </Box>
            </Box>


            {/* Tooltip */}
            <Tooltip tooltip={tooltip} />
        </Box>
    );
};

export default StudyStreakHeatmap;