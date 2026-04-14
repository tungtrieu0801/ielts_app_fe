import React from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { Link, useLocation } from "react-router-dom";
import { FiHome, FiBook } from "react-icons/fi";

const tabs = [
    { name: "Trang chủ", icon: FiHome, path: "/home" },
    { name: "Bộ từ", icon: FiBook, path: "/sets" },
];

/**
 * Bottom Tab Bar — chỉ hiện trên mobile (< md).
 * Giữ bottom: 0 và có safe-area-inset cho iPhone notch.
 */
const MobileBottomNav = () => {
    const location = useLocation();

    return (
        <Box
            display={{ base: "flex", md: "none" }}
            position="fixed"
            bottom={0}
            left={0}
            right={0}
            zIndex={100}
            bg="bg.panel"
            borderTopWidth="1px"
            borderColor="border.muted"
            pb="env(safe-area-inset-bottom)"
            shadow="0 -4px 20px rgba(0,0,0,0.08)"
        >
            {tabs.map(({ name, icon: Icon, path }) => {
                const isActive = location.pathname === path
                    || (path === "/sets" && location.pathname.startsWith("/sets"));
                return (
                    <Flex
                        key={name}
                        as={Link}
                        to={path}
                        flex={1}
                        direction="column"
                        align="center"
                        justify="center"
                        py={3}
                        gap={0.5}
                        color={isActive ? "brand.solid" : "fg.muted"}
                        textDecoration="none"
                        position="relative"
                        _active={{ opacity: 0.7 }}
                        transition="color 0.15s ease"
                    >
                        {/* Active indicator */}
                        {isActive && (
                            <Box
                                position="absolute"
                                top={0}
                                left="50%"
                                transform="translateX(-50%)"
                                w="32px"
                                h="2.5px"
                                bg="brand.solid"
                                borderRadius="full"
                            />
                        )}
                        <Box
                            p={1.5}
                            borderRadius="xl"
                            bg={isActive ? "brand.muted" : "transparent"}
                            transition="background 0.15s ease"
                        >
                            <Icon size={20} />
                        </Box>
                        <Text
                            fontSize="10px"
                            fontWeight={isActive ? "700" : "500"}
                            letterSpacing="wide"
                        >
                            {name}
                        </Text>
                    </Flex>
                );
            })}
        </Box>
    );
};

export default MobileBottomNav;
