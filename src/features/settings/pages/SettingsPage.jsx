import React from 'react';
import { Box, Flex, Text, VStack, Button, Icon, Grid } from '@chakra-ui/react';
import { FiSettings, FiUser, FiMonitor, FiVolume2, FiSliders, FiImage, FiUpload, FiRotateCcw } from 'react-icons/fi';
import { useUIStore, PRESET_WALLPAPERS } from '../../../stores/useUIStore';
import { useStudyStore } from '../../../stores/useStudyStore';
import BaseLayout from '../../../layouts/BaseLayout.jsx';

const SettingsPage = () => {
    const { currentPalette, setPalette } = useUIStore();
    const [activeTab, setActiveTab] = React.useState('account'); // 'account' | 'theme' | 'study' | 'voice'

    const palettes = [
        { id: 'warm', name: 'Ấm áp (Kem & Hồng)', main: '#fef6e4', accent: '#f582ae', text: '#001858' },
        { id: 'navy', name: 'Hải quân (Navy & Trắng)', main: '#232946', accent: '#eebbc3', text: '#fffffe' },
        { id: 'chocolate', name: 'Chocolate (Nâu & Cam)', main: '#55423d', accent: '#ffc0ad', text: '#fffffe' },
        { id: 'forest', name: 'Rừng xanh (Xanh & Vàng)', main: '#004643', accent: '#f9bc60', text: '#fffffe' },
        { id: 'sky', name: 'Bầu trời (Trắng & Xanh)', main: '#fffffe', accent: '#3da9fc', text: '#094067' },
    ];

    const tabs = [
        { id: 'account', label: 'Tài khoản', desc: 'Thông tin cá nhân', icon: FiUser },
        { id: 'theme', label: 'Màu sắc (Theme)', desc: 'Tông màu ứng dụng', icon: FiMonitor },
        { id: 'background', label: 'Hình nền (Background)', desc: 'Tải ảnh & Ảnh có sẵn', icon: FiImage },
        { id: 'study', label: 'Cấu hình học', desc: 'Số từ học mỗi session', icon: FiSliders },
        { id: 'voice', label: 'Giọng đọc', desc: 'Phát âm (Text-to-Speech)', icon: FiVolume2 },
    ];

    return (
        <BaseLayout>
            <Box maxW="1000px" mx="auto" w="full">
                {/* Header Section */}
                <Flex align="center" gap={4} mb={8}>
                    <Box p={3} bg="brand.solid" borderRadius="2xl" color="white" shadow="sm">
                        <FiSettings size={24} />
                    </Box>
                    <Box>
                        <Text fontSize="2xl" fontWeight="900" color="fg" letterSpacing="-0.5px">Cài đặt</Text>
                        <Text fontSize="sm" color="fg.muted" fontWeight="500">Quản lý thông tin cá nhân và giao diện ứng dụng</Text>
                    </Box>
                </Flex>

                {/* Sidebar + Panel Split Layout */}
                <Flex direction={{ base: 'column', md: 'row' }} gap={8} align="start">
                    {/* Navigation Sidebar */}
                    <Box w={{ base: 'full', md: '280px' }} shrink={0}>
                        <Flex 
                            direction={{ base: 'row', md: 'column' }} 
                            gap={3} 
                            align="stretch"
                            w="full"
                            overflowX={{ base: 'auto', md: 'unset' }}
                            pb={{ base: 4, md: 0 }}
                            css={{
                                '&::-webkit-scrollbar': { display: 'none' },
                                '-ms-overflow-style': 'none',
                                'scrollbar-width': 'none',
                            }}
                        >
                            {tabs.map((tab) => {
                                const isActive = activeTab === tab.id;
                                return (
                                    <Flex
                                        key={tab.id}
                                        align="center" gap={4} p={4}
                                        borderRadius="2xl"
                                        border="3px solid"
                                        borderColor={isActive ? 'brand.solid' : 'border.muted'}
                                        bg={isActive ? 'bg.subtle' : 'bg.panel'}
                                        cursor="pointer"
                                        onClick={() => setActiveTab(tab.id)}
                                        transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
                                        flexShrink={0}
                                        minW={{ base: '185px', md: 'full' }}
                                        _hover={{
                                            borderColor: isActive ? 'brand.solid' : 'border.strong',
                                            transform: 'translateY(-2px)'
                                        }}
                                    >
                                        <Box 
                                            p={2.5} 
                                            bg={isActive ? 'brand.solid' : 'bg.subtle'} 
                                            color={isActive ? 'white' : 'fg.muted'} 
                                            borderRadius="xl"
                                            transition="all 0.2s"
                                        >
                                            <Icon as={tab.icon} boxSize={5} />
                                        </Box>
                                        <Box textAlign="left">
                                            <Text fontSize="sm" fontWeight="850" color={isActive ? 'brand.solid' : 'fg'} lineHeight="1.2">
                                                {tab.label}
                                            </Text>
                                            <Text fontSize="11px" fontWeight="600" color="fg.muted" mt={1}>
                                                {tab.desc}
                                            </Text>
                                        </Box>
                                    </Flex>
                                );
                            })}
                        </Flex>
                    </Box>

                    {/* Settings Panel Content */}
                    <Box flex={1} w="full">
                        {activeTab === 'account' && <AccountInfoSection />}
                        {activeTab === 'theme' && (
                            <ThemeSettingsSection 
                                palettes={palettes} 
                                currentPalette={currentPalette} 
                                setPalette={setPalette} 
                            />
                        )}
                        {activeTab === 'background' && <BackgroundSettingsSection />}
                        {activeTab === 'study' && <SessionSettingsSection />}
                        {activeTab === 'voice' && <VoiceSettingsSection />}
                    </Box>
                </Flex>
            </Box>
        </BaseLayout>
    );
};

