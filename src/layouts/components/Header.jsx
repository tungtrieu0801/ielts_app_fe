import React, { useState } from "react";
import { Flex, Text, IconButton, Box, Button } from "@chakra-ui/react";
import { FiBell, FiSearch, FiMenu } from "react-icons/fi";
import { FaFire } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { menuItems } from "../../shared/const/menuConfig.js";
import { useStudyStore } from "../../stores/useStudyStore.js";
import { DrawerRoot, DrawerTrigger, DrawerContent, DrawerBody, DrawerCloseTrigger } from "../../components/ui/drawer.jsx";
import Sidebar from "../../shared/components/Slidebar.jsx";

const BannerMarquee = React.memo(() => {
    const duration = 40;
    // We use a fixed offset calculated at mount time to keep it synced
    const offset = React.useMemo(() => -((Date.now() / 1000) % duration), [duration]);

    return (
        <Box flex="1" mx={10} overflow="hidden" display={{ base: "none", md: "block" }} position="relative" h="60px">
            <style>
                {`
                @keyframes marquee_header_v3 {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                `}
            </style>
            <Flex
                as="div"
                w="max-content"
                h="100%"
                align="center"
                position="absolute"
                left="0"
                top="0"
                animation={`marquee_header_v3 ${duration}s linear infinite`}
                style={{
                    animationDelay: `${offset}s`,
                    willChange: 'transform'
                }}
            >
                {[1, 2].map((i) => (
                    <Flex key={i} align="center" gap={12} pr={12} h="100%">
                        <Text fontSize="md" fontWeight="bold" color="blue.700" whiteSpace="nowrap">🔥 Practice makes perfect</Text>
                        <Text fontSize="md" fontWeight="bold" color="green.700" whiteSpace="nowrap">🚀 Consistency is key to success</Text>
                        <Text fontSize="md" fontWeight="bold" color="purple.700" whiteSpace="nowrap">💡 Learning never exhausts the mind</Text>
                        <Text fontSize="md" fontWeight="bold" color="orange.700" whiteSpace="nowrap">🌟 A journey of a thousand miles begins with a single step</Text>
                    </Flex>
                ))}
            </Flex>
        </Box>
    );
});

const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { streakInfo } = useStudyStore();
    const currentStreak = streakInfo?.currentStreak ?? 0;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const activeMenu = menuItems.find((item) =>
        location.pathname === item.path ||
        (item.path === '/sets' && location.pathname.startsWith('/sets'))
    );

    return (
        <Flex
            w="100%"
            px={{ base: 4, md: 6 }}
            h="60px"
            align="center"
            justify="space-between"
            borderBottomWidth="1px"
            borderColor="border.muted"
            bg="bg.panel"
            flexShrink={0}
        >
            {/* Left: Mobile Menu & Page title */}
            <Flex align="center" gap={{ base: 2, md: 4 }}>
                {/* Mobile Hamburger Menu */}
                <Box display={{ base: "block", md: "none" }}>
                    <DrawerRoot placement="start" open={isMobileMenuOpen} onOpenChange={(e) => setIsMobileMenuOpen(e.open)}>
                        <DrawerTrigger asChild>
                            <IconButton variant="ghost" size="sm" color="fg.muted">
                                <FiMenu size={20} />
                            </IconButton>
                        </DrawerTrigger>
                        <DrawerContent>
                            <DrawerCloseTrigger zIndex={10} top="3" right="3" />
                            <DrawerBody p={0}>
                                <Sidebar onNavigate={() => setIsMobileMenuOpen(false)} />
                            </DrawerBody>
                        </DrawerContent>
                    </DrawerRoot>
                </Box>

                <Text
                    fontSize="2xl"
                    fontWeight="800"
                    color="blue.700"
                    ml={{ base: 1, md: 0 }}
                >
                    {activeMenu?.name || 'Dashboard'}
                </Text>
            </Flex>

            {/* Middle: Running Banner */}
            <BannerMarquee />

            {/* Right: Actions */}
            <Flex gap={3} align="center">
                <IconButton
                    variant="ghost" size="sm" borderRadius="lg"
                    display={{ base: "none", sm: "flex" }}
                    color="fg.muted"
                    _hover={{ bg: 'bg.subtle', color: 'fg' }}
                >
                    <FiSearch size={17} />
                </IconButton>

                <Box position="relative">
                    <IconButton
                        variant="ghost" size="sm" borderRadius="lg"
                        color="fg.muted"
                        _hover={{ bg: 'bg.subtle', color: 'fg' }}
                    >
                        <FiBell size={17} />
                    </IconButton>
                    <Box
                        position="absolute" top="7px" right="7px"
                        w="7px" h="7px"
                        bg="red.500" borderRadius="full"
                        borderWidth="1.5px"
                        borderColor="bg.panel"
                    />
                </Box>

                {/* Streak badge — dùng CSS class cho dark mode */}
                <Flex
                    align="center" gap={1.5}
                    px={3} py={1.5}
                    borderRadius="lg"
                    bg="warning.bg"
                    borderWidth="1px"
                    borderColor="border.muted"
                    className="streak-badge"
                >
                    <style>{`
                        .streak-badge { border-color: var(--chakra-colors-border-muted); }
                        .dark .streak-badge { border-color: rgba(251,146,60,0.2); }
                    `}</style>
                    <Box as={FaFire} color="orange.400" fontSize="sm" />
                    <Text fontSize="sm" fontWeight="bold" color="orange.500">{currentStreak}</Text>
                    <Text fontSize="xs" color="fg.muted">streak</Text>
                </Flex>

                {/* Premium button dùng CSS gradient class */}
                <button
                    className="premium-btn"
                    style={{
                        padding: '6px 16px',
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => Object.assign(e.target.style, { opacity: '0.9', transform: 'translateY(-1px)' })}
                    onMouseLeave={(e) => Object.assign(e.target.style, { opacity: '1', transform: 'translateY(0)' })}
                    onClick={() => navigate('/premium')}
                >
                    ✨ Premium
                </button>
            </Flex>
        </Flex>
    );
};

export default Header;