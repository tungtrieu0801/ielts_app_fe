import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { useStudyStore } from "../../../stores/useStudyStore.js";

const MONTH_NAMES = ["Th1","Th2","Th3","Th4","Th5","Th6","Th7","Th8","Th9","Th10","Th11","Th12"];
const WEEKS = 53;
const CELL_GAP = 3;

// Dark mode — LeetCode-style
const COLORS_DARK = {
    bg: "#0d1117",
    border: "rgba(255,255,255,0.08)",
    text: "white",
    textMuted: "rgba(255,255,255,0.4)",
    badgeBg: "rgba(255,255,255,0.05)",
    badgeBorder: "rgba(255,255,255,0.1)",
    tooltipBg: "#1c2128",
    tooltipBorder: "rgba(255,255,255,0.15)",
    cells: ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"],
    today: "#39d353",
};

// Light mode — clean GitHub-like
const COLORS_LIGHT = {
    bg: "#ffffff",
    border: "rgba(0,0,0,0.08)",
    text: "#1a202c",
    textMuted: "rgba(0,0,0,0.45)",
    badgeBg: "rgba(0,0,0,0.03)",
    badgeBorder: "rgba(0,0,0,0.08)",
    tooltipBg: "#1c2128",
    tooltipBorder: "rgba(255,255,255,0.15)",
    cells: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"],
    today: "#216e39",
};


const getLevel = (w) => !w ? 0 : w <= 5 ? 1 : w <= 15 ? 2 : w <= 30 ? 3 : 4;

const toDateStr = (d) => d.toISOString().split("T")[0];

const addDays = (date, days) => {
    const d = new Date(date);
    d.setUTCDate(d.getUTCDate() + days);
    return d;
};

const formatDate = (s) =>
    new Date(s + "T00:00:00Z").toLocaleDateString("vi-VN", {
        timeZone: "UTC", day: "numeric", month: "long", year: "numeric",
    });

const buildGrid = (weeks) => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const dow = today.getUTCDay();
    const end = addDays(today, 6 - dow);
    const start = addDays(end, -(weeks * 7 - 1));
    const grid = [];
    let cur = new Date(start);
    for (let w = 0; w < weeks; w++) {
        const week = [];
        for (let d = 0; d < 7; d++) { week.push(toDateStr(cur)); cur = addDays(cur, 1); }
        grid.push(week);
    }
    return grid;
};

const buildMonthLabels = (grid) => {
    const labels = [];
    let last = -1;
    grid.forEach((week, wi) => {
        const m = new Date(week[0] + "T00:00:00Z").getUTCMonth();
        if (m !== last) { labels.push({ month: m, wi }); last = m; }
    });
    return labels;
};

