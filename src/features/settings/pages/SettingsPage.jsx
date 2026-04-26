import React from 'react';
import { Box, Flex, Text, VStack, Button, Icon, Grid } from '@chakra-ui/react';
import { FiSettings, FiUser, FiMonitor } from 'react-icons/fi';
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
                </Grid>
            </Box>
        </BaseLayout>
    );
};

export default SettingsPage;