/* ── ACCOUNT SETTINGS SECTION ── */
const AccountInfoSection = () => {
    return (
        <Box
            p={6} bg="bg.panel" borderRadius="3xl" shadow="sm"
            border="1px solid" borderColor="border.subtle"
            minH="350px"
            display="flex"
            flexDirection="column"
        >
            <Flex align="center" gap={3} mb={6}>
                <Box p={2.5} bg="brand.solid" borderRadius="xl" color="white" shadow="sm" display="flex" alignItems="center" justifyContent="center">
                    <Icon as={FiUser} boxSize={5} />
                </Box>
                <Box>
                    <Text fontSize="lg" fontWeight="800" color="fg">Thông tin cá nhân</Text>
                    <Text fontSize="sm" color="fg.muted" fontWeight="500">Quản lý tài khoản và thông tin cá nhân của bạn</Text>
                </Box>
            </Flex>

            <Box
                p={8} borderRadius="2xl" borderWidth="2px" borderColor="border.dashed"
                borderStyle="dashed" bg="bg.subtle" display="flex"
                alignItems="center" justifyContent="center" flexDirection="column" gap={3}
                textAlign="center" flex={1}
            >
                <Text color="fg.muted" fontWeight="600" fontSize="md">
                    Phần cập nhật thông tin cá nhân đang được phát triển.
                </Text>
                <Text fontSize="sm" color="fg.subtle">
                    (Tính năng đổi tên, đổi ảnh đại diện và mật khẩu sẽ sớm ra mắt ở đây)
                </Text>
            </Box>
        </Box>
    );
};

