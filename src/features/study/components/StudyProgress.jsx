import React from "react";
import { Box, Flex, Text } from "@chakra-ui/react";

const StudyProgress = ({ current, total }) => {
    const pct = total > 0 ? Math.round((current / total) * 100) : 0;

    return (
        <Box w="full" mb={6}>
            <Flex justify="space-between" align="center" mb={2}>
                <Text fontSize="sm" color="fg.muted" fontWeight="medium">
                    Tiến độ
                </Text>
                <Text fontSize="sm" fontWeight="bold" color="blue.500">
                    {current}/{total} thẻ
                </Text>
            </Flex>
            <Box w="full" h="8px" bg="bg.subtle" borderRadius="full" overflow="hidden">
                <Box
                    h="full"
                    w={`${pct}%`}
                    bg="linear-gradient(90deg, #3b82f6, #8b5cf6)"
                    borderRadius="full"
                    transition="width 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
                />
            </Box>
        </Box>
    );
};

export default StudyProgress;
