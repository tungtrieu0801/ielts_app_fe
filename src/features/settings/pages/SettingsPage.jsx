import React from 'react';
import { Box, Flex, Text, VStack, Button, Icon, Grid } from '@chakra-ui/react';
import { FiSettings, FiUser, FiMonitor, FiVolume2 } from 'react-icons/fi';
import { useUIStore } from '../../../stores/useUIStore';
import BaseLayout from '../../../layouts/BaseLayout.jsx';

const SettingsPage = () => {
    const { currentPalette, setPalette } = useUIStore();

    const palettes = [
        { id: 'warm', name: 'Ấm áp (Kem & Hồng)', main: '#fef6e4', accent: '#f582ae', text: '#001858' },
        { id: 'navy', name: 'Hải quân (Navy & Trắng)', main: '#232946', accent: '#eebbc3', text: '#fffffe' },
        { id: 'chocolate', name: 'Chocolate (Nâu & Cam)', main: '#55423d', accent: '#ffc0ad', text: '#fffffe' },
        { id: 'forest', name: 'Rừng xanh (Xanh & Vàng)', main: '#004643', accent: '#f9bc60', text: '#fffffe' },
        { id: 'sky', name: 'Bầu trời (Trắng & Xanh)', main: '#fffffe', accent: '#3da9fc', text: '#094067' },
    ];

    return (
        <BaseLayout>
            <Box maxW="1000px" mx="auto" w="full">
                <Flex align="center" gap={4} mb={8}>
                    <Box p={3} bg="brand.solid" borderRadius="2xl" color="white" shadow="sm">
                        <FiSettings size={24} />
                    </Box>
                    <Box>
                        <Text fontSize="2xl" fontWeight="900" color="fg" letterSpacing="-0.5px">Cài đặt</Text>
                        <Text fontSize="sm" color="fg.muted" fontWeight="500">Quản lý thông tin cá nhân và giao diện ứng dụng</Text>
                    </Box>
                </Flex>

                <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={8}>
                    {/* ── Thông tin cá nhân ── */}
                    <Box
                        p={6} bg="bg.panel" borderRadius="3xl" shadow="sm"
                        border="1px solid" borderColor="border.subtle"
                    >
                        <Flex align="center" gap={3} mb={6}>
                            <Icon as={FiUser} boxSize={5} color="brand.solid" />
                            <Text fontSize="lg" fontWeight="800" color="fg">Thông tin cá nhân</Text>
                        </Flex>

                        <Box
                            p={8} borderRadius="2xl" borderWidth="2px" borderColor="border.dashed"
                            borderStyle="dashed" bg="bg.subtle" display="flex"
                            alignItems="center" justifyContent="center" flexDirection="column" gap={3}
                            textAlign="center"
                        >
                            <Text color="fg.muted" fontWeight="500">
                                Phần cập nhật thông tin cá nhân đang được phát triển.
                            </Text>
                            <Text fontSize="sm" color="fg.subtle">
                                (Đổi tên, avatar, mật khẩu sẽ được thêm vào đây sau)
                            </Text>
                        </Box>
                    </Box>

                    {/* ── Giao diện ── */}
                    <Box
                        p={6} bg="bg.panel" borderRadius="3xl" shadow="sm"
                        border="1px solid" borderColor="border.subtle"
                    >
                        <Flex align="center" gap={3} mb={6}>
                            <Icon as={FiMonitor} boxSize={5} color="brand.solid" />
                            <Text fontSize="lg" fontWeight="800" color="fg">Giao diện (Theme)</Text>
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

                    <VoiceSettingsSection />
                </Grid>
            </Box>
        </BaseLayout>
    );
};

const VoiceSettingsSection = () => {
    const [voices, setVoices] = React.useState([]);
    const [selectedVoice, setSelectedVoice] = React.useState('');
    const [autoPlay, setAutoPlay] = React.useState(true);

    const loadVoices = React.useCallback(() => {
        const v = window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('en'));
        setVoices(v);

        const savedVoice = localStorage.getItem('pref-voice-en-US');
        if (savedVoice) setSelectedVoice(savedVoice);
        else {
            const def = v.find(v => v.name.includes("Google")) || v[0];
            if (def) setSelectedVoice(def.name);
        }

        const savedAuto = localStorage.getItem('pref-autoplay-voice');
        setAutoPlay(savedAuto === null ? true : savedAuto === 'true');
    }, []);

    React.useEffect(() => {
        loadVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
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
            gridColumn={{ lg: 'span 2' }}
        >
            <Flex align="center" justify="space-between" mb={6}>
                <VStack align="start" gap={1}>
                    <Flex align="center" gap={3}>
                        <Box p={2} bg="blue.100" _dark={{ bg: "blue.900/30" }} borderRadius="xl" color="blue.500">
                            <Icon as={FiVolume2} boxSize={5} />
                        </Box>
                        <Text fontSize="lg" fontWeight="800" color="fg">Giọng đọc (Text-to-Speech)</Text>
                    </Flex>
                    <Text fontSize="sm" color="fg.muted" ml={12}>
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