/* ── THEME SETTINGS SECTION ── */
const ThemeSettingsSection = ({ palettes, currentPalette, setPalette }) => {
    return (
        <Box
            p={6} bg="bg.panel" borderRadius="3xl" shadow="sm"
            border="1px solid" borderColor="border.subtle"
        >
            <Flex align="center" gap={3} mb={6}>
                <Box p={2.5} bg="brand.solid" borderRadius="xl" color="white" shadow="sm" display="flex" alignItems="center" justifyContent="center">
                    <Icon as={FiMonitor} boxSize={5} />
                </Box>
                <Box>
                    <Text fontSize="lg" fontWeight="800" color="fg">Giao diện (Theme)</Text>
                    <Text fontSize="sm" color="fg.muted" fontWeight="500">Thay đổi màu sắc chủ đạo của ứng dụng</Text>
                </Box>
            </Flex>

            <VStack align="stretch" gap={4}>
                {palettes.map((p) => (
                    <Flex
                        key={p.id}
                        align="center" justify="space-between" p={5}
                        borderRadius="2xl" borderWidth="3px"
                        borderColor={currentPalette === p.id ? 'brand.solid' : 'border.muted'}
                        bg={currentPalette === p.id ? 'bg.subtle' : 'transparent'}
                        cursor="pointer"
                        onClick={() => setPalette(p.id)}
                        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                        _hover={{
                            borderColor: currentPalette === p.id ? 'brand.solid' : 'border.strong',
                            transform: 'translateY(-2px)'
                        }}
                    >
                        <Flex align="center" gap={4}>
                            <Box
                                w="40px" h="40px" borderRadius="full" bg={p.main}
                                border="2px solid rgba(0,0,0,0.05)" position="relative"
                                shadow="sm"
                            >
                                <Box position="absolute" top="4px" right="4px" w="12px" h="12px" borderRadius="full" bg={p.accent} shadow="sm" />
                            </Box>
                            <Box>
                                <Text fontSize="md" fontWeight="bold" color="fg">{p.name}</Text>
                                <Text fontSize="xs" color="fg.muted" fontWeight="600">Tone chủ đạo: {p.main}</Text>
                            </Box>
                        </Flex>
                        {currentPalette === p.id && (
                            <Box p={1} bg="brand.solid" borderRadius="full">
                                <Box w="8px" h="8px" borderRadius="full" bg="white" />
                            </Box>
                        )}
                    </Flex>
                ))}
            </VStack>
        </Box>
    );
};

/* ── STUDY LIMIT SETTINGS SECTION ── */
const SessionSettingsSection = () => {
    const { wordsPerSession, setWordsPerSession } = useStudyStore();
    const options = [10, 15, 20, 25, 30, 40, 50];

    return (
        <Box
            p={6} bg="bg.panel" borderRadius="3xl" shadow="sm"
            border="1px solid" borderColor="border.subtle"
        >
            <Flex align="center" gap={3} mb={6}>
                <Box p={2.5} bg="brand.solid" borderRadius="xl" color="white" shadow="sm" display="flex" alignItems="center" justifyContent="center">
                    <Icon as={FiSliders} boxSize={5} />
                </Box>
                <Box>
                    <Text fontSize="lg" fontWeight="800" color="fg">Số từ mỗi lượt học</Text>
                    <Text fontSize="sm" color="fg.muted" fontWeight="500">Số lượng từ vựng học hoặc ôn tập trong mỗi session</Text>
                </Box>
            </Flex>

            <Grid templateColumns="repeat(auto-fill, minmax(80px, 1fr))" gap={3}>
                {options.map((val) => {
                    const isSelected = wordsPerSession === val;
                    return (
                        <Flex
                            key={val}
                            align="center" justify="center" p={4}
                            borderRadius="2xl" borderWidth="3px"
                            borderColor={isSelected ? 'brand.solid' : 'border.muted'}
                            bg={isSelected ? 'bg.subtle' : 'transparent'}
                            cursor="pointer"
                            onClick={() => setWordsPerSession(val)}
                            transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                            _hover={{
                                borderColor: isSelected ? 'brand.solid' : 'border.strong',
                                transform: 'translateY(-2px)'
                            }}
                            position="relative"
                        >
                            <VStack gap={0}>
                                <Text fontSize="xl" fontWeight="900" color={isSelected ? 'brand.solid' : 'fg'} lineHeight="1">
                                    {val}
                                </Text>
                                <Text fontSize="9px" fontWeight="800" color="fg.muted" mt={1}>
                                    TỪ
                                </Text>
                            </VStack>
                            {isSelected && (
                                <Box 
                                    position="absolute" top="-4px" right="-4px"
                                    p={1} bg="brand.solid" borderRadius="full" shadow="sm"
                                >
                                    <Box w="4px" h="4px" borderRadius="full" bg="white" />
                                </Box>
                            )}
                        </Flex>
                    );
                })}
            </Grid>
        </Box>
    );
};

