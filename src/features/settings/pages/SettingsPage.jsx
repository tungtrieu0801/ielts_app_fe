import React from 'react';
import { Box, Flex, Text, VStack, Button, Icon, Grid } from '@chakra-ui/react';
import { FiSettings, FiUser, FiMonitor, FiVolume2, FiSliders } from 'react-icons/fi';
import { useUIStore } from '../../../stores/useUIStore';
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
        { id: 'theme', label: 'Giao diện', desc: 'Màu sắc & Giao diện', icon: FiMonitor },
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

export default SettingsPage;
