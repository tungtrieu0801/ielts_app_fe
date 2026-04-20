import React from "react";
import { Box, Flex, Text } from "@chakra-ui/react";

const StudyProgress = ({ current, total }) => {
    const pct = total > 0 ? Math.round((current / total) * 100) : 0;

    return (
        <Box w="full">
            <Flex justify="space-between" align="center" mb={3}>
                <Text fontSize="sm" color="fg.subtle" fontWeight="bold" textTransform="uppercase" letterSpacing="wider">
                    Tiến độ
                </Text>
                <Text fontSize="sm" fontWeight="black" color="indigo.500">
                    {current}/{total} THẺ
                </Text>
            </Flex>
            <Box w="full" h="14px" bg="bg.subtle" borderRadius="full" overflow="hidden" shadow="inner">
                <Box
                    h="full"
                    w={`${pct}%`}
                    bgGradient="to-r" gradientFrom="indigo.400" gradientTo="blue.500"
                    borderRadius="full"
                    transition="width 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
                />
            </Box>
        </Box>
    );
};

export default StudyProgress;