/* ── VOICE SETTINGS SECTION ── */
const VoiceSettingsSection = () => {
    const [voices, setVoices] = React.useState([]);
    const [selectedVoice, setSelectedVoice] = React.useState('');
    const [autoPlay, setAutoPlay] = React.useState(true);

    const loadVoices = React.useCallback(() => {
        const v = window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('en'));
        if (v.length > 0) {
            setVoices(v);
            const savedVoice = localStorage.getItem('pref-voice-en-US');
            if (savedVoice) {
                const found = v.find(v => v.name === savedVoice);
                if (found) setSelectedVoice(found.name);
            } else {
                const def = v.find(v => v.name.includes("Google")) || v[0];
                if (def) setSelectedVoice(def.name);
            }
        }

        const savedAuto = localStorage.getItem('pref-autoplay-voice');
        setAutoPlay(savedAuto === null ? true : savedAuto === 'true');
    }, []);

    React.useEffect(() => {
        loadVoices();
        window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
        const timer = setInterval(() => {
            if (window.speechSynthesis.getVoices().length > 0) {
                loadVoices();
                clearInterval(timer);
            }
        }, 300);

        return () => {
            window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
            clearInterval(timer);
        };
    }, [loadVoices]);

    const handleVoiceChange = (name) => {
        setSelectedVoice(name);
        localStorage.setItem('pref-voice-en-US', name);
        const v = voices.find(v => v.name === name);
        if (v) {
            import('../../../shared/utils/speech').then(({ speak }) => {
                speak("Voice updated.", "en-US");
            });
        }
    };

    const handleAutoPlayToggle = () => {
        const newVal = !autoPlay;
        setAutoPlay(newVal);
        localStorage.setItem('pref-autoplay-voice', String(newVal));
    };

    return (
        <Box
            p={6} bg="bg.panel" borderRadius="3xl" shadow="sm"
            border="1px solid" borderColor="border.subtle"
        >
            <Flex align="center" justify="space-between" mb={6} direction={{ base: 'column', sm: 'row' }} gap={4}>
                <VStack align="start" gap={1}>
                    <Flex align="center" gap={3}>
                        <Box p={2} bg="blue.100" _dark={{ bg: "blue.900/30" }} borderRadius="xl" color="blue.500">
                            <Icon as={FiVolume2} boxSize={5} />
                        </Box>
                        <Text fontSize="lg" fontWeight="800" color="fg">Giọng đọc (Text-to-Speech)</Text>
                    </Flex>
                    <Text fontSize="sm" color="fg.muted" ml={{ sm: 12 }}>
                        Chọn giọng đọc tiếng Anh yêu thích. Giọng chất lượng cao có nhãn "High".
                    </Text>
                </VStack>

                <Flex 
                    align="center" gap={3} bg="bg.subtle" p={1.5} pr={4} borderRadius="full" 
                    border="1px solid" borderColor="border.muted"
                    cursor="pointer"
                    onClick={handleAutoPlayToggle}
                    transition="all 0.2s"
                    _hover={{ bg: "bg.muted" }}
                    alignSelf={{ base: 'flex-start', sm: 'auto' }}
                    ml={{ base: 12, sm: 0 }}
                >
                    <Box 
                        w="40px" h="24px" borderRadius="full" p="2px"
                        bg={autoPlay ? "brand.solid" : "gray.300"}
                        transition="all 0.2s"
                        position="relative"
                    >
                        <Box 
                            w="20px" h="20px" borderRadius="full" bg="white"
                            transition="all 0.2s"
                            transform={autoPlay ? "translateX(16px)" : "translateX(0)"}
                            shadow="sm"
                        />
                    </Box>
                    <Text fontSize="sm" fontWeight="bold">Tự động phát âm</Text>
                </Flex>
            </Flex>

            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={4}>
                {voices.length === 0 ? (
                    <Text p={4} color="fg.muted" fontStyle="italic">Không tìm thấy giọng đọc nào. Vui lòng kiểm tra lại trình duyệt.</Text>
                ) : (
                    voices.map((v) => {
                        const isSelected = selectedVoice === v.name;
                        const isHighQuality = v.name.includes("Google") || v.name.includes("Natural");

                        return (
                            <Flex
                                key={v.name}
                                align="center" justify="space-between" p={4}
                                borderRadius="2xl" borderWidth="2px"
                                borderColor={isSelected ? 'brand.solid' : 'border.muted'}
                                bg={isSelected ? 'bg.subtle' : 'transparent'}
                                cursor="pointer"
                                onClick={() => handleVoiceChange(v.name)}
                                transition="all 0.2s"
                                _hover={{ borderColor: isSelected ? 'brand.solid' : 'border.strong' }}
                            >
                                <VStack align="start" gap={0} flex={1} overflow="hidden">
                                    <Flex align="center" gap={2} w="full">
                                        <Text fontSize="sm" fontWeight="bold" color="fg" isTruncated>
                                            {v.name.replace("Microsoft ", "").replace("English (United States)", "US")}
                                        </Text>
                                        {isHighQuality && (
                                            <Box 
                                                as="span" px={1.5} py={0.5} borderRadius="md" 
                                                bg="green.100" color="green.600" fontSize="10px" 
                                                fontWeight="bold" _dark={{ bg: "green.900/30", color: "green.300" }}
                                            >
                                                High
                                            </Box>
                                        )}
                                    </Flex>
                                    <Text fontSize="10px" color="fg.muted">{v.lang} • {v.localService ? 'Local' : 'Cloud'}</Text>
                                </VStack>
                                {isSelected && (
                                    <Box p={1} bg="brand.solid" borderRadius="full" ml={2}>
                                        <Box w="6px" h="6px" borderRadius="full" bg="white" />
                                    </Box>
                                )}
                            </Flex>
                        );
                    })
                )}
            </Grid>
        </Box>
    );
};

