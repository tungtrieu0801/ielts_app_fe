import React, { useEffect } from 'react';
import { Box, Flex, Text, VStack, Image, Button } from '@chakra-ui/react';
import { FiHome, FiBook, FiLogOut, FiMic } from 'react-icons/fi';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ColorModeButton, useColorMode } from '../../components/ui/color-mode.jsx';
import { useAuthStore } from '../../stores/useAuthStore.js';

const menuItems = [
    { name: 'Trang chủ', icon: FiHome, path: '/home' },
    { name: 'Bộ từ của tôi', icon: FiBook, path: '/sets' },
    { name: 'Dictation', icon: FiMic, path: '/dictation' },
];

const Sidebar = () => {
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

    return (
        <Box
            w={{ base: 'full', md: '240px' }}
            h="100vh"
            bg="bg.panel"
            borderRightWidth="1px"
            borderColor="border.muted"
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
            position="relative"
            overflow="hidden"
        >
            {/* Subtle accent glow */}
            <Box
                position="absolute" top={-10} left={-10}
                w="160px" h="160px" borderRadius="full"
                bg="brand.muted"
                opacity={0.5}
                pointerEvents="none"
                filter="blur(30px)"
            />

            {/* ── Top: Logo + Menu ── */}
            <Box pt={5} px={3}>
                {/* Brand */}
                <Flex align="center" justify="space-between" px={3} mb={7}>
                    <Flex align="center" gap={2}>
                        <Box
                            w="30px" h="30px" borderRadius="lg"
                            bg="brand.muted"
                            display="flex" alignItems="center" justifyContent="center"
                            fontSize="sm"
                        >
                            🎯
                        </Box>
                        <Text fontSize="lg" fontWeight="extrabold" color="brand.text">
                            IELTS Vocab
                        </Text>
                    </Flex>
                    <ColorModeButton />
                </Flex>

                {/* Navigation */}
                <VStack align="stretch" gap={1}>
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path
                            || (item.path === '/sets' && location.pathname.startsWith('/sets'))
                            || (item.path === '/dictation' && location.pathname.startsWith('/dictation'));
                        return (
                            <Flex
                                key={item.name}
                                as={Link}
                                to={item.path}
                                align="center"
                                p={3}
                                borderRadius="xl"
                                gap={3}
                                bg={isActive ? 'brand.muted' : 'transparent'}
                                color={isActive ? 'brand.text' : 'fg.muted'}
                                borderWidth="1px"
                                borderColor={isActive ? 'border.strong' : 'transparent'}
                                _hover={{
                                    bg: 'bg.subtle',
                                    color: 'fg',
                                    transform: 'translateX(3px)',
                                    textDecoration: 'none',
                                }}
                                transition="all 0.15s ease"
                                textDecoration="none"
                            >
                                <Box as={item.icon} fontSize="md" flexShrink={0} />
                                <Text fontSize="sm" fontWeight={isActive ? '600' : '500'}>
                                    {item.name}
                                </Text>
                                {isActive && (
                                    <Box
                                        ml="auto" w="6px" h="6px" borderRadius="full"
                                        bg="brand.solid"
                                        flexShrink={0}
                                    />
                                )}
                            </Flex>
                        );
                    })}
                </VStack>
            </Box>

            {/* ── Bottom: User Profile ── */}
            <Box px={3} pb={5}>
                <Box h="1px" bg="border.muted" mb={4} />

                {user && (
                    <>
                        <Flex
                            align="center" gap={3} p={3}
                            borderRadius="xl"
                            bg="bg.subtle"
                            borderWidth="1px"
                            borderColor="border.muted"
                            mb={2}
                        >
                            {user?.picture ? (
                                <Image
                                    src={user.picture}
                                    alt="Avatar"
                                    borderRadius="full"
                                    boxSize="34px"
                                    flexShrink={0}
                                    border="2px solid"
                                    borderColor="brand.muted"
                                />
                            ) : (
                                <Box
                                    w="34px" h="34px" borderRadius="full" flexShrink={0}
                                    bg="brand.muted" color="brand.text"
                                    display="flex" alignItems="center" justifyContent="center"
                                    fontWeight="bold" fontSize="sm"
                                >
                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                </Box>
                            )}
                            <Box overflow="hidden" flex={1}>
                                <Text fontSize="xs" fontWeight="600" color="fg" isTruncated>
                                    {user?.name || 'User'}
                                </Text>
                                <Text fontSize="xs" color="fg.muted" isTruncated>
                                    {user?.email || ''}
                                </Text>
                            </Box>
                        </Flex>

                        <Button
                            onClick={handleLogout}
                            variant="ghost"
                            size="sm"
                            w="full"
                            justifyContent="flex-start"
                            gap={2}
                            color="fg.muted"
                            borderRadius="xl"
                            _hover={{ bg: 'danger.bg', color: 'red.500' }}
                        >
                            <FiLogOut size={14} />
                            <Text fontSize="sm">Đăng xuất</Text>
                        </Button>
                    </>
                )}
            </Box>
        </Box>
    );
};

export default Sidebar;