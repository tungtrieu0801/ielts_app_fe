import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Box, Flex, Text, VStack, Button, Icon, Grid, Input, Badge,
    Textarea, Spinner, HStack, Separator,
} from '@chakra-ui/react';
import {
    FiLayers, FiUpload, FiPlay, FiList, FiCheck, FiX, FiChevronLeft,
    FiChevronRight, FiEdit3, FiTrash2, FiEye, FiEyeOff, FiRefreshCw,
    FiInfo, FiArrowRight, FiSearch, FiZap, FiBookOpen, FiTarget,
} from 'react-icons/fi';
import BaseLayout from '../../../layouts/BaseLayout.jsx';
import * as synonymApi from '../../../services/synonymApi.js';

/* ─── Design Tokens ──────────────────────────────────────────────────────── */
const T = {
    primary: '#6366f1',
    primaryDark: '#4f46e5',
    primaryLight: 'rgba(99,102,241,0.10)',
    primaryBorder: 'rgba(99,102,241,0.22)',
    accent: '#8b5cf6',
    success: '#10b981',
    danger: '#ef4444',
    warning: '#f59e0b',
    info: '#0ea5e9',
    surface: 'bg.panel',
    muted: 'fg.muted',
    border: 'border.muted',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
    gradientSoft: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08))',
};

