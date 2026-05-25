import React, { useState, useEffect, useRef } from "react";
import {
    Box, Flex, Text, SimpleGrid, Button, Input, Textarea, Spinner,
    IconButton, Badge, Portal, Grid, GridItem
} from "@chakra-ui/react";
import {
    FiPlus, FiTrash2, FiEdit2, FiClock, FiCheckCircle, FiBookOpen,
    FiShuffle, FiArrowLeft, FiSend, FiAward, FiEye, FiMic
} from "react-icons/fi";
import BaseLayout from "../../../layouts/BaseLayout.jsx";
import { useSpeakingStore } from "../../../stores/useSpeakingStore.js";
import { useAuthStore } from "../../../stores/useAuthStore.js";

// ─── ADD/EDIT SPEAKING TOPIC MODAL ──────────────────────────────────────────
const TopicModal = ({ onClose, onSave, initialData = null }) => {
    const [title, setTitle] = useState(initialData?.title || "");
    const [partType, setPartType] = useState(initialData?.partType || 1);
    const [prompt, setPrompt] = useState(initialData?.prompt || "");
    const [sampleAnswer, setSampleAnswer] = useState(initialData?.sampleAnswer || "");
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!title.trim() || !prompt.trim() || !sampleAnswer.trim()) {
            alert("Vui lòng điền đầy đủ các thông tin bắt buộc!");
            return;
        }

        setSaving(true);
        try {
            await onSave({
                title,
                partType: Number(partType),
                prompt,
                sampleAnswer
            });
            onClose();
        } catch (err) {
            alert(err.message || "Không thể lưu đề speaking!");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box
            position="fixed" inset={0} zIndex={100}
            bg="blackAlpha.600" display="flex" alignItems="center" justifyContent="center"
            onClick={onClose}
        >
            <Box
                bg="bg.panel" borderRadius="2xl" p={8} w="full" maxW="600px"
                mx={4} shadow="2xl" onClick={(e) => e.stopPropagation()}
                maxH="90vh" overflowY="auto"
                borderWidth="1px" borderColor="border.muted"
            >
                <Text fontSize="xl" fontWeight="800" mb={6} color="blue.700" _dark={{ color: "blue.300" }}>
                    {initialData ? "✏️ Chỉnh sửa đề Speaking" : "🎙️ Thêm đề Speaking mới"}
                </Text>

                <Box mb={4}>
                    <Text fontSize="sm" fontWeight="bold" mb={2}>Tiêu đề chủ đề *</Text>
                    <Input
                        placeholder="VD: Speaking Part 2 - A memorable journey"
                        value={title} onChange={(e) => setTitle(e.target.value)}
                        borderRadius="xl"
                    />
                </Box>

                <Box mb={4}>
                    <Text fontSize="sm" fontWeight="bold" mb={2}>Phân loại Speaking Part *</Text>
                    <Flex gap={3}>
                        {[1, 2, 3].map((p) => (
                            <Button
                                key={p} flex={1} borderRadius="xl"
                                variant={partType === p ? "solid" : "outline"}
                                colorPalette={p === 1 ? "blue" : p === 2 ? "purple" : "teal"}
                                onClick={() => setPartType(p)}
                            >
                                Part {p}
                            </Button>
                        ))}
                    </Flex>
                </Box>

                <Box mb={4}>
                    <Text fontSize="sm" fontWeight="bold" mb={2}>Câu hỏi / Đề bài chi tiết (Prompt) *</Text>
                    <Textarea
                        placeholder="Nhập chi tiết các câu hỏi gợi ý (Part 1, 3) hoặc nội dung Cue Card (Part 2)..."
                        value={prompt} onChange={(e) => setPrompt(e.target.value)}
                        rows={6} borderRadius="xl"
                    />
                </Box>

                <Box mb={6}>
                    <Text fontSize="sm" fontWeight="bold" mb={2}>Bài mẫu / Dàn ý mẫu tham khảo *</Text>
                    <Textarea
                        placeholder="Nhập câu trả lời mẫu chuẩn mực, từ vựng đắt giá để tham khảo..."
                        value={sampleAnswer} onChange={(e) => setSampleAnswer(e.target.value)}
                        rows={8} borderRadius="xl"
                    />
                </Box>

                <Flex gap={3} justify="flex-end">
                    <Button variant="ghost" onClick={onClose} borderRadius="xl">Hủy</Button>
                    <Button
                        colorPalette={partType === 1 ? "blue" : partType === 2 ? "purple" : "teal"}
                        onClick={handleSave}
                        loading={saving}
                        borderRadius="xl"
                        px={6}
                    >
                        {initialData ? "Lưu thay đổi" : "Tạo đề bài"}
                    </Button>
                </Flex>
            </Box>
        </Box>
    );
};

