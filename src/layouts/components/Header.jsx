import React from "react";
import { Flex, Text, IconButton, Box, Button } from "@chakra-ui/react";
import { FiBell, FiSearch } from "react-icons/fi";
import { FaFire } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import {menuItems} from "../../shared/const/menuConfig.js";

const Header = () => {

    const location = useLocation();

    const activeMenu = menuItems.find(
        item => item.path === location.pathname
    );

    return (
        <Flex
            w="100%"
            px={8}
            py={4}
            align="center"
            justify="space-between"
            borderBottomWidth="1px"
            borderColor="border.muted"
        >

            {/* Title bên trái */}
            <Text fontSize="2xl" fontWeight="bold">
                {activeMenu?.name || "Dashboard"}
            </Text>

            {/* Right Actions */}
            <Flex gap={6} align="center">

                <IconButton variant="ghost">
                    <FiSearch size={22} />
                </IconButton>

                <Box position="relative">
                    <IconButton variant="ghost">
                        <FiBell size={22} />
                    </IconButton>

                    <Box
                        position="absolute"
                        top="1"
                        right="1.5"
                        w="2.5"
                        h="2.5"
                        bg="red.500"
                        borderRadius="full"
                    />
                </Box>

                <Flex align="center" gap={2}>
                    <Box as={FaFire} color="orange.400" />
                    <Text fontWeight="bold">0</Text>
                </Flex>

                <Button bg="orange.500" color="white">
                    Premium
                </Button>

            </Flex>
        </Flex>
    );
};

export default Header;