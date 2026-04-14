import React from "react";
import { Flex, Text, IconButton, Box, Button } from "@chakra-ui/react";
import { FiBell, FiSearch } from "react-icons/fi";
import { FaFire } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import { menuItems } from "../../shared/const/menuConfig.js";

const Header = () => {
    const location = useLocation();

    const activeMenu = menuItems.find((item) =>
        location.pathname === item.path ||
        (item.path === '/sets' && location.pathname.startsWith('/sets'))
    );

    return (
        <Flex
            w="100%"
            px={6}
            h="60px"
            align="center"
            justify="space-between"
            borderBottomWidth="1px"
            borderColor="border.muted"
            bg="bg.panel"
            flexShrink={0}
        >
            {/* Left: Page title */}
            <Text fontSize="lg" fontWeight="bold" color="fg">
                {activeMenu?.name || 'Dashboard'}
            </Text>

            {/* Right: Actions */}
            <Flex gap={2} align="center">
                <IconButton
                    variant="ghost" size="sm" borderRadius="lg"
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
                    <Text fontSize="sm" fontWeight="bold" color="orange.500">7</Text>
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
                >
                    ✨ Premium
                </button>
            </Flex>
        </Flex>
    );
};

export default Header;