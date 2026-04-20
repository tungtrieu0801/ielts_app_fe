import React from "react";
import { Box, Flex, Text, ProgressCircle } from "@chakra-ui/react";
import { FiPieChart } from "react-icons/fi";

const CustomProgressRing = ({ value, size = 130, strokeWidth = 12 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;

    return (
        <Box position="relative" w={`${size}px`} h={`${size}px`}>
            <Box as="svg" width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
                <Box
                    as="circle"
                    cx={size / 2} cy={size / 2} r={radius}
                    stroke="bg.subtle"
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                <Box
                    as="circle"
                    cx={size / 2} cy={size / 2} r={radius}
                    stroke="brand.solid"
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
                />
            </Box>
            <Flex
                position="absolute" top={0} left={0} w="full" h="full"
                align="center" justify="center" direction="column" gap={0}
            >
                <Text fontSize="xs" fontWeight="bold" color="fg.subtle" textTransform="uppercase" letterSpacing="wider">Tiến độ</Text>
                <Text fontSize="3xl" fontWeight="black" color="fg" mt={-1} lineHeight="none">{value}%</Text>
            </Flex>
        </Box>
    );
};

const StudySidebarStats = ({ reviewedCount, queueLength }) => {
    const total = queueLength;
    const remaining = Math.max(0, total - reviewedCount);
    const progressPerc = total === 0 ? 0 : Math.round((reviewedCount / total) * 100);

    return (
        <Box
            bg="bg.panel" borderRadius="3xl" p={6}
            borderWidth="1px" borderColor="border.subtle" shadow="xl"
            position="sticky" top="100px"
        >
            <Flex align="center" gap={2} mb={8} color="brand.solid">
                <FiPieChart size={18} />
                <Text fontWeight="bold" fontSize="sm" textTransform="uppercase" letterSpacing="wider">
                    Thống kê
                </Text>
            </Flex>

            <Flex direction="column" align="center" justify="center" gap={6}>
                <CustomProgressRing value={progressPerc} />

                <Flex w="full" gap={3} mt={2}>
                    <Box
                        bg="green.50" _dark={{ bg: "green.900" }}
                        p={4} borderRadius="2xl" flex={1} textAlign="center"
                    >
                        <Text fontSize="3xl" fontWeight="black" color="green.600" _dark={{ color: "green.300" }}>{reviewedCount}</Text>
                        <Text fontSize="10px" fontWeight="bold" textTransform="uppercase" letterSpacing="wider" color="green.600" _dark={{ color: "green.300" }} opacity={0.8} mt={1}>Đã học</Text>
                    </Box>
                    <Box
                        bg="blue.50" _dark={{ bg: "blue.900" }}
                        p={4} borderRadius="2xl" flex={1} textAlign="center"
                    >
                        <Text fontSize="3xl" fontWeight="black" color="blue.600" _dark={{ color: "blue.300" }}>{remaining}</Text>
                        <Text fontSize="10px" fontWeight="bold" textTransform="uppercase" letterSpacing="wider" color="blue.600" _dark={{ color: "blue.300" }} opacity={0.8} mt={1}>Còn lại</Text>
                    </Box>
                </Flex>
            </Flex>
        </Box>
    );
};

export default StudySidebarStats;
