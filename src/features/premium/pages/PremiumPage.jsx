import React, { useState } from "react";
import {
    Box, Flex, Text, Button, Badge, VStack, SimpleGrid, Icon,
} from "@chakra-ui/react";
import {
    FiZap, FiMic, FiBook, FiBarChart2, FiDownload, FiShield,
    FiStar, FiCheck, FiX, FiClock, FiGlobe, FiCpu, FiHeadphones,
    FiTrendingUp, FiLayers, FiUsers, FiMessageCircle,
} from "react-icons/fi";
import BaseLayout from "../../../layouts/BaseLayout.jsx";

/* ─── Pricing plans ─── */
const PLANS = [
    {
        id: "free",
        name: "Miễn phí",
        price: "0₫",
        period: "",
        desc: "Trải nghiệm cơ bản — đủ để bắt đầu",
        color: "gray",
        popular: false,
        features: [
            { text: "3 bộ từ vựng", included: true },
            { text: "Tối đa 100 từ / bộ", included: true },
            { text: "Flashcard SRS cơ bản", included: true },
            { text: "1 chế độ học (Flashcard)", included: true },
            { text: "Dictation YouTube (5 video/ngày)", included: true },
            { text: "Game PvP cơ bản", included: true },
            { text: "Streak Heatmap", included: true },
            { text: "Import từ Excel", included: false },
            { text: "Chế độ Nghe gõ & Đọc gõ", included: false },
            { text: "Fill-in-the-Blank", included: false },
            { text: "Phân tích chi tiết AI", included: false },
            { text: "Xuất PDF báo cáo", included: false },
            { text: "Dictation không giới hạn", included: false },
            { text: "Không giới hạn bộ từ", included: false },
            { text: "Phát âm AI feedback", included: false },
        ],
    },
    {
        id: "monthly",
        name: "Pro Tháng",
        price: "79.000₫",
        period: "/tháng",
        desc: "Dành cho người học nghiêm túc",
        color: "blue",
        popular: true,
        features: [
            { text: "Không giới hạn bộ từ", included: true },
            { text: "Không giới hạn từ / bộ", included: true },
            { text: "Flashcard SRS nâng cao", included: true },
            { text: "4 chế độ học đầy đủ", included: true },
            { text: "Dictation YouTube không giới hạn", included: true },
            { text: "Game PvP + xếp hạng mùa", included: true },
            { text: "Streak Heatmap & Analytics", included: true },
            { text: "Import từ Excel", included: true },
            { text: "Chế độ Nghe gõ & Đọc gõ", included: true },
            { text: "Fill-in-the-Blank", included: true },
            { text: "Phân tích chi tiết AI", included: true },
            { text: "Xuất PDF báo cáo", included: true },
            { text: "Dictation không giới hạn", included: true },
            { text: "Phát âm AI feedback", included: true },
            { text: "Ưu tiên hỗ trợ", included: true },
        ],
    },
    {
        id: "yearly",
        name: "Pro Năm",
        price: "590.000₫",
        period: "/năm",
        desc: "Tiết kiệm 38% — đầu tư đúng đắn",
        color: "purple",
        popular: false,
        badge: "Tiết kiệm 38%",
        features: [
            { text: "Tất cả tính năng Pro Tháng", included: true },
            { text: "Giá chỉ ~49k/tháng", included: true },
            { text: "Ưu tiên tính năng mới", included: true },
            { text: "Badge \"Early Supporter\" vĩnh viễn", included: true },
        ],
    },
];