// ─── STOPWATCH PRACTICE VIEW ───────────────────────────────────────────────
const PracticeView = ({ topic, onBack }) => {
    const { submitPractice } = useSpeakingStore();
    const [draftText, setDraftText] = useState("");
    const [seconds, setSeconds] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [sampleAnswer, setSampleAnswer] = useState("");

    // Mic recording states
    const [showMicModal, setShowMicModal] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [micTranscript, setMicTranscript] = useState("");
    const recognitionRef = useRef(null);

    // Stopwatch logic
    useEffect(() => {
        let timer = null;
        if (isTimerRunning && !submitted) {
            timer = setInterval(() => {
                setSeconds((prev) => prev + 1);
            }, 1000);
        } else {
            clearInterval(timer);
        }
        return () => clearInterval(timer);
    }, [isTimerRunning, submitted]);

    const formatTime = (secs) => {
        const m = Math.floor(secs / 60).toString().padStart(2, "0");
        const s = (secs % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    // Speech-to-text handlers
    const startRecording = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Trình duyệt của bạn không hỗ trợ tính năng nhận diện giọng nói (STT). Vui lòng dùng Google Chrome hoặc Microsoft Edge.");
            return;
        }

        try {
            const rec = new SpeechRecognition();
            rec.continuous = true;
            rec.interimResults = true;
            rec.lang = "en-US"; // IELTS standard English

            rec.onstart = () => {
                setIsRecording(true);
            };

            rec.onerror = (event) => {
                console.error("Mic error:", event.error);
                if (event.error === "not-allowed") {
                    alert("Không có quyền truy cập Microphone. Vui lòng kiểm tra cài đặt mic của trình duyệt!");
                }
                setIsRecording(false);
            };

            rec.onend = () => {
                setIsRecording(false);
            };

            rec.onresult = (event) => {
                let finalTranscript = "";
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript + " ";
                    }
                }
                if (finalTranscript) {
                    setMicTranscript((prev) => prev + finalTranscript);
                }
            };

            recognitionRef.current = rec;
            rec.start();
        } catch (err) {
            console.error("Speech Recognition failed", err);
            alert("Không thể khởi động bộ thu âm microphone!");
        }
    };

    const stopRecording = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setIsRecording(false);
    };

    const handleApplyTranscript = () => {
        if (micTranscript.trim()) {
            setDraftText((prev) => {
                const spacer = prev.trim() ? "\n" : "";
                return prev + spacer + micTranscript.trim();
            });
        }
        stopRecording();
        setMicTranscript("");
        setShowMicModal(false);
    };

    const handleCloseMicModal = () => {
        stopRecording();
        setMicTranscript("");
        setShowMicModal(false);
    };

    const handleSubmit = async () => {
        if (!draftText.trim()) {
            alert("Vui lòng ghi chú hoặc phác thảo một số từ khóa chính trước khi nộp!");
            return;
        }

        if (!window.confirm("Bạn có chắc muốn nộp bài? Đồng hồ bấm giờ luyện nói sẽ dừng lại.")) return;

        setSubmitting(true);
        try {
            const res = await submitPractice(topic._id, draftText, seconds);
            setSampleAnswer(res.sampleAnswer || topic.sampleAnswer);
            setIsTimerRunning(false);
            setSubmitted(true);
        } catch (err) {
            alert(err.message || "Ghi nhận luyện tập thất bại!");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        if (draftText.length > 30 && !window.confirm("Tiến trình chuẩn bị của bạn sẽ bị hủy bỏ. Bạn muốn thoát?")) return;
        onBack();
    };

    return (
        <Box>
            {/* Top Navigation */}
            <Flex align="center" justify="space-between" mb={5}>
                <Button variant="ghost" onClick={handleCancel} gap={2} color="fg.muted" borderRadius="xl">
                    <FiArrowLeft /> {submitted ? "Quay lại danh sách" : "Hủy luyện tập"}
                </Button>
                <Badge
                    colorPalette={topic.partType === 1 ? "blue" : topic.partType === 2 ? "purple" : "teal"}
                    px={3} py={1} borderRadius="lg" fontSize="xs" fontWeight="bold"
                >
                    IELTS Speaking Part {topic.partType}
                </Badge>
            </Flex>

            {/* Workspace Grid */}
            <Grid templateColumns={{ base: "1fr", lg: "1.1fr 1fr" }} gap={6} alignItems="stretch">
                
                {/* Left Side: Topic / Prompt */}
                <GridItem>
                    <Box
                        bg="bg.panel" borderRadius="2xl" p={6} height="100%"
                        borderWidth="1px" borderColor="border.muted"
                        display="flex" flexDirection="column" gap={4}
                    >
                        <Text fontSize="xl" fontWeight="950" color="fg">
                            {topic.title}
                        </Text>
                        
                        <Box h="1px" bg="border.muted" opacity={0.6} />

                        {/* Prompt details */}
                        <Box flex={1} overflowY="auto" maxH="380px" pr={2}>
                            <Text fontWeight="bold" mb={2} color="blue.700" _dark={{ color: "blue.300" }}>Câu hỏi đề bài:</Text>
                            {topic.prompt.split("\n").map((para, i) => (
                                <Text key={i} mb={3} lineHeight="1.7" fontSize="sm" color="fg.muted">
                                    {para}
                                </Text>
                            ))}
                        </Box>

                        {/* Collapsible Speaking Tips */}
                        <Box p={4} borderRadius="xl" bg="bg.subtle" borderWidth="1px" borderColor="border.muted">
                            <Flex align="center" gap={2} mb={1}>
                                <Text fontSize="xs">💡</Text>
                                <Text fontSize="xs" fontWeight="bold" color="fg">Mẹo IELTS Speaking Part {topic.partType}:</Text>
                            </Flex>
                            <Text fontSize="11px" color="fg.muted" lineHeight="1.5">
                                {topic.partType === 1 && "Part 1 là cuộc đối thoại ngắn. Trả lời trực tiếp vào trọng tâm từ 2-4 câu, mở rộng ý kiến tự nhiên bằng cách nêu lý do hoặc ví dụ."}
                                {topic.partType === 2 && "Part 2 (Cue Card) cho bạn đúng 1 phút để chuẩn bị nháp dàn ý. Bạn phải nói liên tục từ 1-2 phút. Hãy phân chia ý nói theo thứ tự gợi ý trên đề bài."}
                                {topic.partType === 3 && "Part 3 yêu cầu trả lời học thuật và chuyên sâu. Sử dụng cấu trúc (Point - Explain - Example - Conclude) để bài nói logic, chặt chẽ."}
                            </Text>
                        </Box>
                    </Box>
                </GridItem>

                {/* Right Side: Drafting Canvas */}
                <GridItem>
                    <Box
                        bg="bg.panel" borderRadius="2xl" p={6} height="100%"
                        borderWidth="1px" borderColor="border.muted"
                        display="flex" flexDirection="column" gap={4}
                        boxShadow="lg"
                    >
                        {/* Stats Bar */}
                        <Flex align="center" justify="space-between" bg="bg.subtle" p={3} borderRadius="xl" borderWidth="1px" borderColor="border.muted">
                            <Flex align="center" gap={2}>
                                <Box as={FiClock} color={submitted ? "gray.400" : "orange.500"} fontSize="md" />
                                <Text fontWeight="900" fontSize="md" color="fg">
                                    {formatTime(seconds)}
                                </Text>
                                {!submitted && (
                                    <Box w="6px" h="6px" borderRadius="full" bg="red.500" animation="pulse 1.5s infinite" />
                                )}
                            </Flex>
                            <Badge colorPalette={submitted ? "gray" : "orange"} size="sm" borderRadius="md" fontWeight="bold">
                                {submitted ? "ĐÃ NỘP" : "ĐANG CHUẨN BỊ NÓI"}
                            </Badge>
                        </Flex>

                        {/* Workspace drafting */}
                        {!submitted ? (
                            <>
                                <Box flex={1} position="relative">
                                    <Textarea
                                        placeholder={`Phác thảo dàn ý / Note các từ khóa nói tại đây...\n(Ví dụ: Ghi nhanh Mindmap, Keywords nói để lúc trả lời nhìn vào nói cho trôi chảy và mượt mà hơn).`}
                                        value={draftText}
                                        onChange={(e) => setDraftText(e.target.value)}
                                        height="350px"
                                        borderRadius="xl"
                                        p={4}
                                        resize="none"
                                        fontSize="sm"
                                        lineHeight="1.7"
                                        focusBorderColor={topic.partType === 1 ? "blue.500" : topic.partType === 2 ? "purple.500" : "teal.500"}
                                    />
                                </Box>

                                <Flex gap={3}>
                                    <Button
                                        flex={1}
                                        colorPalette={topic.partType === 1 ? "blue" : topic.partType === 2 ? "purple" : "teal"}
                                        size="lg"
                                        borderRadius="xl"
                                        fontWeight="bold"
                                        gap={2}
                                        onClick={handleSubmit}
                                        loading={submitting}
                                        boxShadow="md"
                                    >
                                        <FiSend size={16} /> Hoàn thành chuẩn bị & Xem bài mẫu
                                    </Button>

                                    <Button
                                        colorPalette="orange"
                                        size="lg"
                                        borderRadius="xl"
                                        fontWeight="bold"
                                        gap={2}
                                        onClick={() => { setShowMicModal(true); setMicTranscript(""); }}
                                        boxShadow="md"
                                    >
                                        <FiMic size={16} /> Nói thu âm (STT)
                                    </Button>
                                </Flex>
                            </>
                        ) : (
                            <Box flex={1} display="flex" flexDirection="column" gap={4}>
                                <Box bg="green.50" p={4} borderRadius="xl" borderWidth="1px" borderColor="green.200" _dark={{ bg: "green.950/20", borderColor: "green.800" }}>
                                    <Flex align="center" gap={3}>
                                        <Box as={FiCheckCircle} color="green.500" fontSize="xl" />
                                        <Box>
                                            <Text fontWeight="bold" color="green.800" _dark={{ color: "green.300" }} fontSize="sm">
                                                Luyện nói hoàn tất!
                                            </Text>
                                            <Text fontSize="xs" color="fg.muted">
                                                Thời gian phác thảo/chuẩn bị nói: {Math.floor(seconds / 60)}p {seconds % 60}s.
                                            </Text>
                                        </Box>
                                    </Flex>
                                </Box>

                                <Box flex={1} overflowY="auto" maxH="280px" p={4} bg="bg.subtle" borderRadius="xl" borderWidth="1px" borderColor="border.muted">
                                    <Text fontWeight="bold" mb={2} color="fg" fontSize="xs">DÀN Ý CỦA BẠN:</Text>
                                    {draftText.split("\n").map((para, i) => (
                                        <Text key={i} mb={3} lineHeight="1.7" fontSize="xs" color="fg.muted">
                                            {para}
                                        </Text>
                                    ))}
                                </Box>

                                <Button
                                    colorPalette="gray" size="md" borderRadius="xl"
                                    onClick={onBack} fontWeight="bold" mt={2}
                                >
                                    Quay lại danh sách đề
                                </Button>
                            </Box>
                        )}
                    </Box>

                    {/* Comparison Sample speech script underneath when submitted */}
                    {submitted && (
                        <Box
                            mt={8} bg="bg.panel" borderRadius="2xl" p={7}
                            borderWidth="1.5px" borderColor="blue.400"
                            shadow="lg"
                        >
                            <Flex align="center" gap={3} mb={4}>
                                <Flex
                                    w="40px" h="40px" borderRadius="xl" bg="blue.100" _dark={{ bg: "blue.900" }}
                                    align="center" justify="center" fontSize="xl"
                                >
                                    🎙️
                                </Flex>
                                <Box>
                                    <Text fontWeight="900" fontSize="md" color="fg">
                                        Bài trả lời mẫu (Sample Answer Script)
                                    </Text>
                                    <Text fontSize="xs" color="fg.muted">
                                        Chuẩn nói tự nhiên & cấu trúc Band cao
                                    </Text>
                                </Box>
                            </Flex>

                            <Box h="1px" bg="border.muted" mb={4} opacity={0.6} />

                            <Box overflowY="auto" maxH="450px" pr={2} p={4} bg="bg.subtle" borderRadius="xl" borderWidth="1px" borderColor="border.muted">
                                {sampleAnswer.split("\n").map((para, i) => (
                                    <Text key={i} mb={4} lineHeight="1.8" fontSize="sm" color="fg" style={{ textIndent: para.trim() ? "1em" : "0" }}>
                                        {para}
                                    </Text>
                                ))}
                            </Box>
                        </Box>
                    )}
                </GridItem>
            </Grid>

            {/* Microphone Popup Portal STT */}
            {showMicModal && (
                <Portal>
                    <Box
                        position="fixed" inset={0} zIndex={150}
                        bg="blackAlpha.700" display="flex" alignItems="center" justifyContent="center"
                        onClick={handleCloseMicModal}
                    >
                        <Box
                            bg="bg.panel" borderRadius="2xl" p={7} w="full" maxW="480px"
                            mx={4} shadow="2xl" onClick={(e) => e.stopPropagation()}
                            borderWidth="1px" borderColor="border.muted"
                            textAlign="center"
                        >
                            <Text fontSize="lg" fontWeight="950" mb={4} color="blue.700" _dark={{ color: "blue.300" }}>
                                🎙️ Luyện Nói & Nhận Diện Giọng Đọc
                            </Text>
                            
                            <Text fontSize="xs" color="fg.muted" mb={6}>
                                Hệ thống sẽ thu giọng nói tiếng Anh của bạn qua Microphone và tự động chuyển đổi thành văn bản.
                            </Text>

                            {/* Pulse mic icon */}
                            <Flex justify="center" align="center" mb={6} position="relative" h="100px">
                                {isRecording && (
                                    <>
                                        <style dangerouslySetInnerHTML={{ __html: `
                                            @keyframes ripple {
                                                0% { transform: scale(0.95); opacity: 0.5; }
                                                50% { transform: scale(1.6); opacity: 0.3; }
                                                100% { transform: scale(2.2); opacity: 0; }
                                            }
                                            .mic-pulse {
                                                position: absolute; width: 60px; height: 60px;
                                                border-radius: 50%; background: var(--chakra-colors-red-500);
                                                animation: ripple 2s infinite ease-out;
                                                pointer-events: none;
                                            }
                                        ` }} />
                                        <Box className="mic-pulse" />
                                        <Box className="mic-pulse" style={{ animationDelay: "0.6s" }} />
                                        <Box className="mic-pulse" style={{ animationDelay: "1.2s" }} />
                                    </>
                                )}
                                <IconButton
                                    size="2xl"
                                    borderRadius="full"
                                    colorPalette={isRecording ? "red" : "blue"}
                                    onClick={isRecording ? stopRecording : startRecording}
                                    _hover={{ transform: "scale(1.08)" }}
                                    transition="all 0.2s"
                                    boxShadow="lg"
                                >
                                    <FiMic size={24} />
                                </IconButton>
                            </Flex>

                            <Text fontSize="sm" fontWeight="bold" mb={4} color={isRecording ? "red.500" : "fg"}>
                                {isRecording ? "🔴 Đang nghe giọng nói của bạn... Hãy nói tiếng Anh." : "Nhấp vào mic để bắt đầu nói"}
                            </Text>

                            {/* Live Transcript Preview Box */}
                            <Box
                                p={4} bg="bg.subtle" borderRadius="xl" borderWidth="1px" borderColor="border.muted"
                                minH="100px" maxH="180px" overflowY="auto" textAlign="left" mb={6}
                            >
                                {micTranscript ? (
                                    <Text fontSize="sm" color="fg" fontStyle="normal" lineHeight="1.6">
                                        {micTranscript}
                                    </Text>
                                ) : (
                                    <Text fontSize="sm" color="gray.400" fontStyle="italic">
                                        Lời nói tiếng Anh của bạn sẽ được hiển thị tại đây theo thời gian thực...
                                    </Text>
                                )}
                            </Box>

                            {/* Footer buttons */}
                            <Flex gap={3} justify="center">
                                <Button variant="ghost" onClick={handleCloseMicModal} borderRadius="xl">
                                    Hủy
                                </Button>
                                <Button
                                    colorPalette="green"
                                    borderRadius="xl"
                                    onClick={handleApplyTranscript}
                                    disabled={!micTranscript.trim()}
                                    gap={2}
                                >
                                    <FiCheckCircle size={15} /> Điền vào khung nháp
                                </Button>
                            </Flex>
                        </Box>
                    </Box>
                </Portal>
            )}
        </Box>
    );
};

