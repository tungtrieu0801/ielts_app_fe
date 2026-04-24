import React, { useState } from "react";
import {
    Box, Flex, Text, Button, Textarea, Input, Spinner,
} from "@chakra-ui/react";
import {
    FiFileText, FiYoutube, FiArrowRight, FiAlertCircle,
    FiCommand, FiCornerDownLeft, FiDelete,
} from "react-icons/fi";
import { prepareText, prepareYoutube } from "../../../services/dictationApi.js";

const SHORTCUT_HINTS = [
    { key: "Ctrl", desc: "Nghe lại" },
    { key: "Enter", desc: "Nộp / Tiếp" },
    { key: "Tab", desc: "Chuyển ô" },
];

const InputStep = ({ onReady }) => {
    const [tab, setTab] = useState("text");
    const [textInput, setTextInput] = useState("");
    const [youtubeUrl, setYoutubeUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const tabs = [
        { key: "text", label: "📄 Đoạn văn" },
        { key: "youtube", label: "▶️ YouTube" },
    ];

    // Whitelist email youtube function
    const canShowYoutubeTab = () => {
        try {
            const raw = localStorage.getItem("auth-storage");
            console.log(raw);

            if (!raw) return false;

            const data = JSON.parse(raw);
            // log(data)

            return data?.state?.user?.email === "trieutungvp@gmail.com";
        } catch (err) {
            return false;
        }
    };

    // filer email
    const filteredTabs = tabs.filter(tab => {
        if (tab.key === "youtube") return canShowYoutubeTab();
        return true;
    })

    const handleSubmit = async () => {
        if (loading) return;
        setError("");
        setLoading(true);
        try {
            let res;
            if (tab === "text") {
                res = await prepareText(textInput);
            } else {
                res = await prepareYoutube(youtubeUrl);
            }
            onReady(res.data);
        } catch (err) {
            setError(
                err.response?.data?.error ||
                "Đã có lỗi xảy ra. Vui lòng thử lại."
            );
        } finally {
            setLoading(false);
        }
    };

    const isDisabled =
        loading ||
        (tab === "text" ? !textInput.trim() : !youtubeUrl.trim());

    return (
        <Box>
            {/* Page header */}
            <Box mb={8} textAlign="center">
                <Box
                    w="72px" h="72px" borderRadius="2xl"
                    bg="brand.muted" mx="auto" mb={4}
                    display="flex" alignItems="center" justifyContent="center"
                    fontSize="2xl"
                    boxShadow="0 0 40px var(--chakra-colors-brand-muted)"
                >
                    🎧
                </Box>
                <Text fontSize={{ base: "2xl", md: "4xl" }} fontWeight="extrabold" mb={2}>
                    Dictation
                </Text>
                <Text color="fg.muted" maxW="480px" mx="auto" fontSize="sm">
                    Luyện kỹ năng nghe – chép tiếng Anh theo chuẩn IELTS.
                    Dán đoạn văn hoặc link YouTube để bắt đầu.
                </Text>
            </Box>

            {/* Main card */}
            <Box
                bg="bg.panel" borderRadius="2xl" p={{ base: 5, md: 8 }}
                borderWidth="1px" borderColor="border.muted"
                shadow="sm"
            >
                {/* Tab bar */}
                <Flex
                    gap={1.5}
                    mb={6}
                    bg="bg.subtle"
                    p={1}
                    borderRadius="xl"
                >
                    {filteredTabs.map(({ key, label }) => (
                        <Flex
                            key={key}
                            flex={1}
                            align="center"
                            justify="center"
                            gap={2}
                            py={2.5}
                            borderRadius="lg"
                            cursor="pointer"
                            bg={tab === key ? "bg.panel" : "transparent"}
                            color={tab === key ? "brand.text" : "fg.muted"}
                            fontWeight={tab === key ? "700" : "500"}
                            fontSize="sm"
                            boxShadow={tab === key ? "sm" : "none"}
                            transition="all 0.2s ease"
                            onClick={() => {
                                setTab(key);
                                setError("");
                            }}
                        >
                            <Text>{label}</Text>
                        </Flex>
                    ))}
                </Flex>

                {/* Input area */}
                {tab === "text" ? (
                    <Textarea
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder={
                            `Dán đoạn văn IELTS Reading hoặc script tại đây...\n\n` +
                            `Ví dụ:\nThe global population has reached an unprecedented level, creating ` +
                            `numerous challenges for governments around the world. While economic ` +
                            `development has improved living standards in many regions, it has also ` +
                            `contributed to environmental degradation and social inequality.`
                        }
                        rows={10}
                        fontSize="sm"
                        borderRadius="xl"
                        resize="vertical"
                        lineHeight="1.8"
                    />
                ) : (
                    <Box>
                        <Input
                            value={youtubeUrl}
                            onChange={(e) => setYoutubeUrl(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && !isDisabled && handleSubmit()}
                            placeholder="https://www.youtube.com/watch?v=..."
                            borderRadius="xl"
                            size="lg"
                            fontSize="sm"
                        />
                        <Flex
                            align="flex-start" gap={2} mt={3} p={3}
                            bg="blue.50" _dark={{ bg: "blue.900/20" }}
                            borderRadius="lg" borderWidth="1px"
                            borderColor="blue.200" _dark={{ borderColor: "blue.800" }}
                        >
                            <Text fontSize="xs" color="blue.600" _dark={{ color: "blue.300" }}>
                                💡 Video cần có phụ đề tiếng Anh (auto-generated hoặc manual).
                                Hệ thống sẽ tự động lấy phụ đề và tạo bài luyện nghe.
                            </Text>
                        </Flex>
                    </Box>
                )}

                {/* Error */}
                {error && (
                    <Flex
                        align="center" gap={2} mt={4} p={3}
                        bg="red.50" _dark={{ bg: "red.900/20" }}
                        borderRadius="lg" borderWidth="1px"
                        borderColor="red.200" _dark={{ borderColor: "red.800" }}
                    >
                        <Box color="red.500" flexShrink={0}><FiAlertCircle size={16} /></Box>
                        <Text fontSize="sm" color="red.600" _dark={{ color: "red.300" }}>
                            {error}
                        </Text>
                    </Flex>
                )}

                {/* Submit button */}
                <Button
                    mt={6} w="full" size="lg"
                    colorPalette="blue"
                    onClick={handleSubmit}
                    disabled={isDisabled}
                >
                    {loading ? (
                        <Flex align="center" gap={2}>
                            <Spinner size="sm" />
                            <Text>Đang xử lý…</Text>
                        </Flex>
                    ) : (
                        <Flex align="center" gap={2}>
                            <Text>Tạo bài tập Dictation</Text>
                            <FiArrowRight />
                        </Flex>
                    )}
                </Button>
            </Box>

            {/* Keyboard shortcut guide */}
            <Box
                mt={5} p={5}
                bg="bg.subtle" borderRadius="xl"
                borderWidth="1px" borderColor="border.muted"
            >
                <Text fontWeight="semibold" fontSize="sm" mb={4} color="fg">
                    ⌨️ Phím tắt khi làm bài
                </Text>
                <Flex gap={6} flexWrap="wrap">
                    {SHORTCUT_HINTS.map(({ key, desc }) => (
                        <Flex key={key} align="center" gap={2}>
                            <Box
                                px={2.5} py={1}
                                bg="bg.panel" borderRadius="md"
                                borderWidth="1px" borderColor="border.strong"
                                fontSize="xs" fontWeight="bold" fontFamily="monospace"
                                boxShadow="0 2px 0 var(--chakra-colors-border-muted)"
                                color="fg"
                            >
                                {key}
                            </Box>
                            <Text fontSize="sm" color="fg.muted">{desc}</Text>
                        </Flex>
                    ))}
                </Flex>
            </Box>
        </Box>
    );
};

export default InputStep;