/* ─── Premium features grid data ─── */
const PREMIUM_FEATURES = [
    {
        icon: FiLayers,
        title: "Không giới hạn bộ từ",
        desc: "Tạo bao nhiêu bộ từ vựng tùy thích, không giới hạn số từ mỗi bộ.",
        color: "blue",
    },
    {
        icon: FiHeadphones,
        title: "4 Chế độ học nâng cao",
        desc: "Mở khóa Nghe gõ, Đọc gõ, Fill-in-the-Blank ngoài Flashcard cơ bản.",
        color: "green",
    },
    {
        icon: FiCpu,
        title: "Phát âm AI Feedback",
        desc: "AI đánh giá phát âm của bạn theo chuẩn IPA, chỉ ra lỗi cụ thể để cải thiện.",
        color: "purple",
    },
    {
        icon: FiBarChart2,
        title: "Phân tích chi tiết AI",
        desc: "Biểu đồ tiến bộ, dự đoán điểm IELTS, phân tích điểm yếu & đề xuất ôn tập thông minh.",
        color: "orange",
    },
    {
        icon: FiMic,
        title: "Dictation không giới hạn",
        desc: "Luyện nghe chép từ YouTube không giới hạn video mỗi ngày, kho thư viện cộng đồng đầy đủ.",
        color: "cyan",
    },
    {
        icon: FiDownload,
        title: "Import Excel & Xuất PDF",
        desc: "Nhập từ vựng hàng loạt từ file Excel, xuất báo cáo học tập dạng PDF chuyên nghiệp.",
        color: "teal",
    },
    {
        icon: FiUsers,
        title: "Game PvP Xếp hạng mùa",
        desc: "Thi đấu xếp hạng theo mùa, bảng xếp hạng toàn cầu, phần thưởng exclusive.",
        color: "red",
    },
    {
        icon: FiShield,
        title: "Ưu tiên hỗ trợ",
        desc: "Được hỗ trợ nhanh qua chat riêng, phản hồi trong vòng 2 giờ.",
        color: "yellow",
    },
];

/* ─── FAQ ─── */
const FAQ = [
    {
        q: "Tôi có thể hủy đăng ký bất cứ lúc nào không?",
        a: "Có! Bạn có thể hủy bất cứ lúc nào. Tài khoản Pro vẫn hoạt động đến hết chu kỳ đã thanh toán.",
    },
    {
        q: "Dữ liệu của tôi có bị mất khi hết hạn Pro?",
        a: "Không. Tất cả từ vựng và tiến độ học tập đều được giữ nguyên. Bạn chỉ không thể truy cập các tính năng Pro cho đến khi gia hạn.",
    },
    {
        q: "Có hỗ trợ thanh toán qua ngân hàng Việt Nam không?",
        a: "Có! Chúng tôi hỗ trợ thanh toán qua chuyển khoản ngân hàng, MoMo, ZaloPay và thẻ quốc tế (Visa/Mastercard).",
    },
    {
        q: "Tôi có thể chuyển từ gói Tháng sang gói Năm không?",
        a: "Có. Khi nâng cấp, phần phí còn lại của gói cũ sẽ được trừ vào gói mới.",
    },
];

/* ═══════════════════════════════════════════════ */

