import React, { useEffect, useState, useMemo } from "react";
import {
    Box, Flex, Text, Heading, Button, SimpleGrid, Input, Badge, Spinner, Image, Table, HStack, VStack, Tabs
} from "@chakra-ui/react";
import {
    FiUsers, FiVideo, FiBookOpen, FiClock, FiRefreshCw, FiSearch, FiCheckCircle, FiLock, FiGlobe, FiShield, FiAlertTriangle, FiArrowLeft
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import BaseLayout from "../../../layouts/BaseLayout.jsx";
import { useAuthStore } from "../../../stores/useAuthStore.js";
import { getAdminDashboardData } from "../../../services/adminApi.js";

// Utility function to format relative time in Vietnamese
function formatTimeAgo(dateString) {
    if (!dateString) return "Chưa từng online";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Chưa rõ";

    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return "Vừa xong";
    if (diffMin < 60) return `${diffMin} phút trước`;
    if (diffHour < 24) return `${diffHour} giờ trước`;
    if (diffDay === 1) return `Hôm qua ${date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`;
    if (diffDay < 7) return `${diffDay} ngày trước`;

    return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function formatDateFull(dateString) {
    if (!dateString) return "—";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

const AdminDashboardPage = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const isAdmin = user?.email?.toLowerCase() === "tungvp@gmail.com";

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    // Filters
    const [userSearch, setUserSearch] = useState("");
    const [videoSearch, setVideoSearch] = useState("");
    const [videoUserFilter, setVideoUserFilter] = useState("ALL");
    const [wordSetSearch, setWordSetSearch] = useState("");
    const [wordSetAuthorFilter, setWordSetAuthorFilter] = useState("ALL");

    const fetchData = async (isManualRefresh = false) => {
        if (isManualRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);

        try {
            const res = await getAdminDashboardData();
            setData(res);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || err.message || "Lỗi khi tải dữ liệu Admin Dashboard.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (isAdmin) {
            fetchData();
        }
    }, [isAdmin]);

    // Filtered Datasets
    const filteredUsers = useMemo(() => {
        if (!data?.users) return [];
        return data.users.filter(u =>
            u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
            u.email?.toLowerCase().includes(userSearch.toLowerCase())
        );
    }, [data?.users, userSearch]);

    const filteredVideos = useMemo(() => {
        if (!data?.videoProgresses) return [];
        return data.videoProgresses.filter(vp => {
            const matchesSearch = vp.videoTitle?.toLowerCase().includes(videoSearch.toLowerCase()) ||
                vp.user?.name?.toLowerCase().includes(videoSearch.toLowerCase()) ||
                vp.user?.email?.toLowerCase().includes(videoSearch.toLowerCase());
            const matchesUser = videoUserFilter === "ALL" || vp.user?.id === videoUserFilter;
            return matchesSearch && matchesUser;
        });
    }, [data?.videoProgresses, videoSearch, videoUserFilter]);

    const filteredWordSets = useMemo(() => {
        if (!data?.wordSets) return [];
        return data.wordSets.filter(ws => {
            const matchesSearch = ws.title?.toLowerCase().includes(wordSetSearch.toLowerCase()) ||
                ws.author?.name?.toLowerCase().includes(wordSetSearch.toLowerCase()) ||
                ws.author?.email?.toLowerCase().includes(wordSetSearch.toLowerCase());
            const matchesAuthor = wordSetAuthorFilter === "ALL" || ws.author?.id === wordSetAuthorFilter;
            return matchesSearch && matchesAuthor;
        });
    }, [data?.wordSets, wordSetSearch, wordSetAuthorFilter]);

    if (!isAdmin) {
        return (
            <BaseLayout>
                <Flex justify="center" align="center" minH="70vh" direction="column" gap={4} p={6} textAlign="center">
                    <Box fontSize="56px" color="red.500">
                        <FiShield />
                    </Box>
                    <Heading fontSize="2xl" fontWeight="900">QUYỀN TRUY CẬP BỊ TỪ CHỐI</Heading>
                    <Text color="fg.muted" maxW="480px">
                        Trang Admin Dashboard này chỉ dành riêng cho tài khoản quản trị viên <strong>tungvp@gmail.com</strong>.
                    </Text>
                    <Button colorPalette="blue" borderRadius="xl" mt={2} onClick={() => navigate("/home")} gap={2}>
                        <FiArrowLeft /> QUAY VỀ TRANG CHỦ
                    </Button>
                </Flex>
            </BaseLayout>
        );
    }

    return (
        <BaseLayout>
            <Box maxW="1280px" mx="auto" px={{ base: 3, md: 6 }} py={6}>

                {/* Top Header */}
                <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
                    <Box>
                        <Flex align="center" gap={3} mb={1}>
                            <Heading fontSize={{ base: "xl", md: "2xl" }} fontWeight="900" color="fg">
                                🛡️ ADMIN DASHBOARD
                            </Heading>
                            <Badge colorPalette="purple" variant="solid" size="md" borderRadius="full" px={3}>
                                tungvp@gmail.com
                            </Badge>
                        </Flex>
                        <Text fontSize="xs" color="fg.muted" fontWeight="600">
                            Theo dõi người dùng online, tiến trình học video YouTube & các bộ từ vựng toàn hệ thống.
                        </Text>
                    </Box>

                    <Button
                        size="sm"
                        variant="outline"
                        colorPalette="blue"
                        borderRadius="xl"
                        onClick={() => fetchData(true)}
                        loading={refreshing}
                        gap={2}
                        fontWeight="bold"
                    >
                        <FiRefreshCw /> Làm mới dữ liệu
                    </Button>
                </Flex>

                {error && (
                    <Box p={4} bg="red.50" _dark={{ bg: "red.900/20" }} borderRadius="2xl" border="1px solid" borderColor="red.200" mb={6}>
                        <Flex align="center" gap={2} color="red.600" _dark={{ color: "red.300" }}>
                            <FiAlertTriangle />
                            <Text fontSize="sm" fontWeight="bold">{error}</Text>
                        </Flex>
                    </Box>
                )}

                {loading ? (
                    <Flex justify="center" align="center" minH="50vh" direction="column" gap={3}>
                        <Spinner size="xl" colorPalette="blue" />
                        <Text fontSize="sm" fontWeight="bold" color="fg.muted">Đang tải dữ liệu hệ thống...</Text>
                    </Flex>
                ) : (
                    <VStack align="stretch" gap={6}>

                        {/* Summary Metrics Cards */}
                        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={4}>
                            {/* Metric 1 */}
                            <Box bg="bg.panel" p={5} borderRadius="2xl" borderWidth="1px" borderColor="border.muted" shadow="xs">
                                <Flex justify="space-between" align="center" mb={2}>
                                    <Text fontSize="xs" fontWeight="800" color="fg.muted" letterSpacing="wider">TỔNG NGƯỜI DÙNG</Text>
                                    <Flex w="36px" h="36px" borderRadius="xl" bg="blue.500/10" align="center" justify="center" color="blue.500">
                                        <FiUsers size={18} />
                                    </Flex>
                                </Flex>
                                <Text fontSize="3xl" fontWeight="900" color="fg" mb={1}>{data?.summary?.totalUsers || 0}</Text>
                                <Flex align="center" gap={1.5}>
                                    <Box w="8px" h="8px" borderRadius="full" bg={data?.summary?.activeUsersNow > 0 ? "green.500" : "gray.400"} />
                                    <Text fontSize="xs" fontWeight="700" color={data?.summary?.activeUsersNow > 0 ? "green.500" : "fg.muted"}>
                                        {data?.summary?.activeUsersNow || 0} người dùng đang Online
                                    </Text>
                                </Flex>
                            </Box>

                            {/* Metric 2 */}
                            <Box bg="bg.panel" p={5} borderRadius="2xl" borderWidth="1px" borderColor="border.muted" shadow="xs">
                                <Flex justify="space-between" align="center" mb={2}>
                                    <Text fontSize="xs" fontWeight="800" color="fg.muted" letterSpacing="wider">VIDEO ĐÃ HỌC</Text>
                                    <Flex w="36px" h="36px" borderRadius="xl" bg="purple.500/10" align="center" justify="center" color="purple.500">
                                        <FiVideo size={18} />
                                    </Flex>
                                </Flex>
                                <Text fontSize="3xl" fontWeight="900" color="purple.500" mb={1}>{data?.summary?.totalDictationsStudied || 0}</Text>
                                <Text fontSize="xs" color="fg.muted">Tiến trình luyện nghe Dictation</Text>
                            </Box>

                            {/* Metric 3 */}
                            <Box bg="bg.panel" p={5} borderRadius="2xl" borderWidth="1px" borderColor="border.muted" shadow="xs">
                                <Flex justify="space-between" align="center" mb={2}>
                                    <Text fontSize="xs" fontWeight="800" color="fg.muted" letterSpacing="wider">BỘ TỪ VỰNG</Text>
                                    <Flex w="36px" h="36px" borderRadius="xl" bg="orange.500/10" align="center" justify="center" color="orange.500">
                                        <FiBookOpen size={18} />
                                    </Flex>
                                </Flex>
                                <Text fontSize="3xl" fontWeight="900" color="orange.500" mb={1}>{data?.summary?.totalWordSets || 0}</Text>
                                <Text fontSize="xs" color="fg.muted">Các bộ từ vựng trên hệ thống</Text>
                            </Box>

                            {/* Metric 4 */}
                            <Box bg="bg.panel" p={5} borderRadius="2xl" borderWidth="1px" borderColor="border.muted" shadow="xs">
                                <Flex justify="space-between" align="center" mb={2}>
                                    <Text fontSize="xs" fontWeight="800" color="fg.muted" letterSpacing="wider">TRẠNG THÁI HỆ THỐNG</Text>
                                    <Flex w="36px" h="36px" borderRadius="xl" bg="green.500/10" align="center" justify="center" color="green.500">
                                        <FiCheckCircle size={18} />
                                    </Flex>
                                </Flex>
                                <Text fontSize="2xl" fontWeight="900" color="green.500" mb={1}>ĐANG HOẠT ĐỘNG</Text>
                                <Text fontSize="xs" color="fg.muted">API Server & Database kết nối tốt</Text>
                            </Box>
                        </SimpleGrid>

                        {/* Main Tabs Container */}
                        <Box bg="bg.panel" borderRadius="3xl" borderWidth="1px" borderColor="border.muted" p={{ base: 4, md: 6 }} shadow="sm">
                            <Tabs.Root defaultValue="users" variant="line">
                                <Tabs.List mb={6} overflowX="auto" pb={1}>
                                    <Tabs.Trigger value="users" gap={2} fontSize="sm" fontWeight="800" py={3} px={4}>
                                        <FiUsers size={16} /> NGƯỜI DÙNG & LẦN CUỐI ONLINE ({filteredUsers.length})
                                    </Tabs.Trigger>
                                    <Tabs.Trigger value="videos" gap={2} fontSize="sm" fontWeight="800" py={3} px={4}>
                                        <FiVideo size={16} /> VIDEO ĐÃ HỌC ({filteredVideos.length})
                                    </Tabs.Trigger>
                                    <Tabs.Trigger value="wordsets" gap={2} fontSize="sm" fontWeight="800" py={3} px={4}>
                                        <FiBookOpen size={16} /> BỘ TỪ VỰNG ({filteredWordSets.length})
                                    </Tabs.Trigger>
                                </Tabs.List>

                                {/* TAB 1: USERS & ONLINE TIME */}
                                <Tabs.Content value="users">
                                    <VStack align="stretch" gap={4}>
                                        {/* Search Filter */}
                                        <Flex justify="space-between" align="center" flexWrap="wrap" gap={3}>
                                            <Box position="relative" w={{ base: "100%", md: "320px" }}>
                                                <Input
                                                    placeholder="Tìm kiếm người dùng theo tên, email..."
                                                    value={userSearch}
                                                    onChange={e => setUserSearch(e.target.value)}
                                                    borderRadius="xl"
                                                    fontSize="sm"
                                                />
                                            </Box>
                                            <Text fontSize="xs" color="fg.muted" fontWeight="600">
                                                Hiển thị {filteredUsers.length} / {data?.users?.length || 0} người dùng
                                            </Text>
                                        </Flex>

                                        {/* Users Table */}
                                        <Box overflowX="auto" borderRadius="2xl" borderWidth="1px" borderColor="border.muted">
                                            <Table.Root size="md" variant="subtle">
                                                <Table.Header bg="bg.subtle">
                                                    <Table.Row>
                                                        <Table.ColumnHeader fontWeight="bold">NGƯỜI DÙNG</Table.ColumnHeader>
                                                        <Table.ColumnHeader fontWeight="bold">TRẠNG THÁI ONLINE</Table.ColumnHeader>
                                                        <Table.ColumnHeader fontWeight="bold">LẦN CUỐI HOẠT ĐỘNG</Table.ColumnHeader>
                                                        <Table.ColumnHeader fontWeight="bold">BỘ TỪ</Table.ColumnHeader>
                                                        <Table.ColumnHeader fontWeight="bold">VIDEO HỌC</Table.ColumnHeader>
                                                        <Table.ColumnHeader fontWeight="bold">NGÀY THAM GIA</Table.ColumnHeader>
                                                    </Table.Row>
                                                </Table.Header>
                                                <Table.Body>
                                                    {filteredUsers.length === 0 ? (
                                                        <Table.Row>
                                                            <Table.Cell colSpan={6} textAlign="center" py={8} color="fg.muted">
                                                                Không tìm thấy người dùng nào phù hợp.
                                                            </Table.Cell>
                                                        </Table.Row>
                                                    ) : (
                                                        filteredUsers.map(u => (
                                                            <Table.Row key={u._id} _hover={{ bg: "bg.subtle" }}>
                                                                <Table.Cell>
                                                                    <Flex align="center" gap={3}>
                                                                        {u.picture ? (
                                                                            <Image src={u.picture} w="36px" h="36px" borderRadius="full" />
                                                                        ) : (
                                                                            <Flex w="36px" h="36px" borderRadius="full" bg="blue.100" _dark={{ bg: "blue.900/40" }} color="blue.600" align="center" justify="center" fontWeight="bold">
                                                                                {u.name?.charAt(0).toUpperCase()}
                                                                            </Flex>
                                                                        )}
                                                                        <Box overflow="hidden">
                                                                            <Flex align="center" gap={1.5}>
                                                                                <Text fontWeight="bold" fontSize="sm" color="fg" isTruncated>{u.name}</Text>
                                                                                {u.email?.toLowerCase() === "tungvp@gmail.com" && (
                                                                                    <Badge colorPalette="purple" size="xs">ADMIN</Badge>
                                                                                )}
                                                                            </Flex>
                                                                            <Text fontSize="xs" color="fg.muted" isTruncated>{u.email}</Text>
                                                                        </Box>
                                                                    </Flex>
                                                                </Table.Cell>

                                                                <Table.Cell>
                                                                    <Badge colorPalette={u.isOnline ? "green" : "gray"} variant="solid" borderRadius="full" px={2.5} py={0.5} fontSize="11px">
                                                                        {u.isOnline ? "🟢 Online" : "⚪ Offline"}
                                                                    </Badge>
                                                                </Table.Cell>

                                                                <Table.Cell>
                                                                    <Box>
                                                                        <Text fontSize="xs" fontWeight="bold" color="fg">
                                                                            {formatTimeAgo(u.lastActive || u.lastLogin || u.updatedAt)}
                                                                        </Text>
                                                                        <Text fontSize="10px" color="fg.muted">
                                                                            {formatDateFull(u.lastActive || u.lastLogin || u.updatedAt)}
                                                                        </Text>
                                                                    </Box>
                                                                </Table.Cell>

                                                                <Table.Cell>
                                                                    <Badge colorPalette="orange" variant="subtle" borderRadius="lg" px={2.5}>
                                                                        {u.userWordSetsCount} bộ từ
                                                                    </Badge>
                                                                </Table.Cell>

                                                                <Table.Cell>
                                                                    <Badge colorPalette="purple" variant="subtle" borderRadius="lg" px={2.5}>
                                                                        {u.userVideosCount} video
                                                                    </Badge>
                                                                </Table.Cell>

                                                                <Table.Cell>
                                                                    <Text fontSize="xs" color="fg.muted">
                                                                        {formatDateFull(u.createdAt)}
                                                                    </Text>
                                                                </Table.Cell>
                                                            </Table.Row>
                                                        ))
                                                    )}
                                                </Table.Body>
                                            </Table.Root>
                                        </Box>
                                    </VStack>
                                </Tabs.Content>

                                {/* TAB 2: VIDEOS STUDIED BY USERS */}
                                <Tabs.Content value="videos">
                                    <VStack align="stretch" gap={4}>
                                        <Flex justify="space-between" align="center" flexWrap="wrap" gap={3}>
                                            <Flex gap={3} flex={1} flexWrap="wrap">
                                                <Box w={{ base: "100%", md: "320px" }}>
                                                    <Input
                                                        placeholder="Tìm tiêu đề video hoặc tên người học..."
                                                        value={videoSearch}
                                                        onChange={e => setVideoSearch(e.target.value)}
                                                        borderRadius="xl"
                                                        fontSize="sm"
                                                    />
                                                </Box>
                                            </Flex>

                                            <Text fontSize="xs" color="fg.muted" fontWeight="600">
                                                Hiển thị {filteredVideos.length} bài luyện nghe
                                            </Text>
                                        </Flex>

                                        {/* Videos Table */}
                                        <Box overflowX="auto" borderRadius="2xl" borderWidth="1px" borderColor="border.muted">
                                            <Table.Root size="md" variant="subtle">
                                                <Table.Header bg="bg.subtle">
                                                    <Table.Row>
                                                        <Table.ColumnHeader fontWeight="bold">NGƯỜI HỌC</Table.ColumnHeader>
                                                        <Table.ColumnHeader fontWeight="bold">VIDEO YOUTUBE</Table.ColumnHeader>
                                                        <Table.ColumnHeader fontWeight="bold">TIẾN ĐỘ</Table.ColumnHeader>
                                                        <Table.ColumnHeader fontWeight="bold">LẦN HỌC GẦN NHẤT</Table.ColumnHeader>
                                                    </Table.Row>
                                                </Table.Header>
                                                <Table.Body>
                                                    {filteredVideos.length === 0 ? (
                                                        <Table.Row>
                                                            <Table.Cell colSpan={4} textAlign="center" py={8} color="fg.muted">
                                                                Chưa có dữ liệu bài video luyện nghe nào.
                                                            </Table.Cell>
                                                        </Table.Row>
                                                    ) : (
                                                        filteredVideos.map(vp => (
                                                            <Table.Row key={vp.id} _hover={{ bg: "bg.subtle" }}>
                                                                <Table.Cell>
                                                                    <Flex align="center" gap={2.5}>
                                                                        {vp.user?.picture ? (
                                                                            <Image src={vp.user.picture} w="32px" h="32px" borderRadius="full" />
                                                                        ) : (
                                                                            <Flex w="32px" h="32px" borderRadius="full" bg="blue.100" _dark={{ bg: "blue.900/40" }} color="blue.600" align="center" justify="center" fontWeight="bold" fontSize="xs">
                                                                                {vp.user?.name?.charAt(0).toUpperCase()}
                                                                            </Flex>
                                                                        )}
                                                                        <Box overflow="hidden">
                                                                            <Text fontWeight="bold" fontSize="xs" color="fg" isTruncated>{vp.user?.name}</Text>
                                                                            <Text fontSize="10px" color="fg.muted" isTruncated>{vp.user?.email}</Text>
                                                                        </Box>
                                                                    </Flex>
                                                                </Table.Cell>

                                                                <Table.Cell maxW="320px">
                                                                    <Box>
                                                                        <Text fontWeight="bold" fontSize="xs" color="blue.500" isTruncated title={vp.videoTitle}>
                                                                            {vp.videoTitle}
                                                                        </Text>
                                                                        <Text fontSize="10px" color="fg.muted">
                                                                            ID: {vp.videoId}
                                                                        </Text>
                                                                    </Box>
                                                                </Table.Cell>

                                                                <Table.Cell>
                                                                    <Box minW="140px">
                                                                        <Flex justify="space-between" align="center" mb={1} fontSize="xs">
                                                                            <Text fontWeight="bold" color="fg">{vp.doneCount} / {vp.totalSentences} câu</Text>
                                                                            <Badge colorPalette={vp.progressPercent === 100 ? "green" : "blue"} size="xs">
                                                                                {vp.progressPercent}%
                                                                            </Badge>
                                                                        </Flex>
                                                                        <Box h="6px" w="100%" bg="bg.subtle" borderRadius="full" overflow="hidden" borderWidth="1px" borderColor="border.muted">
                                                                            <Box h="100%" w={`${vp.progressPercent}%`} bg={vp.progressPercent === 100 ? "green.500" : "blue.500"} borderRadius="full" />
                                                                        </Box>
                                                                    </Box>
                                                                </Table.Cell>

                                                                <Table.Cell>
                                                                    <Text fontSize="xs" color="fg.muted">
                                                                        {formatTimeAgo(vp.updatedAt)}
                                                                    </Text>
                                                                </Table.Cell>
                                                            </Table.Row>
                                                        ))
                                                    )}
                                                </Table.Body>
                                            </Table.Root>
                                        </Box>
                                    </VStack>
                                </Tabs.Content>

                                {/* TAB 3: USER WORD SETS */}
                                <Tabs.Content value="wordsets">
                                    <VStack align="stretch" gap={4}>
                                        <Flex justify="space-between" align="center" flexWrap="wrap" gap={3}>
                                            <Box w={{ base: "100%", md: "320px" }}>
                                                <Input
                                                    placeholder="Tìm tên bộ từ hoặc tên tác giả..."
                                                    value={wordSetSearch}
                                                    onChange={e => setWordSetSearch(e.target.value)}
                                                    borderRadius="xl"
                                                    fontSize="sm"
                                                />
                                            </Box>
                                            <Text fontSize="xs" color="fg.muted" fontWeight="600">
                                                Hiển thị {filteredWordSets.length} bộ từ vựng
                                            </Text>
                                        </Flex>

                                        {/* WordSets Table */}
                                        <Box overflowX="auto" borderRadius="2xl" borderWidth="1px" borderColor="border.muted">
                                            <Table.Root size="md" variant="subtle">
                                                <Table.Header bg="bg.subtle">
                                                    <Table.Row>
                                                        <Table.ColumnHeader fontWeight="bold">TÊN BỘ TỪ</Table.ColumnHeader>
                                                        <Table.ColumnHeader fontWeight="bold">TÁC GIẢ</Table.ColumnHeader>
                                                        <Table.ColumnHeader fontWeight="bold">SỐ TỪ VỰNG</Table.ColumnHeader>
                                                        <Table.ColumnHeader fontWeight="bold">TRẠNG THÁI</Table.ColumnHeader>
                                                        <Table.ColumnHeader fontWeight="bold">NGÀY TẠO</Table.ColumnHeader>
                                                    </Table.Row>
                                                </Table.Header>
                                                <Table.Body>
                                                    {filteredWordSets.length === 0 ? (
                                                        <Table.Row>
                                                            <Table.Cell colSpan={5} textAlign="center" py={8} color="fg.muted">
                                                                Chưa có bộ từ vựng nào trên hệ thống.
                                                            </Table.Cell>
                                                        </Table.Row>
                                                    ) : (
                                                        filteredWordSets.map(ws => (
                                                            <Table.Row key={ws.id} _hover={{ bg: "bg.subtle" }}>
                                                                <Table.Cell>
                                                                    <Box>
                                                                        <Text fontWeight="bold" fontSize="sm" color="fg">{ws.title}</Text>
                                                                        {ws.description && (
                                                                            <Text fontSize="xs" color="fg.muted" isTruncated maxW="280px">{ws.description}</Text>
                                                                        )}
                                                                    </Box>
                                                                </Table.Cell>

                                                                <Table.Cell>
                                                                    <Flex align="center" gap={2}>
                                                                        {ws.author?.picture ? (
                                                                            <Image src={ws.author.picture} w="28px" h="28px" borderRadius="full" />
                                                                        ) : (
                                                                            <Flex w="28px" h="28px" borderRadius="full" bg="orange.100" _dark={{ bg: "orange.900/40" }} color="orange.600" align="center" justify="center" fontWeight="bold" fontSize="xs">
                                                                                {ws.author?.name?.charAt(0).toUpperCase()}
                                                                            </Flex>
                                                                        )}
                                                                        <Box overflow="hidden">
                                                                            <Text fontWeight="bold" fontSize="xs" color="fg" isTruncated>{ws.author?.name}</Text>
                                                                            <Text fontSize="10px" color="fg.muted" isTruncated>{ws.author?.email}</Text>
                                                                        </Box>
                                                                    </Flex>
                                                                </Table.Cell>

                                                                <Table.Cell>
                                                                    <Badge colorPalette="blue" variant="solid" borderRadius="lg" px={3}>
                                                                        {ws.wordCount} từ
                                                                    </Badge>
                                                                </Table.Cell>

                                                                <Table.Cell>
                                                                    <Badge colorPalette={ws.isPublic ? "green" : "gray"} variant="subtle" borderRadius="full" px={2.5} gap={1}>
                                                                        {ws.isPublic ? <><FiGlobe size={11} /> Công khai</> : <><FiLock size={11} /> Riêng tư</>}
                                                                    </Badge>
                                                                </Table.Cell>

                                                                <Table.Cell>
                                                                    <Text fontSize="xs" color="fg.muted">
                                                                        {formatDateFull(ws.createdAt)}
                                                                    </Text>
                                                                </Table.Cell>
                                                            </Table.Row>
                                                        ))
                                                    )}
                                                </Table.Body>
                                            </Table.Root>
                                        </Box>
                                    </VStack>
                                </Tabs.Content>

                            </Tabs.Root>
                        </Box>

                    </VStack>
                )}
            </Box>
        </BaseLayout>
    );
};

export default AdminDashboardPage;
