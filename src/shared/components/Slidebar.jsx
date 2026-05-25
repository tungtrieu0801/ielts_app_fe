import React, { useEffect } from 'react';
import { Box, Flex, Text, VStack, Image, Button, IconButton } from '@chakra-ui/react';
import { FiHome, FiBook, FiLogOut, FiMic, FiChevronLeft, FiChevronRight, FiSettings, FiZap, FiStar, FiAward } from 'react-icons/fi';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ColorModeButton, useColorMode } from '../../components/ui/color-mode.jsx';
import { useAuthStore } from '../../stores/useAuthStore.js';
import { useUIStore } from '../../stores/useUIStore.js';

const menuItems = [
    { name: 'Trang chủ', icon: FiHome, path: '/home' },
    { name: 'Bộ từ', icon: FiBook, path: '/sets' },
    { name: 'Speaking', icon: FiMic, path: '/speaking' },
    { name: 'Dictation', icon: FiMic, path: '/dictation' },
    { name: 'Game', icon: FiZap, path: '/game' },
    { name: 'Ranking', icon: FiAward, path: '/ranking' },
    { name: 'Cài đặt', icon: FiSettings, path: '/settings' },
    { name: 'Premium', icon: FiStar, path: '/premium', isPremium: true },
];

const Sidebar = ({ onNavigate, isCollapsed, onToggle }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout, colorMode: savedMode, setColorModePreference } = useAuthStore();
    const { colorMode, setColorMode } = useColorMode();
    // Sync: khi mount, apply preference đã lưu
    useEffect(() => {
        if (savedMode && savedMode !== colorMode) {
            setColorMode(savedMode);
        }
    }, []); // eslint-disable-line

    const palettes = [
        { id: 'warm', name: 'Ấm áp', main: '#fef6e4', accent: '#f582ae' },
        { id: 'navy', name: 'Hải quân', main: '#232946', accent: '#eebbc3' },
    ];

    // Khi toggle → lưu vào store
    useEffect(() => {
        if (colorMode && colorMode !== savedMode) {
            setColorModePreference(colorMode);
        }
    }, [colorMode]); // eslint-disable-line

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const [imgError, setImgError] = React.useState(false);

    return (
        <Box
            w="full"
            h="100vh"
            bg="bg.panel"
            borderRightWidth="1px"
            borderColor="border.muted"
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
            position="relative"
            transition="all 0.3s ease"
        >
            {/* Subtle accent glow */}
            {!isCollapsed && (
                <Box
                    position="absolute" top={-10} left={-10}
                    w="160px" h="160px" borderRadius="full"
                    bg="rgba(139, 211, 221, 0.3)" // Mint glow for new palette
                    opacity={0.5}
                    pointerEvents="none"
                    filter="blur(30px)"
                />
            )}

            {/* ── Top: Logo + Menu ── */}
            <Box pt={5} px={isCollapsed ? 2 : 3}>
                {/* Brand */}
                <Flex align="center" justify={isCollapsed ? "center" : "space-between"} mb={7}>
                    {!isCollapsed && (
                        <Flex align="center" gap={2}>
                            <Box
                                w="32px" h="32px" borderRadius="xl"
                                bg="brand.solid"
                                display="flex" alignItems="center" justifyContent="center"
                                fontSize="md"
                                shadow="0 4px 12px rgba(245, 130, 174, 0.3)"
                            >
                                🎯
                            </Box>
                            <Text fontSize="lg" fontWeight="900" color="fg" letterSpacing="-0.5px">
                                IELTS Vocab
                            </Text>
                        </Flex>
                    )}
                    
                    {!isCollapsed && <ColorModeButton size="xs" />}
                </Flex>

                {/* Floating Toggle Button - Centered Vertically on Right Border */}
                <Box
                    position="absolute"
                    top="50%"
                    right="-12px"
                    transform="translateY(-50%)"
                    zIndex={20}
                    w="24px"
                    h="24px"
                    bg="bg.panel"
                    border="1px solid"
                    borderColor="border.strong"
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    cursor="pointer"
                    shadow="0 2px 8px rgba(0, 24, 88, 0.12)"
                    onClick={onToggle}
                    _hover={{ 
                        bg: "brand.solid", 
                        color: "white", 
                        transform: "translateY(-50%) scale(1.15)",
                        borderColor: "brand.solid",
                        shadow: "0 4px 12px rgba(245, 130, 174, 0.4)" 
                    }}
                    transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
                    color="fg.muted"
                >
                    {isCollapsed ? <FiChevronRight size={14} /> : <FiChevronLeft size={14} />}
                </Box>

                    {/* Navigation */}
                    <VStack align={isCollapsed ? "center" : "stretch"} gap={1.5}>
                        {menuItems.map((item) => {
                            const isActive = location.pathname === item.path
                                || (item.path === '/sets' && location.pathname.startsWith('/sets'))
                                || (item.path === '/dictation' && location.pathname.startsWith('/dictation'))
                                || (item.path === '/speaking' && location.pathname.startsWith('/speaking'))
                                || (item.path === '/settings' && location.pathname.startsWith('/settings'))
                                || (item.path === '/ranking' && location.pathname.startsWith('/ranking'));
                            
                            return (
                                <Flex
                                    key={item.name}
                                    as={Link}
                                    to={item.path}
                                    onClick={onNavigate}
                                    align="center"
                                    p={3}
                                    borderRadius="xl"
                                    gap={3}
                                    justify={isCollapsed ? "center" : "flex-start"}
                                    bg={isActive ? 'brand.solid' : item.isPremium ? 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(59,130,246,0.1))' : 'transparent'}
                                    color={isActive ? 'white' : item.isPremium ? 'purple.500' : 'fg.muted'}
                                    shadow={isActive ? '0 4px 15px rgba(245, 130, 174, 0.25)' : 'none'}
                                    cursor="pointer"
                                    _hover={{
                                        bg: isActive ? 'brand.solid' : item.isPremium ? 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(59,130,246,0.2))' : 'bg.subtle',
                                        color: isActive ? 'white' : item.isPremium ? 'purple.600' : 'fg',
                                        transform: isCollapsed ? 'none' : 'translateX(4px)',
                                    }}
                                    transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                                    textDecoration="none"
                                    title={isCollapsed ? item.name : ""}
                                    borderWidth={item.isPremium && !isActive ? "1px" : "0"}
                                    borderColor={item.isPremium && !isActive ? "purple.200" : "transparent"}
                                    _dark={{
                                        borderColor: item.isPremium && !isActive ? "purple.800" : "transparent",
                                    }}
                                >
                                    <Box as={item.icon} fontSize="lg" flexShrink={0} />
                                    {!isCollapsed && (
                                        <Text fontSize="sm" fontWeight={isActive ? '800' : item.isPremium ? '700' : '600'}>
                                            {item.isPremium ? '⭐ ' : ''}{item.name}
                                        </Text>
                                    )}
                                </Flex>
                            );
                        })}
                    </VStack>
            </Box>

                {/* ── Bottom: User Profile ── */}
                <Box px={isCollapsed ? 2 : 3} pb={5}>
                    <Box h="1px" bg="border.muted" mb={5} opacity={0.5} />

                {user && (
                    <>
                        <Flex
                            align="center" gap={3} p={isCollapsed ? 1.5 : 3}
                            borderRadius="2xl"
                            bg="bg.subtle"
                            mb={3}
                            justify={isCollapsed ? "center" : "flex-start"}
                            borderWidth="1px"
                            borderColor="border.muted"
                        >
                            {user?.picture && !imgError ? (
                                <Image
                                    src={user.picture}
                                    alt="Avatar"
                                    referrerPolicy="no-referrer"
                                    onError={() => setImgError(true)}
                                    borderRadius="full"
                                    boxSize="30px"
                                    flexShrink={0}
                                    border="2px solid"
                                    borderColor="brand.muted"
                                />
                            ) : (
                                <Box
                                    w="30px" h="30px" borderRadius="full" flexShrink={0}
                                    bg="brand.muted" color="brand.text"
                                    display="flex" alignItems="center" justifyContent="center"
                                    fontWeight="bold" fontSize="xs"
                                >
                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                </Box>
                            )}
                            {!isCollapsed && (
                                <Box overflow="hidden" flex={1}>
                                    <Text fontSize="xs" fontWeight="600" color="fg" isTruncated>
                                        {user?.name || 'User'}
                                    </Text>
                                    <Text fontSize="xs" color="fg.muted" isTruncated>
                                        {user?.email || ''}
                                    </Text>
                                </Box>
                            )}
                        </Flex>

                        <Button
                            onClick={handleLogout}
                            variant="ghost"
                            size="sm"
                            w="full"
                            justifyContent={isCollapsed ? "center" : "flex-start"}
                            gap={2}
                            color="fg.muted"
                            borderRadius="xl"
                            _hover={{ bg: 'danger.bg', color: 'red.500' }}
                            title={isCollapsed ? "Đăng xuất" : ""}
                        >
                            <FiLogOut size={14} />
                            {!isCollapsed && <Text fontSize="sm">Đăng xuất</Text>}
                        </Button>
                    </>
                )}
            </Box>
        </Box>
    );
};

export default Sidebar;