const PremiumPage = () => {
    const [openFaq, setOpenFaq] = useState(null);

    return (
        <BaseLayout>
            <Box maxW="1200px" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 6, md: 10 }}>

                {/* ── Hero ── */}
                <VStack gap={4} textAlign="center" mb={12}>
                    <Badge
                        colorPalette="purple" variant="subtle" px={4} py={1.5}
                        borderRadius="full" fontSize="sm" fontWeight="800"
                    >
                        ✨ IELTS Vocab Pro
                    </Badge>
                    <Text
                        fontSize={{ base: "3xl", md: "5xl" }}
                        fontWeight="900"
                        lineHeight="1.1"
                        letterSpacing="-1px"
                        bgGradient="to-r"
                        gradientFrom="purple.500"
                        gradientTo="blue.500"
                        bgClip="text"
                    >
                        Nâng cấp trải nghiệm học
                    </Text>
                    <Text fontSize={{ base: "md", md: "lg" }} color="fg.muted" maxW="600px">
                        Mở khóa toàn bộ công cụ học từ vựng IELTS tiên tiến nhất.
                        Học thông minh hơn, nhớ lâu hơn, đạt điểm cao hơn.
                    </Text>
                </VStack>

                {/* ── Pricing Cards ── */}
                <SimpleGrid columns={{ base: 1, md: 3 }} gap={6} mb={16}>
                    {PLANS.map((plan) => (
                        <Box
                            key={plan.id}
                            bg="bg.panel"
                            borderRadius="2xl"
                            borderWidth={plan.popular ? "2px" : "1px"}
                            borderColor={plan.popular ? "blue.400" : "border.muted"}
                            p={7}
                            position="relative"
                            overflow="hidden"
                            shadow={plan.popular ? "xl" : "sm"}
                            transform={plan.popular ? { md: "scale(1.04)" } : "none"}
                            transition="all 0.3s ease"
                            _hover={{ shadow: "xl", transform: plan.popular ? { md: "scale(1.06)" } : "translateY(-4px)" }}
                        >
                            {/* Popular badge */}
                            {plan.popular && (
                                <Badge
                                    position="absolute" top={4} right={4}
                                    colorPalette="blue" variant="solid" px={3} py={1}
                                    borderRadius="full" fontSize="xs" fontWeight="800"
                                >
                                    🔥 Phổ biến nhất
                                </Badge>
                            )}
                            {plan.badge && (
                                <Badge
                                    position="absolute" top={4} right={4}
                                    colorPalette="green" variant="solid" px={3} py={1}
                                    borderRadius="full" fontSize="xs" fontWeight="800"
                                >
                                    {plan.badge}
                                </Badge>
                            )}

                            {/* Decorative glow */}
                            {plan.popular && (
                                <Box
                                    position="absolute" top={-20} right={-20}
                                    w="120px" h="120px" borderRadius="full"
                                    bg="blue.100" opacity={0.3}
                                    _dark={{ bg: "blue.800", opacity: 0.2 }}
                                    pointerEvents="none"
                                />
                            )}

                            <VStack align="flex-start" gap={4}>
                                <Text fontSize="lg" fontWeight="800" color="fg">{plan.name}</Text>
                                <Flex align="baseline" gap={1}>
                                    <Text fontSize="4xl" fontWeight="900" color="fg">{plan.price}</Text>
                                    {plan.period && (
                                        <Text fontSize="md" color="fg.muted" fontWeight="600">{plan.period}</Text>
                                    )}
                                </Flex>
                                <Text fontSize="sm" color="fg.muted">{plan.desc}</Text>

                                <Box h="1px" bg="border.muted" w="full" />

                                <VStack align="flex-start" gap={2.5} w="full">
                                    {plan.features.map((f, i) => (
                                        <Flex key={i} align="center" gap={2.5}>
                                            <Flex
                                                w="20px" h="20px" borderRadius="full" flexShrink={0}
                                                bg={f.included ? `${plan.id === "free" ? "green" : plan.color}.100` : "gray.100"}
                                                _dark={{ bg: f.included ? `${plan.id === "free" ? "green" : plan.color}.900/30` : "gray.800" }}
                                                align="center" justify="center"
                                            >
                                                {f.included ? (
                                                    <Icon as={FiCheck} boxSize={3} color={`${plan.id === "free" ? "green" : plan.color}.500`} />
                                                ) : (
                                                    <Icon as={FiX} boxSize={3} color="gray.400" />
                                                )}
                                            </Flex>
                                            <Text
                                                fontSize="sm"
                                                color={f.included ? "fg" : "fg.subtle"}
                                                fontWeight={f.included ? "500" : "400"}
                                                textDecoration={f.included ? "none" : "line-through"}
                                                opacity={f.included ? 1 : 0.6}
                                            >
                                                {f.text}
                                            </Text>
                                        </Flex>
                                    ))}
                                </VStack>

                                <Button
                                    w="full"
                                    size="lg"
                                    borderRadius="xl"
                                    fontWeight="800"
                                    mt={2}
                                    colorPalette={plan.id === "free" ? "gray" : plan.color}
                                    variant={plan.popular ? "solid" : "outline"}
                                    bg={plan.popular ? `linear-gradient(135deg, var(--chakra-colors-blue-500), var(--chakra-colors-purple-500))` : undefined}
                                    color={plan.popular ? "white" : undefined}
                                    _hover={plan.popular ? { opacity: 0.9, transform: "translateY(-1px)" } : {}}
                                >
                                    {plan.id === "free" ? "Gói hiện tại" : "Nâng cấp ngay"}
                                </Button>
                            </VStack>
                        </Box>
                    ))}
                </SimpleGrid>

                {/* ── Features Grid ── */}
                <VStack gap={3} textAlign="center" mb={8}>
                    <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="900" letterSpacing="-0.5px">
                        Tính năng Premium mở khóa
                    </Text>
                    <Text color="fg.muted" maxW="500px">
                        Tất cả những gì bạn cần để chinh phục IELTS Vocabulary
                    </Text>
                </VStack>

                <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={5} mb={16}>
                    {PREMIUM_FEATURES.map((f, i) => (
                        <Box
                            key={i}
                            bg="bg.panel"
                            borderRadius="2xl"
                            borderWidth="1px"
                            borderColor="border.muted"
                            p={6}
                            _hover={{ shadow: "lg", transform: "translateY(-3px)", borderColor: `${f.color}.300` }}
                            transition="all 0.25s ease"
                        >
                            <Flex
                                w="44px" h="44px" borderRadius="xl" mb={4}
                                bg={`${f.color}.100`}
                                _dark={{ bg: `${f.color}.900/30` }}
                                color={`${f.color}.500`}
                                align="center" justify="center"
                                fontSize="xl"
                            >
                                <Icon as={f.icon} boxSize={5} />
                            </Flex>
                            <Text fontWeight="800" mb={2} fontSize="md">{f.title}</Text>
                            <Text fontSize="sm" color="fg.muted" lineHeight="tall">{f.desc}</Text>
                        </Box>
                    ))}
                </SimpleGrid>

                {/* ── Comparison Table ── */}
                <Box
                    bg="bg.panel" borderRadius="2xl" borderWidth="1px" borderColor="border.muted"
                    overflow="hidden" mb={16}
                >
                    <Box bg="bg.subtle" p={5} borderBottomWidth="1px" borderColor="border.muted">
                        <Text fontWeight="900" fontSize="xl">So sánh chi tiết Free vs Pro</Text>
                    </Box>
                    <Box overflowX="auto">
                        <Box as="table" w="full" fontSize="sm">
                            <Box as="thead">
                                <Box as="tr" bg="bg.subtle">
                                    <Box as="th" p={4} textAlign="left" fontWeight="800" color="fg.muted">Tính năng</Box>
                                    <Box as="th" p={4} textAlign="center" fontWeight="800" color="fg.muted" w="120px">Free</Box>
                                    <Box as="th" p={4} textAlign="center" fontWeight="800" color="blue.500" w="120px">Pro ⚡</Box>
                                </Box>
                            </Box>
                            <Box as="tbody">
                                {[
                                    ["Bộ từ vựng", "3 bộ", "Không giới hạn"],
                                    ["Số từ / bộ", "100 từ", "Không giới hạn"],
                                    ["Chế độ Flashcard", "✅", "✅"],
                                    ["Chế độ Nghe gõ", "❌", "✅"],
                                    ["Chế độ Đọc gõ", "❌", "✅"],
                                    ["Chế độ Fill-in-Blank", "❌", "✅"],
                                    ["Dictation YouTube", "5 video/ngày", "Không giới hạn"],
                                    ["Import Excel", "❌", "✅"],
                                    ["Xuất báo cáo PDF", "❌", "✅"],
                                    ["Phân tích AI", "❌", "✅"],
                                    ["Phát âm AI feedback", "❌", "✅"],
                                    ["Game PvP xếp hạng mùa", "❌", "✅"],
                                    ["Hỗ trợ ưu tiên", "❌", "✅"],
                                ].map(([feature, free, pro], i) => (
                                    <Box as="tr" key={i} borderBottomWidth="1px" borderColor="border.subtle"
                                        _hover={{ bg: "bg.subtle" }} transition="background 0.15s"
                                    >
                                        <Box as="td" p={4} fontWeight="600">{feature}</Box>
                                        <Box as="td" p={4} textAlign="center" color="fg.muted">{free}</Box>
                                        <Box as="td" p={4} textAlign="center" fontWeight="600" color="blue.500">{pro}</Box>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    </Box>
                </Box>

                {/* ── FAQ ── */}
                <VStack gap={3} textAlign="center" mb={8}>
                    <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="900" letterSpacing="-0.5px">
                        Câu hỏi thường gặp
                    </Text>
                </VStack>

                <VStack gap={3} mb={16} maxW="700px" mx="auto">
                    {FAQ.map((item, i) => (
                        <Box
                            key={i}
                            bg="bg.panel"
                            borderRadius="xl"
                            borderWidth="1px"
                            borderColor={openFaq === i ? "blue.300" : "border.muted"}
                            w="full"
                            overflow="hidden"
                            transition="all 0.2s"
                        >
                            <Flex
                                p={5}
                                cursor="pointer"
                                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                justify="space-between"
                                align="center"
                                _hover={{ bg: "bg.subtle" }}
                                transition="background 0.15s"
                            >
                                <Text fontWeight="700" fontSize="sm">{item.q}</Text>
                                <Text
                                    color="fg.muted" fontSize="lg" fontWeight="bold"
                                    transform={openFaq === i ? "rotate(45deg)" : "none"}
                                    transition="transform 0.2s"
                                >
                                    +
                                </Text>
                            </Flex>
                            {openFaq === i && (
                                <Box px={5} pb={5} pt={0}>
                                    <Text fontSize="sm" color="fg.muted" lineHeight="tall">
                                        {item.a}
                                    </Text>
                                </Box>
                            )}
                        </Box>
                    ))}
                </VStack>

                {/* ── Bottom CTA ── */}
                <Box
                    bg="linear-gradient(135deg, var(--chakra-colors-purple-500) 0%, var(--chakra-colors-blue-600) 100%)"
                    borderRadius="2xl"
                    p={{ base: 8, md: 12 }}
                    textAlign="center"
                    color="white"
                    position="relative"
                    overflow="hidden"
                >
                    {/* Decorative orbs */}
                    <Box position="absolute" top={-30} left={-30} w="150px" h="150px" borderRadius="full" bg="white/10" pointerEvents="none" />
                    <Box position="absolute" bottom={-40} right={-20} w="200px" h="200px" borderRadius="full" bg="white/5" pointerEvents="none" />

                    <VStack gap={4} position="relative">
                        <Text fontSize="3xl">🚀</Text>
                        <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="900" letterSpacing="-0.5px">
                            Sẵn sàng chinh phục IELTS?
                        </Text>
                        <Text fontSize="md" color="white/80" maxW="500px">
                            Hơn 10.000 học viên đã nâng cấp. Bắt đầu thử miễn phí 7 ngày ngay hôm nay.
                        </Text>
                        <Flex gap={3} mt={2}>
                            <Button
                                size="lg" bg="white" color="purple.600" fontWeight="900"
                                borderRadius="xl" px={8}
                                _hover={{ bg: "gray.50", transform: "translateY(-2px)", shadow: "xl" }}
                                transition="all 0.2s"
                            >
                                Dùng thử 7 ngày miễn phí
                            </Button>
                        </Flex>
                        <Text fontSize="xs" color="white/60">Không cần thẻ tín dụng • Hủy bất cứ lúc nào</Text>
                    </VStack>
                </Box>

            </Box>
        </BaseLayout>
    );
};

export default PremiumPage;