/* ── BACKGROUND SETTINGS SECTION ── */
const BackgroundSettingsSection = () => {
    const { bgPreset, bgImage, bgBlur, bgOverlay, setBgPreset, setBgImage, setBgBlur, setBgOverlay, resetBg } = useUIStore();
    const fileInputRef = React.useRef(null);

    const handleFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Vui lòng chọn một file hình ảnh (JPG, PNG, WEBP...)!");
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            alert("File ảnh không được vượt quá 10MB!");
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target?.result;
            if (!dataUrl) return;

            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1280;
                const MAX_HEIGHT = 1280;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.75);
                setBgImage(compressedDataUrl);
            };
            img.src = dataUrl;
        };
        reader.readAsDataURL(file);
    };

    return (
        <Box
            p={6} bg="bg.panel" borderRadius="3xl" shadow="sm"
            border="1px solid" borderColor="border.subtle"
            display="flex" flexDirection="column" gap={6}
        >
            <Flex align="center" justify="space-between" wrap="wrap" gap={3}>
                <Flex align="center" gap={3}>
                    <Box p={2.5} bg="brand.solid" borderRadius="xl" color="white" shadow="sm" display="flex" alignItems="center" justifyContent="center">
                        <Icon as={FiImage} boxSize={5} />
                    </Box>
                    <Box>
                        <Text fontSize="lg" fontWeight="800" color="fg">Hình nền ứng dụng (App Background)</Text>
                        <Text fontSize="sm" color="fg.muted" fontWeight="500">Tùy chọn hình nền có sẵn hoặc tải ảnh cá nhân từ thiết bị</Text>
                    </Box>
                </Flex>
                {bgImage && (
                    <Button size="xs" variant="outline" colorPalette="red" borderRadius="lg" gap={1.5} onClick={resetBg}>
                        <Icon as={FiRotateCcw} /> Xóa hình nền
                    </Button>
                )}
            </Flex>

            {/* Custom Photo Upload Box */}
            <Box
                p={5}
                borderRadius="2xl"
                borderWidth="2px"
                borderColor={bgPreset === "custom" ? "brand.solid" : "border.dashed"}
                borderStyle="dashed"
                bg={bgPreset === "custom" ? "bg.subtle" : "transparent"}
                textAlign="center"
                cursor="pointer"
                onClick={() => fileInputRef.current?.click()}
                _hover={{ borderColor: "brand.solid", bg: "bg.subtle" }}
                transition="all 0.2s"
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleFileUpload}
                />
                <Flex direction="column" align="center" gap={2}>
                    <Box p={3} borderRadius="full" bg="brand.solid/10" color="brand.solid">
                        <Icon as={FiUpload} boxSize={6} />
                    </Box>
                    <Text fontSize="sm" fontWeight="800" color="fg">
                        {bgPreset === "custom" ? "📸 Đã tải ảnh cá nhân (Click để chọn ảnh khác)" : "📸 Tải ảnh cá nhân từ máy tính của bạn"}
                    </Text>
                    <Text fontSize="xs" color="fg.muted">
                        Hỗ trợ định dạng JPG, PNG, WEBP, GIF (Tối đa 10MB)
                    </Text>
                </Flex>
            </Box>

            {/* Preset Wallpapers Gallery */}
            <Box>
                <Text fontSize="xs" fontWeight="800" color="fg.muted" letterSpacing="wider" uppercase mb={3}>
                    BỘ HÌNH NỀN CÓ SẴN (PRESETS)
                </Text>
                <Grid templateColumns={{ base: "repeat(2, 1fr)", sm: "repeat(3, 1fr)" }} gap={3}>
                    {PRESET_WALLPAPERS.map((item) => {
                        const isSelected = bgPreset === item.id;
                        return (
                            <Box
                                key={item.id}
                                borderRadius="2xl"
                                borderWidth="3px"
                                borderColor={isSelected ? "brand.solid" : "border.muted"}
                                overflow="hidden"
                                cursor="pointer"
                                onClick={() => setBgPreset(item.id, item.url)}
                                transition="all 0.2s"
                                _hover={{ transform: "translateY(-3px)", borderColor: "brand.solid" }}
                                position="relative"
                                h="100px"
                            >
                                {item.id === "none" ? (
                                    <Flex h="full" w="full" bg="bg.subtle" align="center" justify="center" p={2} textAlign="center">
                                        <Text fontSize="xs" fontWeight="bold" color="fg.muted">🚫 Mặc định (Không ảnh)</Text>
                                    </Flex>
                                ) : (
                                    <Box
                                        h="full"
                                        w="full"
                                        bgImage={`url("${item.thumb}")`}
                                        bgSize="cover"
                                        bgPosition="center"
                                    />
                                )}
                                <Box
                                    position="absolute"
                                    bottom={0} left={0} right={0}
                                    bg="blackAlpha.700"
                                    color="white"
                                    px={2} py={1}
                                    fontSize="10px"
                                    fontWeight="bold"
                                    textAlign="center"
                                    isTruncated
                                >
                                    {item.name}
                                </Box>
                            </Box>
                        );
                    })}
                </Grid>
            </Box>

            {/* Adjustment Controls (Blur & Overlay) */}
            {bgImage && (
                <VStack align="stretch" gap={4} p={5} bg="bg.subtle" borderRadius="2xl" borderWidth="1px" borderColor="border.muted">
                    <Text fontSize="xs" fontWeight="800" color="fg.muted" letterSpacing="wider" uppercase>
                        CHỈNH ĐỘ MỜ & ĐỘ SẪM TỐI (FROSTED GLASS ADJUSTMENT)
                    </Text>
                    {/* Blur Slider */}
                    <Box>
                        <Flex justify="space-between" align="center" mb={1.5} fontSize="xs">
                            <Text fontWeight="bold" color="fg">Độ mờ hậu cảnh (Blur): {bgBlur}px</Text>
                        </Flex>
                        <input
                            type="range"
                            min="0"
                            max="20"
                            step="1"
                            value={bgBlur}
                            onChange={(e) => setBgBlur(Number(e.target.value))}
                            style={{ width: "100%", cursor: "pointer" }}
                        />
                    </Box>
                    {/* Overlay Opacity Slider */}
                    <Box>
                        <Flex justify="space-between" align="center" mb={1.5} fontSize="xs">
                            <Text fontWeight="bold" color="fg">Độ sẫm phủ mờ (Dark Overlay): {Math.round(bgOverlay * 100)}%</Text>
                        </Flex>
                        <input
                            type="range"
                            min="0"
                            max="0.6"
                            step="0.05"
                            value={bgOverlay}
                            onChange={(e) => setBgOverlay(Number(e.target.value))}
                            style={{ width: "100%", cursor: "pointer" }}
                        />
                    </Box>
                </VStack>
            )}
        </Box>
    );
};

export default SettingsPage;
