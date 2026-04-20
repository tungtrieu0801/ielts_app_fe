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

                <Box w="full" mt={2}>
                    <Text fontSize="xs" fontWeight="bold" color="fg.subtle" mb={4} textTransform="uppercase" letterSpacing="wider">
                        Danh sách thẻ
                    </Text>
                    <Flex wrap="wrap" gap={2} justify="flex-start">
                        {Array.from({ length: total }).map((_, idx) => {
                            const isCompleted = idx < reviewedCount;
                            
                            return (
                                <Flex
                                    key={idx}
                                    w="36px" h="36px"
                                    align="center" justify="center"
                                    bg={isCompleted ? "green.100" : "red.50"}
                                    color={isCompleted ? "green.800" : "red.800"}
                                    _dark={{
                                        bg: isCompleted ? "green.900/60" : "red.900/40",
                                        color: isCompleted ? "green.300" : "red.300",
                                        borderColor: isCompleted ? "green.600" : "red.600"
                                    }}
                                    borderRadius="md"
                                    borderWidth="1px"
                                    borderColor={isCompleted ? "green.500" : "red.400"}
                                    fontSize="sm" fontWeight="bold"
                                    shadow="sm"
                                >
                                    {idx + 1}
                                </Flex>
                            );
                        })}
                    </Flex>
                </Box>
            </Flex>
        </Box>
    );
};

export default StudySidebarStats;
