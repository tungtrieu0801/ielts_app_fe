import React from "react";
import { Box, Flex, Text, Button, SimpleGrid } from "@chakra-ui/react";
import { FiRepeat, FiHome } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const StudyComplete = ({ reviewedCount, setId, setTitle }) => {
    const navigate = useNavigate();

    return (
        <Box
            bg="bg.panel"
            borderRadius="3xl"
            p={8}
            w="full" maxW="450px"
            shadow="2xl"
            borderWidth="1px" borderColor="border.subtle"
            textAlign="center"
            position="relative"
            overflow="hidden"
            mx={4}
        >
            {/* Luminous background blob */}
            <Box
                position="absolute" top="-50px" left="50%" transform="translateX(-50%)"
                w="150px" h="150px" bg="blue.400" opacity={0.2} filter="blur(40px)"
                borderRadius="full" pointerEvents="none"
            />

            <Flex direction="column" align="center" gap={5} position="relative" zIndex={1}>
                <Text fontSize="7xl" mb={-2}>🎉</Text>
                
                <Box>
                    <Text fontSize="2xl" fontWeight="900" letterSpacing="tight" mb={1}>
                        Học xong rồi!
                    </Text>
                    <Text color="fg.muted" fontSize="sm">
                        Bạn đã hoàn thành session học hôm nay
                    </Text>
                </Box>

                <Box
                    bg="bg.subtle" borderRadius="2xl" p={5} w="full"
                    borderWidth="1px" borderColor="border.muted"
                >
                    <Text fontSize="4xl" fontWeight="900" color="blue.500" mb={0} lineHeight="1">
                        {reviewedCount}
                    </Text>
                    <Text color="fg.muted" fontWeight="600" fontSize="sm" mt={1}>thẻ đã được hoàn thành</Text>
                    <Text fontSize="xs" color="fg.subtle" mt={3}>
                        Hệ thống SRS đã lên lịch ôn tập tối ưu cho bạn.
                    </Text>
                </Box>

                <Flex w="full" gap={3} mt={4} direction="column">
                    <Button
                        size="lg" w="full"
                        bg="linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)" color="white"
                        borderRadius="xl" fontWeight="bold"
                        onClick={() => navigate("/home")}
                        gap={2}
                        _hover={{ opacity: 0.9, transform: "translateY(-1px)" }} transition="all 0.2s"
                    >
                        <FiHome size={18} /> Về trang chủ
                    </Button>
                    <Button
                        size="md" w="full" variant="ghost"
                        borderRadius="xl" color="fg.muted"
                        onClick={() => navigate(`/sets/${setId}`)}
                        gap={2}
                    >
                        <FiRepeat size={16} /> Quay lại quản lý bộ từ
                    </Button>
                </Flex>
            </Flex>
        </Box>
    );
};

export default StudyComplete;