const StudyStreakHeatmap = () => {
    const { streakInfo, fetchStreakInfo } = useStudyStore();
    const [heatmapData, setHeatmapData] = useState(null);
    const [tooltip, setTooltip] = useState(null);
    const [cellSize, setCellSize] = useState(14);
    const [weeks, setWeeks] = useState(WEEKS);
    const [isDark, setIsDark] = useState(false);
    const containerRef = useRef(null);
    const C = isDark ? COLORS_DARK : COLORS_LIGHT;

    useEffect(() => {
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

    // Auto-compute weeks + cellSize to exactly fill container — no scroll ever
    useEffect(() => {
        if (!containerRef.current) return;
        const compute = () => {
            const w = containerRef.current?.clientWidth ?? 0;
            const available = w - 48; // 24px padding each side
            const MIN_CELL = 10;
            // How many weeks fit at minimum cell size?
            const maxWeeks = Math.min(WEEKS, Math.floor((available + CELL_GAP) / (MIN_CELL + CELL_GAP)));
            const w2 = Math.max(4, maxWeeks);
            // Fill the width perfectly with those weeks
            const size = Math.floor((available - (w2 - 1) * CELL_GAP) / w2);
            setWeeks(w2);
            setCellSize(Math.max(MIN_CELL, Math.min(18, size)));
        };
        compute();
        const ro = new ResizeObserver(compute);
        ro.observe(containerRef.current);
        return () => ro.disconnect();
    }, []);


    const dataMap = useMemo(() => {
        const m = {};
        (heatmapData ?? []).forEach((log) => { m[log.date] = log.wordsReviewed; });
        return m;
    }, [heatmapData]);

    const grid = useMemo(() => buildGrid(weeks), [weeks]);
    const monthLabels = useMemo(() => buildMonthLabels(grid), [grid]);
    const todayStr = toDateStr(new Date());
    const STEP = cellSize + CELL_GAP;

    const handleMouseEnter = (e, dateStr) => {
        const words = dataMap[dateStr] || 0;
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltip({
            x: rect.left + rect.width / 2,
            y: rect.top - 8,
            content: words === 0
                ? `${formatDate(dateStr)} • Chưa học`
                : `${formatDate(dateStr)} • ${words} từ đã ôn`,
        });
    };

    return (
        <Box
            ref={containerRef}
            borderRadius="2xl"
            mb={8}
            overflow="hidden"
            borderWidth="1px"
            style={{ backgroundColor: C.bg, borderColor: C.border }}
        >
            {/* Header */}
            <Flex px={6} pt={5} pb={4} justify="space-between" align="center" flexWrap="wrap" gap={3}>
                <Box>
                    <Text fontSize="md" fontWeight="bold" mb={0.5} style={{ color: C.text }}>
                        📅 Lịch sử học tập
                    </Text>
                    <Text fontSize="xs" style={{ color: C.textMuted }}>
                        {streakInfo ? `${streakInfo.totalStudyDays} ngày đã học trong năm qua` : "Đang tải..."}
                    </Text>
                </Box>
                <Flex gap={3} align="center" flexWrap="wrap">
                    <Flex align="center" gap={1.5} px={3} py={1.5} borderRadius="full"
                        style={{ backgroundColor: C.badgeBg, border: `1px solid ${C.badgeBorder}` }}
                    >
                        <Text fontSize="sm">🔥</Text>
                        <Text fontSize="sm" fontWeight="700" color="orange.500">{streakInfo?.currentStreak ?? "–"}</Text>
                        <Text fontSize="xs" style={{ color: C.textMuted }}>ngày liên tiếp</Text>
                    </Flex>
                    <Flex align="center" gap={1.5} px={3} py={1.5} borderRadius="full"
                        style={{ backgroundColor: C.badgeBg, border: `1px solid ${C.badgeBorder}` }}
                    >
                        <Text fontSize="sm">🏆</Text>
                        <Text fontSize="sm" fontWeight="700" color="purple.500">{streakInfo?.longestStreak ?? "–"}</Text>
                        <Text fontSize="xs" style={{ color: C.textMuted }}>kỷ lục</Text>
                    </Flex>
                    {streakInfo?.totalStudyDays > 0 && (
                        <Flex align="center" gap={1.5} px={3} py={1.5} borderRadius="full"
                            style={{ backgroundColor: C.badgeBg, border: `1px solid ${C.badgeBorder}` }}
                        >
                            <Text fontSize="sm">📚</Text>
                            <Text fontSize="sm" fontWeight="700" color="green.500">{streakInfo.totalStudyDays}</Text>
                            <Text fontSize="xs" style={{ color: C.textMuted }}>ngày đã học</Text>
                        </Flex>
                    )}
                </Flex>
            </Flex>

            {/* Grid */}
            <Box px={6} pb={5}>
                {/* Cells */}
                <Box display="flex" gap={`${CELL_GAP}px`}>
                    {grid.map((week, wi) => (
                        <Box key={wi} display="flex" flexDirection="column" gap={`${CELL_GAP}px`}>
                            {week.map((dateStr, di) => {
                                const level = getLevel(dataMap[dateStr] || 0);
                                const isToday = dateStr === todayStr;
                                const isFuture = dateStr > todayStr;
                                return (
                                    <Box
                                        key={di}
                                        w={`${cellSize}px`}
                                        h={`${cellSize}px`}
                                        borderRadius="2px"
                                        flexShrink={0}
                                        style={{
                                            backgroundColor: isFuture ? "transparent" : C.cells[level],
                                            outline: isToday ? `2px solid ${C.today}` : "none",
                                            outlineOffset: "1px",
                                            cursor: isFuture ? "default" : "pointer",
                                            transition: "transform 0.1s, filter 0.1s",
                                        }}
                                        onMouseEnter={isFuture ? undefined : (e) => handleMouseEnter(e, dateStr)}
                                        onMouseLeave={isFuture ? undefined : () => setTooltip(null)}
                                        _hover={isFuture ? {} : { filter: "brightness(1.4)", transform: "scale(1.3)" }}
                                    />
                                );
                            })}
                        </Box>
                    ))}
                </Box>

                {/* Month labels */}
                <Box position="relative" h="18px" mt={1}>
                    {monthLabels.map(({ month, wi }, i) => (
                        <Box
                            key={i}
                            position="absolute"
                            left={`${wi * STEP}px`}
                            fontSize="11px"
                            fontWeight="500"
                            whiteSpace="nowrap"
                            style={{ color: C.textMuted }}
                        >
                            {MONTH_NAMES[month]}
                        </Box>
                    ))}
                </Box>

                {/* Legend */}
                <Flex justify="flex-end" align="center" gap={1.5} mt={2}>
                    <Text fontSize="10px" style={{ color: C.textMuted }}>Ít</Text>
                    {C.cells.map((color, i) => (
                        <Box key={i} w="12px" h="12px" borderRadius="2px" style={{ backgroundColor: color }} />
                    ))}
                    <Text fontSize="10px" style={{ color: C.textMuted }}>Nhiều</Text>
                </Flex>
            </Box>

            {/* Tooltip */}
            {tooltip && (
                <Box
                    position="fixed"
                    left={`${tooltip.x}px`}
                    top={`${tooltip.y}px`}
                    transform="translate(-50%, -100%)"
                    color="white"
                    fontSize="xs"
                    px={3} py={1.5}
                    borderRadius="md"
                    pointerEvents="none"
                    zIndex={9999}
                    whiteSpace="nowrap"
                    boxShadow="0 4px 12px rgba(0,0,0,0.5)"
                    style={{ backgroundColor: C.tooltipBg, border: `1px solid ${C.tooltipBorder}` }}
                >
                    {tooltip.content}
                </Box>
            )}
        </Box>
    );
};

export default StudyStreakHeatmap;