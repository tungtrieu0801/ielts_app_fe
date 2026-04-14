import React from "react";
import { Box, Flex, Text, Button, SimpleGrid } from "@chakra-ui/react";
import { FiRepeat, FiHome } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const StudyComplete = ({ reviewedCount, setId, setTitle }) => {
    const navigate = useNavigate();

    return (
        <Flex direction="column" align="center" justify="center" minH="60vh" gap={6}>
            <Text fontSize="6xl">🎉</Text>
            <Box textAlign="center">
                <Text fontSize="3xl" fontWeight="extrabold" mb={2}>
                    Học xong rồi!
                </Text>
                <Text color="fg.muted" fontSize="lg">
                    Bạn đã hoàn thành session học hôm nay
                </Text>
            </Box>

            <Box
                bg="bg.panel" borderRadius="2xl" borderWidth="1px"
                borderColor="border.muted" p={8} textAlign="center" w="full" maxW="400px"
                shadow="lg"
            >
                <Text fontSize="4xl" fontWeight="extrabold" color="blue.500" mb={1}>
                    {reviewedCount}
                </Text>
                <Text color="fg.muted">thẻ đã được xem xét</Text>
                <Text fontSize="sm" color="fg.subtle" mt={3}>
                    Hệ thống SRS đã lên lịch ôn tập tối ưu cho bạn. Hẹn gặp lại!
                </Text>
            </Box>

            <Flex gap={3} mt={2}>
                <Button
                    variant="outline" size="md" onClick={() => navigate(`/sets/${setId}`)}
                    gap={2}
                >
                    <FiRepeat /> Học lại
                </Button>
                <Button
                    colorPalette="blue" size="md" onClick={() => navigate("/home")}
                    gap={2}
                >
                    <FiHome /> Về trang chủ
                </Button>
            </Flex>
        </Flex>
    );
};

export default StudyComplete;