// ─── MAIN SPEAKING PAGE COMPONENT ───────────────────────────────────────────
const SpeakingPage = () => {
    const {
        topics, attempts, loading, fetchTopics, fetchAttempts,
        addTopic, editTopic, removeTopic
    } = useSpeakingStore();
    const { user } = useAuthStore();

    const [activeTab, setActiveTab] = useState("part1"); // "part1" | "part2" | "part3" | "history"
    const [activePracticeTopic, setActivePracticeTopic] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingTopic, setEditingTopic] = useState(null);
    const [selectedAttempt, setSelectedAttempt] = useState(null);

    const isAdmin = user?.email?.toLowerCase() === "trieutungvp@gmail.com" || user?.email?.toLowerCase() === "dev@ielts-vocab.local";

    useEffect(() => {
        fetchTopics();
        fetchAttempts();
    }, []);

    const handleRandomPractice = async () => {
        let type = 1;
        if (activeTab === "part2") type = 2;
        if (activeTab === "part3") type = 3;
        
        const matching = topics.filter(t => t.partType === type);

        if (matching.length === 0) {
            alert("Hiện tại không có đề Speaking nào khả dụng trong mục này để ôn random!");
            return;
        }

        const randomIdx = Math.floor(Math.random() * matching.length);
        setActivePracticeTopic(matching[randomIdx]);
    };

    const handleDeleteTopic = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm("Bạn có chắc chắn muốn xóa đề Speaking này? Lịch sử chuẩn bị của bạn đối với đề này cũng sẽ bị xóa.")) return;
        try {
            await removeTopic(id);
            alert("Xóa đề thành công!");
        } catch (err) {
            alert("Không thể xóa đề bài!");
        }
    };

    const handleSaveTopic = async (payload) => {
        if (editingTopic) {
            await editTopic(editingTopic._id, payload);
            alert("Cập nhật đề Speaking thành công!");
        } else {
            await addTopic(payload);
            alert("Tạo đề Speaking mới thành công!");
        }
    };

    // Filter topics based on active speaking part tab
    const displayedTopics = topics.filter(t => {
        if (activeTab === "part1") return t.partType === 1;
        if (activeTab === "part2") return t.partType === 2;
        if (activeTab === "part3") return t.partType === 3;
        return false;
    });

    if (activePracticeTopic) {
        return (
            <BaseLayout>
                <PracticeView
                    topic={activePracticeTopic}
                    onBack={() => setActivePracticeTopic(null)}
                />
            </BaseLayout>
        );
    }

    return (
        <BaseLayout>
            <Box maxW="1200px" mx="auto">
                
                {/* Header Banner */}
                <Box
                    bg="linear-gradient(135deg, #111827 0%, #1f2937 100%)"
                    borderRadius="2xl" p={6} mb={6} color="white"
                    position="relative" overflow="hidden" shadow="md"
                    borderWidth="1px" borderColor="gray.800"
                >
                    <Box position="absolute" top="-30px" right="-30px" w="180px" h="180px" bg="whiteAlpha.100" borderRadius="full" filter="blur(30px)" />
                    <Flex justify="space-between" align="center" direction={{ base: "column", md: "row" }} gap={4}>
                        <Box>
                            <Text fontSize="2xl" fontWeight="950" letterSpacing="-0.5px">🎙️ IELTS Speaking Templates</Text>
                            <Text fontSize="xs" opacity={0.8} mt={1}>Phác thảo dàn ý, ghi nhớ từ vựng đắt giá và rèn luyện phản xạ Speaking Part 1, 2, 3.</Text>
                        </Box>
                        
                        <Flex gap={3}>
                            {activeTab !== "history" && (
                                <Button
                                    onClick={handleRandomPractice}
                                    colorPalette="orange" size="md" borderRadius="xl" gap={2}
                                    fontWeight="bold" _hover={{ transform: "translateY(-2px)" }}
                                    transition="all 0.2s"
                                >
                                    <FiShuffle size={14} /> Ôn random đề
                                </Button>
                            )}

                            {isAdmin && (
                                <Button
                                    onClick={() => { setEditingTopic(null); setShowModal(true); }}
                                    colorPalette="green" size="md" borderRadius="xl" gap={2}
                                    fontWeight="bold" _hover={{ transform: "translateY(-2px)" }}
                                    transition="all 0.2s"
                                >
                                    <FiPlus size={14} /> Thêm đề mới
                                </Button>
                            )}
                        </Flex>
                    </Flex>
                </Box>

                {/* Navigation Tab Bar */}
                <Flex gap={2} mb={6} borderBottomWidth="1px" borderColor="border.muted" pb={3} flexWrap="wrap">
                    <Button
                        onClick={() => setActiveTab("part1")}
                        variant={activeTab === "part1" ? "solid" : "ghost"}
                        colorPalette="blue" borderRadius="xl" size="sm" fontWeight="bold"
                    >
                        💬 Part 1 (Short Answer)
                    </Button>
                    <Button
                        onClick={() => setActiveTab("part2")}
                        variant={activeTab === "part2" ? "solid" : "ghost"}
                        colorPalette="purple" borderRadius="xl" size="sm" fontWeight="bold"
                    >
                        📋 Part 2 (Cue Card)
                    </Button>
                    <Button
                        onClick={() => setActiveTab("part3")}
                        variant={activeTab === "part3" ? "solid" : "ghost"}
                        colorPalette="teal" borderRadius="xl" size="sm" fontWeight="bold"
                    >
                        🧠 Part 3 (In-depth)
                    </Button>
                    <Button
                        onClick={() => setActiveTab("history")}
                        variant={activeTab === "history" ? "solid" : "ghost"}
                        colorPalette="gray" borderRadius="xl" size="sm" fontWeight="bold" gap={1.5}
                    >
                        <FiClock size={13} /> Lịch sử phác thảo ({attempts.length})
                    </Button>
                </Flex>

                {/* ─── PARTS 1, 2, 3: QUESTIONS LIST ─── */}
                {activeTab !== "history" && (
                    <>
                        {loading && topics.length === 0 ? (
                            <Flex justify="center" py={12}>
                                <Spinner size="xl" color="blue.500" />
                            </Flex>
                        ) : displayedTopics.length === 0 ? (
                            <Box py={16} textAlign="center" bg="bg.panel" borderRadius="2xl" borderWidth="1px" borderColor="border.muted">
                                <Text fontSize="3xl" mb={3}>🎙️</Text>
                                <Text fontSize="md" fontWeight="bold" color="fg">Kho đề speaking trống</Text>
                                <Text fontSize="xs" color="fg.muted" mt={1}>Chưa có đề luyện nói nào được thiết lập trong part này.</Text>
                            </Box>
                        ) : (
                            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={5}>
                                {displayedTopics.map((topic) => {
                                    let c = "blue";
                                    if (topic.partType === 2) c = "purple";
                                    if (topic.partType === 3) c = "teal";
                                    return (
                                        <Box
                                            key={topic._id} bg="bg.panel" borderRadius="2xl" p={5}
                                            borderWidth="1px" borderColor="border.muted"
                                            display="flex" flexDirection="column" justifyContent="space-between"
                                            transition="all 0.3s"
                                            _hover={{ transform: "translateY(-4px)", shadow: "lg", borderColor: `${c}.400` }}
                                            cursor="pointer"
                                            onClick={() => setActivePracticeTopic(topic)}
                                        >
                                            <Box>
                                                {/* Card top */}
                                                <Flex justify="space-between" align="center" mb={3}>
                                                    <Badge colorPalette={c} variant="subtle" px={2} py={0.5} borderRadius="md" fontWeight="bold">
                                                        Part {topic.partType}
                                                    </Badge>
                                                    
                                                    {/* Admin actions */}
                                                    {isAdmin && (
                                                        <Flex gap={1} onClick={(e) => e.stopPropagation()}>
                                                            <IconButton
                                                                size="xs" variant="ghost" colorPalette="gray" borderRadius="full"
                                                                _hover={{ bg: "bg.subtle" }}
                                                                onClick={() => { setEditingTopic(topic); setShowModal(true); }}
                                                            >
                                                                <FiEdit2 size={12} />
                                                            </IconButton>
                                                            <IconButton
                                                                size="xs" variant="ghost" colorPalette="red" borderRadius="full"
                                                                _hover={{ bg: "red.50", color: "red.600" }}
                                                                onClick={(e) => handleDeleteTopic(topic._id, e)}
                                                            >
                                                                <FiTrash2 size={12} />
                                                            </IconButton>
                                                        </Flex>
                                                    )}
                                                </Flex>

                                                <Text fontWeight="800" fontSize="md" color="fg" mb={2} noOfLines={1}>
                                                    {topic.title}
                                                </Text>
                                                
                                                <Text color="fg.muted" fontSize="xs" mb={4} lineHeight="1.6" noOfLines={3}>
                                                    {topic.prompt}
                                                </Text>
                                            </Box>

                                            <Button
                                                w="full" size="md" colorPalette={c} borderRadius="xl" gap={2} mt={2}
                                                variant="subtle" fontWeight="bold"
                                                onClick={(e) => { e.stopPropagation(); setActivePracticeTopic(topic); }}
                                            >
                                                <FiMic size={14} /> Chuẩn bị đề nói
                                            </Button>
                                        </Box>
                                    );
                                })}
                            </SimpleGrid>
                        )}
                    </>
                )}

                {/* ─── TAB 4: HISTORY SPEAKING PREPARATIONS ─── */}
                {activeTab === "history" && (
                    <Box bg="bg.panel" borderRadius="2xl" p={6} borderWidth="1px" borderColor="border.muted">
                        {loading && attempts.length === 0 ? (
                            <Flex justify="center" py={8}>
                                <Spinner size="lg" color="teal.500" />
                            </Flex>
                        ) : attempts.length === 0 ? (
                            <Box py={12} textAlign="center">
                                <Text fontSize="4xl" mb={2}>⏱️</Text>
                                <Text fontSize="md" fontWeight="bold">Bạn chưa chuẩn bị bài nói nào</Text>
                                <Text fontSize="xs" color="fg.muted" mt={1}>Hãy chọn một đề trong danh sách và nháp dàn ý bài nói nhé!</Text>
                            </Box>
                        ) : (
                            <Box overflowX="auto">
                                <Box as="table" w="full" style={{ borderCollapse: "collapse" }}>
                                    <thead>
                                        <tr style={{ borderBottom: "1px solid var(--chakra-colors-border-muted)" }}>
                                            <th style={{ textAlign: "left", padding: "12px", fontSize: "12px", color: "var(--chakra-colors-fg-muted)" }}>ĐỀ SPEAKING</th>
                                            <th style={{ textAlign: "left", padding: "12px", fontSize: "12px", color: "var(--chakra-colors-fg-muted)" }}>PHÂN LOẠI</th>
                                            <th style={{ textAlign: "center", padding: "12px", fontSize: "12px", color: "var(--chakra-colors-fg-muted)" }}>THỜI GIAN NHÁP</th>
                                            <th style={{ textAlign: "right", padding: "12px", fontSize: "12px", color: "var(--chakra-colors-fg-muted)" }}>NGÀY LUYỆN TẬP</th>
                                            <th style={{ textAlign: "right", padding: "12px", fontSize: "12px", color: "var(--chakra-colors-fg-muted)" }}>HÀNH ĐỘNG</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {attempts.map((attempt) => {
                                            const topicInfo = attempt.topicId || {};
                                            const m = Math.floor(attempt.timeSpentSeconds / 60);
                                            const s = attempt.timeSpentSeconds % 60;
                                            let c = "blue";
                                            if (topicInfo.partType === 2) c = "purple";
                                            if (topicInfo.partType === 3) c = "teal";
                                            
                                            return (
                                                <tr
                                                    key={attempt._id}
                                                    style={{ borderBottom: "1px solid var(--chakra-colors-border-muted)", cursor: "pointer" }}
                                                    onClick={() => setSelectedAttempt(attempt)}
                                                >
                                                    <td style={{ padding: "12px", fontSize: "13px", fontWeight: "bold" }}>
                                                        {topicInfo.title || "Chủ đề nói đã bị xóa"}
                                                    </td>
                                                    <td style={{ padding: "12px" }}>
                                                        <Badge colorPalette={c} size="sm" px={2} py={0.5} borderRadius="md">
                                                            Part {topicInfo.partType || 1}
                                                        </Badge>
                                                    </td>
                                                    <td style={{ padding: "12px", textAlign: "center", fontSize: "13px", color: "var(--chakra-colors-fg-muted)", fontWeight: "bold" }}>
                                                        {m}p {s}s
                                                    </td>
                                                    <td style={{ padding: "12px", textAlign: "right", fontSize: "12px", color: "var(--chakra-colors-fg-muted)" }}>
                                                        {new Date(attempt.submittedAt).toLocaleDateString("vi-VN")}
                                                    </td>
                                                    <td style={{ padding: "12px", textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                                                        <Button
                                                            size="xs" variant="subtle" colorPalette="teal" borderRadius="lg" gap={1}
                                                            onClick={() => setSelectedAttempt(attempt)}
                                                        >
                                                            <FiEye size={11} /> Xem lại
                                                        </Button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </Box>
                            </Box>
                        )}
                    </Box>
                )}

                {/* ─── MODAL FOR REVIEWING A PAST PREPARATION ATTEMPT ─── */}
                {selectedAttempt && (
                    <Box
                        position="fixed" inset={0} zIndex={100}
                        bg="blackAlpha.600" display="flex" alignItems="center" justifyContent="center"
                        onClick={() => setSelectedAttempt(null)}
                    >
                        <Box
                            bg="bg.panel" borderRadius="2xl" p={8} w="full" maxW="900px"
                            mx={4} shadow="2xl" onClick={(e) => e.stopPropagation()}
                            maxH="85vh" overflowY="auto"
                            borderWidth="1px" borderColor="border.muted"
                        >
                            <Flex justify="space-between" align="center" mb={4}>
                                <Box>
                                    <Badge colorPalette={selectedAttempt.topicId?.partType === 1 ? "blue" : selectedAttempt.topicId?.partType === 2 ? "purple" : "teal"} mb={1}>
                                        IELTS Speaking Part {selectedAttempt.topicId?.partType || 1}
                                    </Badge>
                                    <Text fontSize="xl" fontWeight="950">
                                        {selectedAttempt.topicId?.title || "Dàn ý phác thảo bài nói"}
                                    </Text>
                                    <Text fontSize="xs" color="fg.muted" mt={0.5}>
                                        Ngày phác thảo: {new Date(selectedAttempt.submittedAt).toLocaleString("vi-VN")} | Thời gian chuẩn bị: {Math.floor(selectedAttempt.timeSpentSeconds / 60)} phút {selectedAttempt.timeSpentSeconds % 60} giây
                                    </Text>
                                </Box>
                                <Button variant="ghost" onClick={() => setSelectedAttempt(null)} borderRadius="xl">Đóng</Button>
                            </Flex>

                            <Box h="1px" bg="border.muted" mb={5} opacity={0.6} />

                            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
                                {/* Left column: Speech Outline */}
                                <GridItem>
                                    <Box p={5} bg="bg.subtle" borderRadius="xl" borderWidth="1px" borderColor="border.muted" h="100%">
                                        <Text fontSize="xs" fontWeight="bold" color="fg" mb={3}>DÀN Ý / NOTES CỦA BẠN:</Text>
                                        <Box overflowY="auto" maxH="380px" pr={1}>
                                            {selectedAttempt.draftText.split("\n").map((para, i) => (
                                                <Text key={i} mb={3} fontSize="xs" lineHeight="1.7" color="fg.muted">
                                                    {para}
                                                </Text>
                                            ))}
                                        </Box>
                                    </Box>
                                </GridItem>

                                {/* Right column: Model answer */}
                                <GridItem>
                                    <Box p={5} bg="blue.50/20" borderRadius="xl" borderWidth="1.5px" borderColor="blue.200" h="100%">
                                        <Text fontSize="xs" fontWeight="bold" color="blue.700" _dark={{ color: "blue.300" }} mb={3}>BÀI TRẢ LỜI MẪU (SAMPLE TRANSCRIPT):</Text>
                                        <Box overflowY="auto" maxH="380px" pr={1}>
                                            {(selectedAttempt.topicId?.sampleAnswer || "").split("\n").map((para, i) => (
                                                <Text key={i} mb={3} fontSize="xs" lineHeight="1.7" color="fg" style={{ textIndent: para.trim() ? "1em" : "0" }}>
                                                    {para}
                                                </Text>
                                            ))}
                                        </Box>
                                    </Box>
                                </GridItem>
                            </Grid>
                        </Box>
                    </Box>
                )}

                {/* ─── ADMIN ADD/EDIT DIALOG ─── */}
                {showModal && (
                    <Portal>
                        <TopicModal
                            onClose={() => { setShowModal(false); setEditingTopic(null); }}
                            onSave={handleSaveTopic}
                            initialData={editingTopic}
                        />
                    </Portal>
                )}

            </Box>
        </BaseLayout>
    );
};

export default SpeakingPage;
