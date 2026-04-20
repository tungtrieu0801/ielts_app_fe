import React from "react";
import { Box, Flex, Text, Kbd } from "@chakra-ui/react";
import { FiCommand } from "react-icons/fi";

const StudySidebarShortcuts = () => {
    return (
        <Box
            bg="bg.panel" borderRadius="2xl" p={6}
            borderWidth="1px" borderColor="border.muted" shadow="sm"
            position="sticky" top="100px"
        >
            <Flex align="center" gap={2} fill="fg" mb={5} color="fg.subtle">
                <FiCommand />
                <Text fontWeight="bold" fontSize="sm" textTransform="uppercase" letterSpacing="wider">
                    Phím tắt
                </Text>
            </Flex>

            <Flex direction="column" gap={4}>
                <Flex justify="space-between" align="center">
                    <Text fontSize="sm" color="fg.muted">Lật thẻ / Tiếp tục</Text>
                    <Kbd size="md" variant="subtle">Space</Kbd>
                </Flex>
                <Box borderBottom="1px dashed" borderColor="border.subtle" my={1} />
                <Flex justify="space-between" align="center">
                    <Text fontSize="sm" color="fg.muted">Quên (Again)</Text>
                    <Kbd size="md" variant="subtle">1</Kbd>
                </Flex>
                <Flex justify="space-between" align="center">
                    <Text fontSize="sm" color="fg.muted">Khó (Hard)</Text>
                    <Kbd size="md" variant="subtle">2</Kbd>
                </Flex>
                <Flex justify="space-between" align="center">
                    <Text fontSize="sm" color="fg.muted">Nhớ (Good)</Text>
                    <Kbd size="md" variant="subtle">3</Kbd>
                </Flex>
                <Flex justify="space-between" align="center">
                    <Text fontSize="sm" color="fg.muted">Dễ (Easy)</Text>
                    <Kbd size="md" variant="subtle">4</Kbd>
                </Flex>
            </Flex>
        </Box>
    );
};

export default StudySidebarShortcuts;