const MASTERY = [
    { label: 'Chưa học', color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', dot: '#cbd5e1' },
    { label: 'Đang học', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', dot: '#fbbf24' },
    { label: 'Quen thuộc', color: '#0ea5e9', bg: 'rgba(14,165,233,0.12)', dot: '#38bdf8' },
    { label: 'Thành thạo', color: '#10b981', bg: 'rgba(16,185,129,0.12)', dot: '#34d399' },
];

/* ─── Global CSS ─────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
@keyframes synFadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
}
@keyframes synPop {
    0%  { transform: scale(0.85); opacity: 0; }
    70% { transform: scale(1.03); }
    100%{ transform: scale(1); opacity: 1; }
}
@keyframes synShake {
    0%,100%{ transform: translateX(0); }
    25%    { transform: translateX(-6px); }
    75%    { transform: translateX(6px); }
}
@keyframes synFloat {
    0%,100% { transform: translateY(0px); }
    50%     { transform: translateY(-4px); }
}
@keyframes synPulseDot {
    0%,100% { opacity: 1; transform: scale(1); }
    50%     { opacity: .6; transform: scale(1.3); }
}
@keyframes synShimmer {
    0%   { background-position: -200% 0; }
    100% { background-position: 200% 0; }
}

.syn-fade  { animation: synFadeUp .42s cubic-bezier(.34,1.56,.64,1) both; }
.syn-pop   { animation: synPop .38s cubic-bezier(.34,1.56,.64,1) both; }
.syn-shake { animation: synShake .4s ease; }

.syn-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
.syn-scroll::-webkit-scrollbar-track { background: transparent; }
.syn-scroll::-webkit-scrollbar-thumb { background: rgba(99,102,241,.25); border-radius: 99px; }
.syn-scroll::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,.45); }

.syn-shimmer {
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
    background-size: 200% 100%;
    animation: synShimmer 2.5s infinite;
}
`;

/* ═══════════════════════════════════════════════════════════════════════════
   ROOT PAGE
═══════════════════════════════════════════════════════════════════════════ */
export default function SynonymPage() {
    const [tab, setTab] = useState('learn');
    const [showAll, setShowAll] = useState(false);

    const TABS = [
        { id: 'learn', icon: FiPlay, label: 'Luyện tập', sub: 'Điền từ vào chỗ trống' },
        { id: 'manage', icon: FiList, label: 'Quản lý', sub: 'Xem & chỉnh sửa từ' },
        { id: 'import', icon: FiUpload, label: 'Import Excel', sub: 'Tải lên dữ liệu' },
    ];

    return (
        <BaseLayout>
            <style>{GLOBAL_CSS}</style>

            {/* Ambient gradient background */}
            <Box
                position="fixed" top="-20%" left="-10%" w="600px" h="600px"
                borderRadius="full" zIndex={0} pointerEvents="none"
                bg="radial-gradient(circle, rgba(99,102,241,0.10), transparent 70%)"
                filter="blur(40px)"
            />
            <Box
                position="fixed" bottom="-20%" right="-10%" w="500px" h="500px"
                borderRadius="full" zIndex={0} pointerEvents="none"
                bg="radial-gradient(circle, rgba(168,85,247,0.08), transparent 70%)"
                filter="blur(40px)"
            />

            <Box maxW="1120px" mx="auto" w="full" pb={16} position="relative" zIndex={1}>

                {/* ══ Hero Header ══ */}
                <Box
                    mb={8} p={{ base: 5, md: 7 }} borderRadius="28px"
                    position="relative" overflow="hidden"
                    bg="bg.panel"
                    border="1px solid" borderColor="border.muted"
                    shadow="0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(99,102,241,0.06)"
                >
                    {/* gradient accent top */}
                    <Box position="absolute" top={0} left={0} right={0} h="3px" bg={T.gradient} />

                    <Flex align="center" justify="space-between" wrap="wrap" gap={4}>
                        <Flex align="center" gap={4}>
                            {/* Logo */}
                            <Box
                                w="58px" h="58px" borderRadius="18px" flexShrink={0}
                                bg={T.gradient}
                                display="flex" alignItems="center" justifyContent="center"
                                shadow="0 12px 28px rgba(99,102,241,.35)"
                                position="relative"
                                _before={{
                                    content: '""', position: 'absolute', inset: '-3px',
                                    borderRadius: '21px', bg: T.gradient, opacity: 0.25, filter: 'blur(8px)',
                                    zIndex: -1,
                                }}
                            >
                                <FiLayers size={26} color="white" strokeWidth={2.4} />
                            </Box>

                            <Box>
                                <HStack gap={2} mb={1}>
                                    <Text
                                        fontSize="2xl" fontWeight="800" color="fg"
                                        letterSpacing="-0.6px" lineHeight={1.1}
                                    >
                                        Từ đồng nghĩa
                                    </Text>
                                    <Badge
                                        px={2} py="2px" borderRadius="full" fontSize="9px"
                                        fontWeight="800" color="white" letterSpacing="wider"
                                        bgGradient="linear(to-r, #f472b6, #ec4899)"
                                        shadow="0 2px 8px rgba(236,72,153,.35)"
                                    >
                                        NEW
                                    </Badge>
                                </HStack>
                                <Text fontSize="sm" color="fg.muted" fontWeight={500}>
                                    Luyện phân biệt từ đồng nghĩa IELTS qua ngữ cảnh thực tế
                                </Text>
                            </Box>
                        </Flex>

                        {/* Scope toggle */}
                        <Flex
                            align="center" gap={3} px={4} py={2.5} borderRadius="14px"
                            border="1.5px solid" cursor="pointer" userSelect="none"
                            borderColor={showAll ? T.primary : 'border.muted'}
                            bg={showAll ? T.primaryLight : 'bg.panel'}
                            onClick={() => setShowAll(v => !v)}
                            transition="all .22s"
                            _hover={{ borderColor: T.primary, transform: 'translateY(-1px)' }}
                        >
                            <Box
                                w="34px" h="20px" borderRadius="full" p="2px" position="relative"
                                bg={showAll ? T.primary : '#cbd5e1'}
                                transition="background .25s"
                            >
                                <Box
                                    position="absolute" top="2px"
                                    left={showAll ? '16px' : '2px'}
                                    w="16px" h="16px" borderRadius="full" bg="white"
                                    shadow="0 1px 3px rgba(0,0,0,.15)" transition="left .25s"
                                />
                            </Box>
                            <Icon
                                as={showAll ? FiEye : FiEyeOff}
                                boxSize={4}
                                color={showAll ? T.primary : 'fg.muted'}
                            />
                            <Text fontSize="sm" fontWeight="700" color={showAll ? T.primary : 'fg'}>
                                {showAll ? 'Tất cả' : 'Của tôi'}
                            </Text>
                        </Flex>
                    </Flex>
                </Box>

                {/* ══ Tabs ══ */}
                <Flex
                    gap={2} mb={7} p={1.5} borderRadius="18px"
                    bg="bg.panel" border="1px solid" borderColor="border.muted"
                    overflowX="auto" className="syn-scroll"
                    boxShadow="0 1px 3px rgba(0,0,0,0.03)"
                >
                    {TABS.map(t => {
                        const active = tab === t.id;
                        return (
                            <Flex
                                key={t.id} align="center" gap={3} flex="1" minW="fit-content"
                                px={4} py={2.5} borderRadius="13px"
                                bg={active ? T.primary : 'transparent'}
                                color={active ? 'white' : 'fg'}
                                cursor="pointer" onClick={() => setTab(t.id)}
                                transition="all .22s cubic-bezier(.4,0,.2,1)"
                                shadow={active ? '0 4px 14px rgba(99,102,241,.35)' : 'none'}
                                _hover={!active ? { bg: 'bg.subtle' } : {}}
                            >
                                <Box
                                    w="32px" h="32px" borderRadius="10px" flexShrink={0}
                                    bg={active ? 'rgba(255,255,255,0.2)' : T.primaryLight}
                                    display="flex" alignItems="center" justifyContent="center"
                                >
                                    <Icon as={t.icon} boxSize={4} color={active ? 'white' : T.primary} />
                                </Box>
                                <Box>
                                    <Text fontSize="sm" fontWeight="700" lineHeight="1.15">
                                        {t.label}
                                    </Text>
                                    <Text
                                        fontSize="10.5px" fontWeight={500} lineHeight="1.3"
                                        opacity={active ? .85 : .55}
                                    >
                                        {t.sub}
                                    </Text>
                                </Box>
                            </Flex>
                        );
                    })}
                </Flex>

                {/* ══ Content ══ */}
                {tab === 'learn' && <LearnTab showAll={showAll} />}
                {tab === 'manage' && <ManageTab />}
                {tab === 'import' && <ImportTab />}
            </Box>
        </BaseLayout>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   LEARN TAB
═══════════════════════════════════════════════════════════════════════════ */
function LearnTab({ showAll }) {
    const [phase, setPhase] = useState('select');
    const [loading, setLoading] = useState(false);
    const [clusters, setClusters] = useState(null);
    const [cPage, setCPage] = useState(1);
    const [cSearch, setCSearch] = useState('');
    const [quizData, setQuizData] = useState(null);
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [expanded, setExpanded] = useState(null);
    const [stats, setStats] = useState({ correct: 0, wrong: 0 });

    const loadClusters = useCallback(async () => {
        setLoading(true);
        try {
            const d = await synonymApi.getClusters({ showAll, page: cPage, limit: 9, search: cSearch });
            setClusters(d);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [showAll, cPage, cSearch]);

    useEffect(() => { if (phase === 'select') loadClusters(); }, [phase, loadClusters]);

    const startSmartQuiz = async () => {
        setLoading(true);
        try {
            const d = await synonymApi.getNextCluster(showAll);
            initQuiz(d);
        } catch (e) {
            alert(e.response?.data?.message || 'Chưa có dữ liệu. Hãy import từ trước!');
        } finally { setLoading(false); }
    };

    const startClusterQuiz = async (name) => {
        setLoading(true);
        try {
            const d = await synonymApi.getClusterForStudy(name, showAll);
            initQuiz(d);
        } catch (e) {
            alert(e.response?.data?.message || 'Lỗi khi tải cluster.');
        } finally { setLoading(false); }
    };

    const initQuiz = (d) => {
        setQuizData(d);
        setAnswers({});
        setSubmitted(false);
        setExpanded(null);
        setPhase('quiz');
    };

    const handleSubmit = async () => {
        let correct = 0, wrong = 0;
        quizData.questions.forEach(q => {
            const ua = (answers[q._id] || '').trim().toLowerCase();
            if (ua === q.word.toLowerCase()) correct++; else wrong++;
        });
        setStats({ correct, wrong });
        setSubmitted(true);
        try {
            await synonymApi.saveProgress({
                cluster: quizData.cluster, correctCount: correct, wrongCount: wrong,
            });
        } catch (e) { console.error(e); }
    };

    const backToSelect = () => { setPhase('select'); setQuizData(null); setSubmitted(false); };

    /* ─── SELECT phase ─── */
    if (phase === 'select') {
        return (
            <Box>
                {/* Smart banner */}
                <Box
                    mb={6} p={{ base: 5, md: 6 }} borderRadius="24px" cursor="pointer"
                    position="relative" overflow="hidden"
                    onClick={loading ? undefined : startSmartQuiz}
                    transition="all .3s cubic-bezier(.4,0,.2,1)"
                    bg={T.gradient}
                    shadow="0 12px 32px rgba(99,102,241,.32)"
                    _hover={{ transform: 'translateY(-3px)', shadow: '0 20px 44px rgba(99,102,241,.42)' }}
                >
                    {/* decorative blobs */}
                    <Box pos="absolute" top="-60px" right="-40px" w="220px" h="220px"
                        borderRadius="full" bg="rgba(255,255,255,.08)" />
                    <Box pos="absolute" bottom="-50px" left="20%" w="140px" h="140px"
                        borderRadius="full" bg="rgba(255,255,255,.06)" />

                    <Flex align="center" justify="space-between" position="relative" zIndex={1} gap={4}>
                        <Flex align="center" gap={4}>
                            <Flex
                                w="56px" h="56px" borderRadius="16px" flexShrink={0}
                                bg="rgba(255,255,255,.18)" border="1px solid rgba(255,255,255,.28)"
                                align="center" justify="center"
                                backdropFilter="blur(8px)"
                                style={{ animation: 'synFloat 3s ease-in-out infinite' }}
                            >
                                {loading
                                    ? <Spinner size="sm" color="white" />
                                    : <FiZap size={26} color="white" strokeWidth={2.4} />}
                            </Flex>
                            <Box>
                                <Text fontSize="lg" fontWeight="800" color="white" mb="3px" letterSpacing="-0.3px">
                                    🧠 Học thông minh
                                </Text>
                                <Text fontSize="sm" color="rgba(255,255,255,.85)" fontWeight={500}>
                                    Tự động chọn cluster mới hoặc sai nhiều nhất để ôn
                                </Text>
                            </Box>
                        </Flex>
                        <Flex
                            w="42px" h="42px" borderRadius="full" flexShrink={0}
                            bg="rgba(255,255,255,.2)" border="1px solid rgba(255,255,255,.3)"
                            align="center" justify="center"
                            transition="transform .2s"
                            _groupHover={{ transform: 'translateX(3px)' }}
                        >
                            <FiArrowRight size={20} color="white" />
                        </Flex>
                    </Flex>
                </Box>

                {/* Search */}
                <Flex
                    mb={6} align="center" bg="bg.panel" borderRadius="14px" px={4}
                    border="1.5px solid" borderColor="border.muted"
                    _focusWithin={{ borderColor: T.primary, shadow: `0 0 0 3px ${T.primaryLight}` }}
                    transition="all .2s"
                >
                    <FiSearch size={17} color="#94a3b8" />
                    <Input
                        variant="unstyled" ml={3} py={3.5} fontSize="sm" fontWeight="600"
                        placeholder="Tìm cluster..." value={cSearch}
                        onChange={e => { setCSearch(e.target.value); setCPage(1); }}
                    />
                </Flex>

                {/* Cluster grid */}
                {loading ? (
                    <Flex justify="center" py={20}><Spinner size="xl" color="purple.500" thickness="3px" /></Flex>
                ) : clusters?.clusters?.length > 0 ? (
                    <>
                        <Grid
                            templateColumns={{ base: '1fr', md: 'repeat(2,1fr)', lg: 'repeat(3,1fr)' }}
                            gap={4}
                        >
                            {clusters.clusters.map((c, i) => {
                                const p = c.progress;
                                const m = MASTERY[p?.mastery || 0];
                                const acc = p && (p.correctCount + p.wrongCount) > 0
                                    ? Math.round(p.correctCount / (p.correctCount + p.wrongCount) * 100) : null;
                                return (
                                    <Box
                                        key={c.cluster} bg="bg.panel" borderRadius="20px"
                                        border="1px solid" borderColor="border.muted"
                                        overflow="hidden" cursor="pointer"
                                        className="syn-fade"
                                        style={{ animationDelay: `${i * .05}s` }}
                                        transition="all .25s cubic-bezier(.4,0,.2,1)"
                                        onClick={() => startClusterQuiz(c.cluster)}
                                        position="relative"
                                        _hover={{
                                            borderColor: T.primaryBorder,
                                            transform: 'translateY(-4px)',
                                            shadow: '0 14px 34px rgba(99,102,241,.16)',
                                        }}
                                    >
                                        {/* top accent */}
                                        <Box h="4px" bg={m.color} />

                                        <Box p={5}>
                                            <Flex align="start" justify="space-between" mb={3} gap={2}>
                                                <Text
                                                    fontSize="md" fontWeight="800" color="fg"
                                                    lineHeight="1.35" flex={1}
                                                >
                                                    {c.cluster}
                                                </Text>
                                                <Badge
                                                    px={2.5} py="3px" borderRadius="md" fontSize="10px"
                                                    fontWeight="800" bg={m.bg} color={m.color}
                                                    flexShrink={0}
                                                >
                                                    <Flex align="center" gap={1.5}>
                                                        <Box w="6px" h="6px" borderRadius="full" bg={m.dot} />
                                                        {m.label}
                                                    </Flex>
                                                </Badge>
                                            </Flex>

                                            <Flex gap={1.5} mb={4} wrap="wrap">
                                                <Badge
                                                    px={2} py="2px" borderRadius="md" fontSize="10px"
                                                    fontWeight="800" bg={T.primaryLight} color={T.primary}
                                                >
                                                    {c.wordCount} từ
                                                </Badge>
                                                {c.bandLevels.slice(0, 3).map(b => (
                                                    <Badge key={b}
                                                        px={2} py="2px" borderRadius="md"
                                                        fontSize="10px" fontWeight="800"
                                                        bg="rgba(14,165,233,.1)" color={T.info}
                                                    >{b}</Badge>
                                                ))}
                                            </Flex>

                                            {p ? (
                                                <Box>
                                                    <Box h="5px" bg="bg.subtle" borderRadius="full" mb={2.5} overflow="hidden">
                                                        <Box
                                                            h="full" borderRadius="full" bg={m.color}
                                                            w={`${(p.mastery / 3) * 100}%`}
                                                            transition="width .6s cubic-bezier(.4,0,.2,1)"
                                                        />
                                                    </Box>
                                                    <HStack gap={4} fontSize="11px" fontWeight="700">
                                                        <Text color={T.success}>✓ {p.correctCount}</Text>
                                                        <Text color={T.danger}>✗ {p.wrongCount}</Text>
                                                        {acc !== null && <Text color={T.primary}>{acc}%</Text>}
                                                    </HStack>
                                                </Box>
                                            ) : (
                                                <Text fontSize="11px" color="fg.muted" fontWeight="600">
                                                    Chưa học lần nào
                                                </Text>
                                            )}
                                        </Box>
                                    </Box>
                                );
                            })}
                        </Grid>

                        {/* Pagination */}
                        {clusters.totalPages > 1 && (
                            <Flex justify="center" gap={1.5} mt={7} align="center">
                                <PagBtn disabled={cPage <= 1} onClick={() => setCPage(p => p - 1)}>
                                    <FiChevronLeft />
                                </PagBtn>
                                {Array.from({ length: clusters.totalPages }, (_, i) => i + 1)
                                    .filter(pg => Math.abs(pg - cPage) < 3 || pg === 1 || pg === clusters.totalPages)
                                    .map((pg, i, arr) => (
                                        <React.Fragment key={pg}>
                                            {i > 0 && arr[i - 1] !== pg - 1 && (
                                                <Text color="fg.muted" px={1} fontSize="sm">…</Text>
                                            )}
                                            <PagBtn active={pg === cPage} onClick={() => setCPage(pg)}>
                                                {pg}
                                            </PagBtn>
                                        </React.Fragment>
                                    ))
                                }
                                <PagBtn disabled={cPage >= clusters.totalPages} onClick={() => setCPage(p => p + 1)}>
                                    <FiChevronRight />
                                </PagBtn>
                            </Flex>
                        )}
                    </>
                ) : (
                    <EmptyState
                        icon="📭"
                        title="Chưa có cluster nào"
                        desc={<>Hãy chuyển sang tab <b>Import Excel</b> để thêm từ mới!</>}
                    />
                )}
            </Box>
        );
    }

    /* ─── QUIZ phase ─── */
    const total = quizData?.questions.length || 0;
    const answered = Object.values(answers).filter(v => v?.trim()).length;
    const pct = total > 0 ? Math.round(answered / total * 100) : 0;
    const accuracy = total > 0 ? Math.round(stats.correct / total * 100) : 0;

    return (
        <Box>
            {/* Quiz header card */}
            <Box
                mb={5} p={5} borderRadius="20px"
                bg="bg.panel" border="1px solid" borderColor="border.muted"
                shadow="0 1px 3px rgba(0,0,0,0.03)"
            >
                <Flex align="center" justify="space-between" wrap="wrap" gap={4} mb={4}>
                    <Flex align="center" gap={3}>
                        <Button
                            size="sm" variant="ghost" borderRadius="10px" gap={1}
                            onClick={backToSelect}
                            _hover={{ bg: T.primaryLight, color: T.primary }}
                        >
                            <FiChevronLeft size={16} /> Quay lại
                        </Button>
                        <Box>
                            <Text fontSize="lg" fontWeight="800" color="fg" letterSpacing="-0.3px">
                                📦 {quizData?.cluster}
                            </Text>
                            <Text fontSize="xs" color="fg.muted" fontWeight="500">
                                {total} câu · Điền từ đúng vào ô trống
                            </Text>
                        </Box>
                    </Flex>

                    {/* Word bank */}
                    <Flex gap={1.5} wrap="wrap" maxW="440px">
                        {quizData?.allWords.map(w => (
                            <Box
                                key={w} px={2.5} py={1} borderRadius="full" fontSize="12px"
                                fontWeight="700" bg={T.primaryLight} color={T.primary}
                                border={`1px solid ${T.primaryBorder}`}
                            >
                                {w}
                            </Box>
                        ))}
                    </Flex>
                </Flex>

                {/* Progress bar (before submit) */}
                {!submitted && (
                    <Box>
                        <Flex justify="space-between" mb={1.5}>
                            <Text fontSize="xs" color="fg.muted" fontWeight="600">
                                Đã điền: {answered}/{total}
                            </Text>
                            <Text fontSize="xs" fontWeight="800" color={T.primary}>{pct}%</Text>
                        </Flex>
                        <Box h="7px" bg="bg.subtle" borderRadius="full" overflow="hidden">
                            <Box
                                h="full" borderRadius="full" transition="width .35s cubic-bezier(.4,0,.2,1)"
                                bg={T.gradient}
                                w={`${pct}%`}
                            />
                        </Box>
                    </Box>
                )}
            </Box>

            {/* Questions */}
            <VStack align="stretch" gap={3.5}>
                {quizData?.questions.map((q, idx) => {
                    const ua = (answers[q._id] || '').trim();
                    const isCorrect = submitted ? ua.toLowerCase() === q.word.toLowerCase() : null;
                    const isOpen = expanded === idx;
                    return (
                        <QuizCard
                            key={q._id}
                            q={q} idx={idx}
                            submitted={submitted}
                            isCorrect={isCorrect}
                            userAnswer={answers[q._id] || ''}
                            isOpen={isOpen}
                            onAnswer={val => setAnswers(prev => ({ ...prev, [q._id]: val }))}
                            onToggle={() => setExpanded(isOpen ? null : idx)}
                        />
                    );
                })}
            </VStack>

            {/* Bottom action */}
            <Flex justify="center" mt={8} gap={3} wrap="wrap">
                {!submitted ? (
                    <Button
                        size="lg" px={12} borderRadius="14px" fontWeight="800" fontSize="md"
                        bg={T.gradient} color="white"
                        shadow="0 8px 22px rgba(99,102,241,.4)"
                        _hover={{ transform: 'translateY(-2px)', shadow: '0 14px 32px rgba(99,102,241,.5)' }}
                        transition="all .22s"
                        onClick={handleSubmit}
                        disabled={answered === 0}
                    >
                        <FiCheck />&nbsp; Kiểm tra kết quả ({answered}/{total})
                    </Button>
                ) : (
                    <Box w="full" maxW="580px" mx="auto">
                        <Box
                            p={7} borderRadius="24px" mb={5} textAlign="center"
                            bg="bg.panel" border="1px solid" borderColor="border.muted"
                            className="syn-pop"
                            position="relative" overflow="hidden"
                        >
                            <Box position="absolute" top={0} left={0} right={0} h="4px" bg={
                                accuracy >= 80 ? 'linear-gradient(90deg,#10b981,#34d399)'
                                    : accuracy >= 50 ? 'linear-gradient(90deg,#f59e0b,#fbbf24)'
                                        : 'linear-gradient(90deg,#ef4444,#f87171)'
                            } />
                            <Text fontSize="4xl" mb={2}>
                                {accuracy >= 90 ? '🏆' : accuracy >= 60 ? '👍' : '💪'}
                            </Text>
                            <Text fontSize="11px" fontWeight="800" color="fg.muted" mb={5}
                                textTransform="uppercase" letterSpacing="wider">
                                Kết quả
                            </Text>
                            <HStack justify="center" gap={{ base: 8, md: 12 }} mb={5}>
                                {[
                                    { val: stats.correct, label: 'Đúng', color: T.success },
                                    { val: stats.wrong, label: 'Sai', color: T.danger },
                                    { val: `${accuracy}%`, label: 'Chính xác', color: T.primary },
                                ].map(({ val, label, color }) => (
                                    <Box key={label}>
                                        <Text fontSize="3xl" fontWeight="900" color={color} lineHeight={1.1}>
                                            {val}
                                        </Text>
                                        <Text fontSize="xs" fontWeight="700" color={color} mt={1}>{label}</Text>
                                    </Box>
                                ))}
                            </HStack>
                            <Box h="8px" bg="bg.subtle" borderRadius="full" overflow="hidden">
                                <Box
                                    h="full" borderRadius="full" w={`${accuracy}%`}
                                    bg={accuracy >= 80
                                        ? 'linear-gradient(90deg,#10b981,#34d399)'
                                        : accuracy >= 50
                                            ? 'linear-gradient(90deg,#f59e0b,#fbbf24)'
                                            : 'linear-gradient(90deg,#ef4444,#f87171)'}
                                    transition="width .8s cubic-bezier(.4,0,.2,1)"
                                />
                            </Box>
                        </Box>
                        <Flex justify="center" gap={2.5}>
                            <Button
                                borderRadius="12px" fontWeight="800" px={6}
                                bg={T.gradient} color="white"
                                shadow="0 6px 16px rgba(99,102,241,.4)"
                                _hover={{ transform: 'translateY(-2px)', shadow: '0 10px 24px rgba(99,102,241,.5)' }}
                                transition="all .2s"
                                onClick={startSmartQuiz}
                            >
                                <FiRefreshCw />&nbsp; Cluster tiếp theo
                            </Button>
                            <Button borderRadius="12px" fontWeight="700" variant="ghost" onClick={backToSelect}>
                                Chọn cluster khác
                            </Button>
                        </Flex>
                    </Box>
                )}
            </Flex>
        </Box>
    );
}

/* ─── Quiz Card ──────────────────────────────────────────────────────────── */
function QuizCard({ q, idx, submitted, isCorrect, userAnswer, isOpen, onAnswer, onToggle }) {
    const parts = (q.blankedSentence || '').split('________');
    const before = parts[0] || '';
    const after = parts.slice(1).join('________') || '';

    const cardBg = submitted
        ? (isCorrect ? 'rgba(16,185,129,.04)' : 'rgba(239,68,68,.04)')
        : 'bg.panel';

    const accent = submitted
        ? (isCorrect ? T.success : T.danger)
        : T.primary;

    return (
        <Box
            bg={cardBg}
            borderRadius="20px"
            border="1px solid"
            borderColor={submitted ? (isCorrect ? 'rgba(16,185,129,.3)' : 'rgba(239,68,68,.3)') : 'border.muted'}
            overflow="hidden"
            transition="border-color .3s, background .3s"
            className={!submitted ? 'syn-fade' : isCorrect ? 'syn-pop' : 'syn-shake'}
            style={{ animationDelay: `${idx * .06}s` }}
        >
            {/* Accent bar */}
            <Box h="3px" bg={accent} transition="background .35s" />

            <Box p={{ base: 4, md: 6 }}>
                <Flex gap={{ base: 3, md: 4 }} align="start">
                    {/* Number / status badge */}
                    <Flex
                        w="38px" h="38px" borderRadius="12px" flexShrink={0}
                        align="center" justify="center" fontWeight="800" fontSize="sm"
                        bg={submitted
                            ? (isCorrect ? 'rgba(16,185,129,.14)' : 'rgba(239,68,68,.14)')
                            : T.primaryLight}
                        color={accent}
                        transition="all .35s"
                    >
                        {submitted
                            ? (isCorrect ? <FiCheck size={18} /> : <FiX size={18} />)
                            : idx + 1}
                    </Flex>

                    <Box flex={1} minW={0}>
                        {/* Badges */}
                        <Flex gap={1.5} mb={3} wrap="wrap">
                            {q.bandLevel && (
                                <Badge
                                    px={2} py="2px" borderRadius="md" fontSize="10px"
                                    fontWeight="800" bg="rgba(14,165,233,.1)" color={T.info}
                                >
                                    {q.bandLevel}
                                </Badge>
                            )}
                            {q.partOfSpeech && (
                                <Badge
                                    px={2} py="2px" borderRadius="md" fontSize="10px"
                                    fontWeight="800" bg="rgba(245,158,11,.1)" color="#d97706"
                                >
                                    {q.partOfSpeech}
                                </Badge>
                            )}
                        </Flex>

                        {/* English sentence */}
                        <Box
                            fontSize={{ base: 'md', md: 'lg' }}
                            fontWeight={500} color="fg" lineHeight={2.1}
                            mb={submitted ? 3 : 0}
                        >
                            <Text as="span">{before}</Text>

                            {submitted ? (
                                <Text
                                    as="span" display="inline-block"
                                    px={3} py={0.5} mx={1.5}
                                    borderRadius="9px"
                                    fontWeight="800" fontSize="inherit"
                                    verticalAlign="middle"
                                    bg={isCorrect ? 'rgba(16,185,129,.14)' : 'rgba(239,68,68,.14)'}
                                    color={isCorrect ? T.success : T.danger}
                                    border="1.5px solid"
                                    borderColor={isCorrect ? T.success : T.danger}
                                    textDecoration={isCorrect ? 'none' : 'line-through'}
                                    style={{ animation: 'synPop .4s cubic-bezier(.34,1.56,.64,1)' }}
                                >
                                    {userAnswer || '…'}
                                </Text>
                            ) : (
                                <Box as="span" display="inline-block" verticalAlign="middle" mx={1.5}>
                                    <Input
                                        display="inline-block"
                                        w={{ base: '140px', md: '190px' }}
                                        px={3} h="38px"
                                        fontSize="md" fontWeight="700"
                                        borderRadius="10px"
                                        border="1.5px dashed" borderColor={T.primary}
                                        bg={T.primaryLight}
                                        color={T.primary}
                                        placeholder="Điền từ…"
                                        _placeholder={{ color: 'rgba(99,102,241,.4)', fontWeight: 600 }}
                                        _focus={{
                                            borderStyle: 'solid', bg: T.primaryLight,
                                            outline: 'none',
                                            boxShadow: `0 0 0 3px rgba(99,102,241,.18)`,
                                        }}
                                        value={userAnswer}
                                        onChange={e => onAnswer(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }}
                                        autoComplete="off"
                                        spellCheck={false}
                                    />
                                </Box>
                            )}

                            <Text as="span">{after}</Text>
                        </Box>

                        {/* Wrong → correct answer */}
                        {submitted && !isCorrect && (
                            <Flex align="center" gap={2} mb={3} className="syn-pop">
                                <Box
                                    display="inline-flex" align="center" gap={1.5}
                                    px={3} py={1.5} borderRadius="9px"
                                    bg="rgba(16,185,129,.1)" border="1px solid rgba(16,185,129,.3)"
                                    fontSize="sm" fontWeight="700" color={T.success}
                                >
                                    <FiCheck size={13} /> Đáp án: <strong>{q.word}</strong>
                                </Box>
                            </Flex>
                        )}

                        {/* Expand explanation */}
                        {submitted && (
                            <Box>
                                <Button
                                    size="xs" variant="ghost" borderRadius="9px"
                                    color={T.primary} fontWeight="700" gap={1.5}
                                    onClick={onToggle}
                                    _hover={{ bg: T.primaryLight }}
                                >
                                    <FiBookOpen size={13} />
                                    {isOpen ? 'Ẩn nghĩa & giải thích' : 'Xem nghĩa & giải thích'}
                                </Button>

                                {isOpen && (
                                    <Box
                                        mt={3} borderRadius="14px" overflow="hidden"
                                        border="1px solid" borderColor="border.muted"
                                        className="syn-fade"
                                    >
                                        {q.exampleTranslation && (
                                            <Box
                                                p={4} bg="rgba(245,158,11,.05)"
                                                borderBottom="1px solid" borderColor="border.muted"
                                            >
                                                <Text fontSize="10px" fontWeight="800" color="#d97706"
                                                    textTransform="uppercase" letterSpacing="wider" mb={1.5}>
                                                    🇻🇳 Nghĩa tiếng Việt
                                                </Text>
                                                <Text fontSize="sm" color="fg" lineHeight="1.8">
                                                    {q.exampleTranslation}
                                                </Text>
                                            </Box>
                                        )}

                                        {q.explanation && (
                                            <Box
                                                p={4} bg="rgba(99,102,241,.04)"
                                                borderBottom={q.originalSentence ? '1px solid' : 'none'}
                                                borderColor="border.muted"
                                            >
                                                <Text fontSize="10px" fontWeight="800" color={T.primary}
                                                    textTransform="uppercase" letterSpacing="wider" mb={1.5}>
                                                    💡 Tại sao dùng từ này?
                                                </Text>
                                                <Text fontSize="sm" color="fg" lineHeight="1.8">
                                                    {q.explanation}
                                                </Text>
                                            </Box>
                                        )}

                                        {q.originalSentence && (
                                            <Box p={4} bg="bg.subtle">
                                                <Text fontSize="10px" fontWeight="800" color={T.info}
                                                    textTransform="uppercase" letterSpacing="wider" mb={1.5}>
                                                    🔤 Câu đầy đủ
                                                </Text>
                                                <Text fontSize="sm" color="fg" fontStyle="italic" lineHeight="1.8">
                                                    "{q.originalSentence}"
                                                </Text>
                                            </Box>
                                        )}
                                    </Box>
                                )}
                            </Box>
                        )}
                    </Box>
                </Flex>
            </Box>
        </Box>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MANAGE TAB
═══════════════════════════════════════════════════════════════════════════ */
function ManageTab() {
    const [clusters, setClusters] = useState(null);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [selCluster, setSelCluster] = useState(null);
    const [words, setWords] = useState(null);
    const [wPage, setWPage] = useState(1);
    const [editId, setEditId] = useState(null);
    const [editData, setEditData] = useState({});
    const [saving, setSaving] = useState(false);

    const loadClusters = useCallback(async () => {
        setLoading(true);
        try {
            const d = await synonymApi.getClusters({ showAll: false, page, limit: 12, search });
            setClusters(d);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [page, search]);

    const loadWords = useCallback(async () => {
        if (!selCluster) return;
        setLoading(true);
        try {
            const d = await synonymApi.getWordsByCluster(selCluster, { page: wPage, limit: 12 });
            setWords(d);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [selCluster, wPage]);

    useEffect(() => { if (!selCluster) loadClusters(); }, [loadClusters, selCluster]);
    useEffect(() => { if (selCluster) loadWords(); }, [loadWords]);

    const delCluster = async (name) => {
        if (!confirm(`Xóa toàn bộ cluster "${name}"?`)) return;
        try { await synonymApi.deleteCluster(name); loadClusters(); }
        catch { alert('Lỗi khi xóa cluster.'); }
    };

    const delWord = async (id) => {
        if (!confirm('Xóa từ này?')) return;
        try { await synonymApi.deleteSynonymWord(id); loadWords(); }
        catch { alert('Lỗi khi xóa từ.'); }
    };

    const saveEdit = async (id) => {
        setSaving(true);
        try { await synonymApi.updateSynonymWord(id, editData); setEditId(null); loadWords(); }
        catch { alert('Lỗi khi cập nhật.'); }
        finally { setSaving(false); }
    };

    /* ── Word detail ── */
    if (selCluster) return (
        <Box>
            <Flex align="center" gap={3} mb={6}>
                <Button
                    size="sm" variant="ghost" borderRadius="10px" gap={1}
                    onClick={() => { setSelCluster(null); setWords(null); setWPage(1); }}
                    _hover={{ bg: T.primaryLight, color: T.primary }}
                >
                    <FiChevronLeft size={16} /> Quay lại
                </Button>
                <Box>
                    <Text fontSize="lg" fontWeight="800" color="fg" letterSpacing="-0.3px">{selCluster}</Text>
                    <Text fontSize="xs" color="fg.muted" fontWeight="500">
                        {words?.total || 0} từ · Chỉ từ của bạn
                    </Text>
                </Box>
            </Flex>

            {loading
                ? <Flex justify="center" py={16}><Spinner size="lg" color="purple.500" thickness="3px" /></Flex>
                : words?.words?.length > 0 ? (
                    <>
                        <VStack align="stretch" gap={3}>
                            {words.words.map((w, i) => {
                                const editing = editId === w._id;
                                return (
                                    <Box
                                        key={w._id} bg="bg.panel" borderRadius="18px"
                                        border="1px solid"
                                        borderColor={editing ? T.primary : 'border.muted'}
                                        overflow="hidden" transition="border-color .2s"
                                        className="syn-fade"
                                        style={{ animationDelay: `${i * .03}s` }}
                                    >
                                        <Box h="3px" bg={editing ? T.primary : 'transparent'} />
                                        <Box p={5}>
                                            {editing ? (
                                                <EditForm
                                                    data={editData}
                                                    onChange={setEditData}
                                                    onSave={() => saveEdit(w._id)}
                                                    onCancel={() => setEditId(null)}
                                                    saving={saving}
                                                />
                                            ) : (
                                                <WordRow
                                                    w={w}
                                                    onEdit={() => {
                                                        setEditId(w._id);
                                                        setEditData({
                                                            word: w.word, partOfSpeech: w.partOfSpeech,
                                                            bandLevel: w.bandLevel, cluster: w.cluster,
                                                            explanation: w.explanation,
                                                            exampleSentence: w.exampleSentence,
                                                            exampleTranslation: w.exampleTranslation,
                                                        });
                                                    }}
                                                    onDelete={() => delWord(w._id)}
                                                />
                                            )}
                                        </Box>
                                    </Box>
                                );
                            })}
                        </VStack>
                        {words.totalPages > 1 && (
                            <Flex justify="center" align="center" gap={2} mt={6}>
                                <PagBtn disabled={wPage <= 1} onClick={() => setWPage(p => p - 1)}>
                                    <FiChevronLeft />
                                </PagBtn>
                                <Text fontSize="sm" fontWeight="700" color="fg.muted" px={2}>
                                    {wPage} / {words.totalPages}
                                </Text>
                                <PagBtn disabled={wPage >= words.totalPages} onClick={() => setWPage(p => p + 1)}>
                                    <FiChevronRight />
                                </PagBtn>
                            </Flex>
                        )}
                    </>
                ) : (
                    <EmptyState icon="📭" title="Không có từ nào" desc="Cluster này không có từ nào của bạn." />
                )
            }
        </Box>
    );

    /* ── Cluster list ── */
    return (
        <Box>
            <Flex
                mb={5} align="center" bg="bg.panel" borderRadius="14px" px={4}
                border="1.5px solid" borderColor="border.muted"
                _focusWithin={{ borderColor: T.primary, shadow: `0 0 0 3px ${T.primaryLight}` }}
                transition="all .2s"
            >
                <FiSearch size={17} color="#94a3b8" />
                <Input variant="unstyled" ml={3} py={3.5} fontSize="sm" fontWeight="600"
                    placeholder="Tìm cluster..." value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </Flex>

            {loading
                ? <Flex justify="center" py={16}><Spinner size="lg" color="purple.500" thickness="3px" /></Flex>
                : clusters?.clusters?.length > 0 ? (
                    <>
                        <Grid
                            templateColumns={{ base: '1fr', md: 'repeat(2,1fr)', lg: 'repeat(3,1fr)' }}
                            gap={4}
                        >
                            {clusters.clusters.map((c, i) => (
                                <Box
                                    key={c.cluster} bg="bg.panel" borderRadius="18px"
                                    border="1px solid" borderColor="border.muted"
                                    overflow="hidden" transition="all .2s"
                                    className="syn-fade"
                                    style={{ animationDelay: `${i * .04}s` }}
                                    _hover={{ borderColor: T.primaryBorder, shadow: '0 8px 24px rgba(99,102,241,.12)' }}
                                >
                                    <Box h="3px" bg={T.gradient} />
                                    <Box p={5}>
                                        <Text fontSize="md" fontWeight="800" color="fg" mb={3} lineHeight="1.35">
                                            {c.cluster}
                                        </Text>
                                        <Flex gap={1.5} mb={4} wrap="wrap">
                                            <Badge
                                                px={2} py="2px" borderRadius="md" fontSize="10px"
                                                fontWeight="800" bg={T.primaryLight} color={T.primary}
                                            >
                                                {c.wordCount} từ
                                            </Badge>
                                            {c.bandLevels.slice(0, 3).map(b => (
                                                <Badge key={b}
                                                    px={2} py="2px" borderRadius="md"
                                                    fontSize="10px" fontWeight="800"
                                                    bg="rgba(14,165,233,.1)" color={T.info}
                                                >{b}</Badge>
                                            ))}
                                        </Flex>
                                        <Flex gap={2}>
                                            <Button
                                                flex={1} size="sm" borderRadius="10px" fontWeight="700"
                                                bg={T.primaryLight} color={T.primary}
                                                _hover={{ bg: 'rgba(99,102,241,.18)' }}
                                                onClick={() => { setSelCluster(c.cluster); setWPage(1); }}
                                            >
                                                <FiEdit3 size={13} />&nbsp; Quản lý từ
                                            </Button>
                                            {c.isOwner && (
                                                <Button
                                                    size="sm" borderRadius="10px" variant="ghost"
                                                    color="red.400" _hover={{ bg: 'rgba(239,68,68,.08)' }}
                                                    onClick={() => delCluster(c.cluster)}
                                                >
                                                    <FiTrash2 size={13} />
                                                </Button>
                                            )}
                                        </Flex>
                                    </Box>
                                </Box>
                            ))}
                        </Grid>
                        {clusters.totalPages > 1 && (
                            <Flex justify="center" align="center" gap={2} mt={6}>
                                <PagBtn disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                                    <FiChevronLeft />
                                </PagBtn>
                                <Text fontSize="sm" fontWeight="700" color="fg.muted" px={2}>
                                    {page} / {clusters.totalPages}
                                </Text>
                                <PagBtn disabled={page >= clusters.totalPages} onClick={() => setPage(p => p + 1)}>
                                    <FiChevronRight />
                                </PagBtn>
                            </Flex>
                        )}
                    </>
                ) : (
                    <EmptyState icon="📭" title="Chưa có cluster nào" desc="Import file Excel để bắt đầu!" />
                )
            }
        </Box>
    );
}

/* ─── WordRow ────────────────────────────────────────────────────────────── */
function WordRow({ w, onEdit, onDelete }) {
    return (
        <Flex justify="space-between" align="start" gap={4}>
            <Box flex={1} minW={0}>
                <Flex align="center" gap={2} mb={2} wrap="wrap">
                    <Text fontSize="lg" fontWeight="800" color="fg" letterSpacing="-0.2px">
                        {w.word}
                    </Text>
                    {w.partOfSpeech && (
                        <Badge px={2} py="1px" borderRadius="md" fontSize="10px" fontWeight="800"
                            bg="rgba(245,158,11,.1)" color="#d97706">{w.partOfSpeech}</Badge>
                    )}
                    {w.bandLevel && (
                        <Badge px={2} py="1px" borderRadius="md" fontSize="10px" fontWeight="800"
                            bg="rgba(14,165,233,.1)" color={T.info}>{w.bandLevel}</Badge>
                    )}
                </Flex>
                {w.explanation && (
                    <Text fontSize="sm" color="fg.muted" mb={1.5} lineHeight="1.65">{w.explanation}</Text>
                )}
                {w.exampleSentence && (
                    <Text fontSize="sm" color="fg" fontStyle="italic" lineHeight="1.65">
                        "{w.exampleSentence}"
                    </Text>
                )}
                {w.exampleTranslation && (
                    <Text fontSize="xs" color="fg.muted" mt={1}>→ {w.exampleTranslation}</Text>
                )}
            </Box>
            <Flex gap={1} flexShrink={0}>
                <Button size="xs" variant="ghost" borderRadius="8px" color={T.info}
                    _hover={{ bg: 'rgba(14,165,233,.1)' }} onClick={onEdit}>
                    <FiEdit3 size={13} />
                </Button>
                <Button size="xs" variant="ghost" borderRadius="8px" color={T.danger}
                    _hover={{ bg: 'rgba(239,68,68,.1)' }} onClick={onDelete}>
                    <FiTrash2 size={13} />
                </Button>
            </Flex>
        </Flex>
    );
}

/* ─── EditForm ───────────────────────────────────────────────────────────── */
function EditForm({ data, onChange, onSave, onCancel, saving }) {
    const field = (key, label, multi = false) => (
        <Box>
            <Text fontSize="10px" fontWeight="800" color="fg.muted"
                textTransform="uppercase" letterSpacing="wider" mb={1.5}>{label}</Text>
            {multi ? (
                <Textarea size="sm" borderRadius="10px" rows={2}
                    value={data[key] || ''}
                    onChange={e => onChange({ ...data, [key]: e.target.value })} />
            ) : (
                <Input size="sm" borderRadius="10px" fontWeight="600"
                    value={data[key] || ''}
                    onChange={e => onChange({ ...data, [key]: e.target.value })} />
            )}
        </Box>
    );
    return (
        <VStack align="stretch" gap={3}>
            <Grid templateColumns={{ base: '1fr', md: '1fr 1fr 1fr 1fr' }} gap={3}>
                {field('word', 'Từ')}
                {field('partOfSpeech', 'Từ loại')}
                {field('bandLevel', 'Band')}
                {field('cluster', 'Cluster')}
            </Grid>
            {field('explanation', 'Giải thích & Ngữ cảnh', true)}
            {field('exampleSentence', 'Câu ví dụ (EN)', true)}
            {field('exampleTranslation', 'Dịch (VI)', true)}
            <Flex gap={2}>
                <Button size="sm" borderRadius="10px" fontWeight="800"
                    bg={T.primary} color="white" _hover={{ bg: T.primaryDark }}
                    onClick={onSave} loading={saving} loadingText="Đang lưu...">
                    <FiCheck />&nbsp; Lưu
                </Button>
                <Button size="sm" variant="ghost" borderRadius="10px" onClick={onCancel}>Hủy</Button>
            </Flex>
        </VStack>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   IMPORT TAB
═══════════════════════════════════════════════════════════════════════════ */
function ImportTab() {
    const [importing, setImporting] = useState(false);
    const [result, setResult] = useState(null);
    const [preview, setPreview] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const fileRef = useRef(null);

    const parseExcel = async (file) => {
        const ExcelJS = await import('exceljs');
        const wb = new ExcelJS.Workbook();
        await wb.xlsx.load(await file.arrayBuffer());
        const sheet = wb.worksheets[0];
        if (!sheet) throw new Error('File không có sheet nào!');

        const rows = [];
        const getCellValue = (cell) => {
            if (!cell || cell.value === null || cell.value === undefined) return '';
            const v = cell.value;
            if (typeof v === 'object' && v.richText) {
                return v.richText.map((r) => r.text).join('').trim();
            }
            if (typeof v === 'object' && v.text) {
                return String(v.text).trim();
            }
            if (typeof v === 'object' && v.result !== undefined) {
                return String(v.result).trim();
            }
            return String(v).trim();
        };

        sheet.eachRow({ includeEmpty: false }, (row, rowNum) => {
            if (rowNum === 1) return;
            const cluster = getCellValue(row.getCell(1));
            const word = getCellValue(row.getCell(2));
            const partOfSpeech = getCellValue(row.getCell(3));
            const bandLevel = getCellValue(row.getCell(4));
            const explanation = getCellValue(row.getCell(5));
            const exampleSentence = getCellValue(row.getCell(6));
            const exampleTranslation = getCellValue(row.getCell(7));

            if (cluster && word) {
                rows.push({ cluster, word, partOfSpeech, bandLevel, explanation, exampleSentence, exampleTranslation });
            }
        });
        return rows;
    };

    const handleFile = async (file) => {
        if (!file) return;
        try {
            const rows = await parseExcel(file);
            if (!rows.length) {
                alert('Không tìm thấy dữ liệu! Cột: A=Cluster, B=Word, C=PartOfSpeech, D=BandLevel, E=Explanation, F=ExSentence(EN), G=ExSentence(VI)');
                return;
            }
            setPreview(rows); setResult(null);
        } catch (e) { alert('Lỗi đọc file: ' + e.message); }
    };

    const doImport = async () => {
        setImporting(true);
        try {
            const d = await synonymApi.importSynonyms(preview);
            setResult(d); setPreview(null);
        } catch (e) { alert(e.response?.data?.message || 'Lỗi khi import.'); }
        finally { setImporting(false); }
    };

    const uniqueClusters = preview ? [...new Set(preview.map(w => w.cluster))] : [];

    return (
        <Box>
            {/* Drop zone */}
            <Box
                mb={6} p={{ base: 8, md: 12 }} borderRadius="24px" textAlign="center" cursor="pointer"
                border="2px dashed"
                borderColor={dragOver ? T.primary : T.primaryBorder}
                bg={dragOver ? T.primaryLight : 'bg.panel'}
                transition="all .22s"
                onClick={() => fileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files?.[0]); }}
                _hover={{ borderColor: T.primary, bg: T.primaryLight }}
                position="relative" overflow="hidden"
            >
                <input ref={fileRef} type="file" accept=".xlsx,.xls"
                    style={{ display: 'none' }} onChange={e => handleFile(e.target.files?.[0])} />

                <Box
                    w="76px" h="76px" borderRadius="22px" mx="auto" mb={4}
                    bg={T.gradient}
                    display="flex" alignItems="center" justifyContent="center"
                    shadow="0 12px 28px rgba(99,102,241,.4)"
                    style={{ animation: 'synFloat 3s ease-in-out infinite' }}
                >
                    <FiUpload size={32} color="white" strokeWidth={2.4} />
                </Box>
                <Text fontWeight="800" fontSize="lg" color="fg" mb={2} letterSpacing="-0.2px">
                    Kéo thả hoặc click để chọn file Excel
                </Text>
                <Text fontSize="sm" color="fg.muted" fontWeight={500} mb={5}>
                    Hỗ trợ .xlsx và .xls
                </Text>
                <Box
                    display="inline-block" px={4} py={2.5} borderRadius="12px"
                    bg={T.primaryLight} border={`1px solid ${T.primaryBorder}`}
                >
                    <Text fontSize="xs" fontWeight="600" color={T.primary}>
                        A=Cluster · B=Word · C=Part of Speech · D=Band · E=Explanation · F=Example (EN) · G=Example (VI)
                    </Text>
                </Box>
            </Box>

            {/* Success */}
            {result && (
                <Box p={5} mb={6} borderRadius="18px" className="syn-pop"
                    bg="rgba(16,185,129,.06)" border="1.5px solid" borderColor="rgba(16,185,129,.3)">
                    <Flex align="center" gap={3}>
                        <Flex w="44px" h="44px" borderRadius="13px" bg={T.success} color="white"
                            align="center" justify="center" flexShrink={0}
                            shadow="0 6px 16px rgba(16,185,129,.35)">
                            <FiCheck size={22} />
                        </Flex>
                        <Box>
                            <Text fontWeight="800" color="green.600" _dark={{ color: 'green.300' }}>
                                {result.message}
                            </Text>
                            <Text fontSize="sm" color="green.600" _dark={{ color: 'green.400' }}>
                                Chuyển sang tab <b>Luyện tập</b> để bắt đầu học ngay!
                            </Text>
                        </Box>
                    </Flex>
                </Box>
            )}

            {/* Preview */}
            {preview?.length > 0 && (
                <Box>
                    <Flex align="center" justify="space-between" mb={5} wrap="wrap" gap={3}>
                        <Box>
                            <Text fontWeight="800" fontSize="lg" color="fg" letterSpacing="-0.3px">
                                📋 Xem trước — {preview.length} từ · {uniqueClusters.length} cluster
                            </Text>
                            <Text fontSize="sm" color="fg.muted">
                                Kiểm tra dữ liệu trước khi import
                            </Text>
                        </Box>
                        <Flex gap={2}>
                            <Button size="sm" variant="ghost" borderRadius="10px"
                                onClick={() => { setPreview(null); if (fileRef.current) fileRef.current.value = ''; }}>
                                Hủy
                            </Button>
                            <Button size="sm" borderRadius="10px" fontWeight="800" px={5}
                                bg={T.primary} color="white"
                                shadow="0 4px 14px rgba(99,102,241,.35)"
                                _hover={{ transform: 'translateY(-1px)', shadow: '0 8px 22px rgba(99,102,241,.45)' }}
                                onClick={doImport} loading={importing} loadingText="Đang import...">
                                {!importing && <><FiUpload size={13} />&nbsp;</>}
                                Import {preview.length} từ
                            </Button>
                        </Flex>
                    </Flex>

                    <VStack align="stretch" gap={3.5}>
                        {uniqueClusters.map((cName, ci) => {
                            const cWords = preview.filter(w => w.cluster === cName);
                            return (
                                <Box key={cName} bg="bg.panel" borderRadius="18px"
                                    border="1px solid" borderColor="border.muted"
                                    overflow="hidden"
                                    className="syn-fade" style={{ animationDelay: `${ci * .05}s` }}>
                                    <Box h="3px" bg={T.gradient} />
                                    <Box p={5}>
                                        <Flex align="center" gap={2.5} mb={4}>
                                            <Badge px={2.5} py={1} borderRadius="md" fontSize="11px"
                                                fontWeight="800" bg={T.primaryLight} color={T.primary}>
                                                {cWords.length} từ
                                            </Badge>
                                            <Text fontWeight="800" fontSize="md" color="fg">{cName}</Text>
                                        </Flex>
                                        <Grid
                                            templateColumns={{ base: '1fr', sm: 'repeat(2,1fr)', md: 'repeat(3,1fr)' }}
                                            gap={2}
                                        >
                                            {cWords.map((w, wi) => (
                                                <Flex key={wi} p={3} bg="bg.subtle" borderRadius="10px"
                                                    align="center" gap={2}
                                                    border="1px solid" borderColor="border.muted">
                                                    <Text fontWeight="700" fontSize="sm" color="fg">{w.word}</Text>
                                                    {w.partOfSpeech && (
                                                        <Badge px={1.5} py="1px" borderRadius="5px" fontSize="9px"
                                                            fontWeight="800" bg="rgba(245,158,11,.1)" color="#d97706">
                                                            {w.partOfSpeech}
                                                        </Badge>
                                                    )}
                                                    {w.bandLevel && (
                                                        <Badge px={1.5} py="1px" borderRadius="5px" fontSize="9px"
                                                            fontWeight="800" bg="rgba(14,165,233,.1)" color={T.info}>
                                                            {w.bandLevel}
                                                        </Badge>
                                                    )}
                                                </Flex>
                                            ))}
                                        </Grid>
                                    </Box>
                                </Box>
                            );
                        })}
                    </VStack>
                </Box>
            )}
        </Box>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SHARED MICRO-COMPONENTS
═══════════════════════════════════════════════════════════════════════════ */
function PagBtn({ children, active, disabled, onClick }) {
    return (
        <Button
            size="sm" borderRadius="9px" minW="36px" h="36px" p={0}
            bg={active ? T.primary : 'transparent'}
            color={active ? 'white' : 'fg.muted'}
            border="1px solid"
            borderColor={active ? T.primary : 'border.muted'}
            disabled={disabled}
            onClick={onClick}
            _hover={disabled ? {} : { borderColor: T.primary, color: active ? 'white' : T.primary }}
            transition="all .18s"
            fontSize="sm"
            fontWeight="700"
            shadow={active ? '0 4px 12px rgba(99,102,241,.35)' : 'none'}
        >
            {children}
        </Button>
    );
}

function EmptyState({ icon, title, desc }) {
    return (
        <Box p={16} textAlign="center" bg="bg.panel" borderRadius="24px"
            border="1px solid" borderColor="border.muted">
            <Text fontSize="5xl" mb={3}>{icon}</Text>
            <Text fontWeight="800" color="fg" mb={1.5} fontSize="lg">{title}</Text>
            <Text fontSize="sm" color="fg.muted">{desc}</Text>
        </Box>
    );
}