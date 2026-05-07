import React, { useEffect, useState } from "react";
import {
    Box, Flex, Text, SimpleGrid, Button, Input, Textarea, Spinner,
    IconButton, Badge,
} from "@chakra-ui/react";
import { FiPlus, FiTrash2, FiBook, FiPlay, FiGlobe, FiLock, FiGitBranch, FiFolder, FiChevronLeft, FiEdit2, FiChevronRight, FiPauseCircle, FiPlayCircle, FiCornerUpRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import BaseLayout from "../../../layouts/BaseLayout.jsx";
import { useVocabularyStore } from "../../../stores/useVocabularyStore.js";

const COLORS = ["blue", "purple", "green", "orange", "red", "teal", "pink"];

// ── Move to Folder Modal ───────────────────────────────────────────────────────
const MoveFolderModal = ({ set, folders, onClose, onMove }) => {
    const [selected, setSelected] = useState(set.folderId || null);
    const [moving, setMoving] = useState(false);

    const handleMove = async () => {
        setMoving(true);
        try {
            await onMove(set._id, selected);
            onClose();
        } finally {
            setMoving(false);
        }
    };

    const c = set.color || "blue";
    const currentFolderName = folders.find(f => f._id === set.folderId)?.name;
    const selectedFolderName = folders.find(f => f._id === selected)?.name;

    return (
        <Box
            position="fixed" inset={0} zIndex={100}
            bg="blackAlpha.600" display="flex" alignItems="center" justifyContent="center"
            onClick={onClose}
        >
            <Box
                bg="bg.panel" borderRadius="2xl" p={7} w="full" maxW="440px"
                mx={4} shadow="2xl" onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <Flex align="center" gap={3} mb={2}>
                    <Flex w="40px" h="40px" borderRadius="xl"
                        bg={`${c}.100`} _dark={{ bg: `${c}.900` }}
                        align="center" justify="center" fontSize="xl" flexShrink={0}
                    >
                        📖
                    </Flex>
                    <Box minW={0}>
                        <Text fontWeight="800" fontSize="md" isTruncated>{set.title}</Text>
                        <Text fontSize="xs" color="fg.muted">
                            {currentFolderName
                                ? `Đang trong: ${currentFolderName}`
                                : "Hiện đang ở ngoài (không thuộc thư mục nào)"
                            }
                        </Text>
                    </Box>
                </Flex>

                <Text fontSize="sm" fontWeight="700" color="fg" mb={3} mt={5}>
                    Chọn thư mục đích
                </Text>

                {/* Option: move to root */}
                <Box
                    p={3} mb={2} borderRadius="xl" cursor="pointer"
                    borderWidth="2px"
                    borderColor={selected === null ? "blue.400" : "border.muted"}
                    bg={selected === null ? "blue.50" : "bg.subtle"}
                    _dark={{ bg: selected === null ? "blue.900/30" : "gray.800" }}
                    onClick={() => setSelected(null)}
                    transition="all 0.15s"
                >
                    <Flex align="center" gap={3}>
                        <Box fontSize="lg">🗂️</Box>
                        <Box flex={1}>
                            <Text fontSize="sm" fontWeight={selected === null ? "700" : "500"}
                                color={selected === null ? "blue.600" : "fg"}
                                _dark={{ color: selected === null ? "blue.300" : "fg" }}
                            >
                                Không thuộc thư mục nào (root)
                            </Text>
                            <Text fontSize="xs" color="fg.muted">Đưa bộ từ ra màn hình chính</Text>
                        </Box>
                        {selected === null && (
                            <Box w="8px" h="8px" borderRadius="full" bg="blue.400" flexShrink={0} />
                        )}
                    </Flex>
                </Box>

                {/* Folder list */}
                {folders.length === 0 ? (
                    <Box py={6} textAlign="center">
                        <Text fontSize="2xl" mb={2}>📁</Text>
                        <Text fontSize="sm" color="fg.muted">Bạn chưa có thư mục nào. Hãy tạo một thư mục trước!</Text>
                    </Box>
                ) : (
                    <Box maxH="260px" overflowY="auto" display="flex" flexDirection="column" gap={2} pr={1}>
                        {folders.map(folder => {
                            const fc = folder.color || "purple";
                            const isSelected = selected === folder._id;
                            return (
                                <Box
                                    key={folder._id}
                                    p={3} borderRadius="xl" cursor="pointer"
                                    borderWidth="2px"
                                    borderColor={isSelected ? `${fc}.400` : "border.muted"}
                                    bg={isSelected ? `${fc}.50` : "bg.subtle"}
                                    _dark={{ bg: isSelected ? `${fc}.900/30` : "gray.800" }}
                                    onClick={() => setSelected(folder._id)}
                                    transition="all 0.15s"
                                    _hover={{ borderColor: `${fc}.300` }}
                                >
                                    <Flex align="center" gap={3}>
                                        <Flex w="32px" h="32px" borderRadius="lg"
                                            bg={`${fc}.500`} color="white"
                                            align="center" justify="center" flexShrink={0}
                                        >
                                            <FiFolder size={16} />
                                        </Flex>
                                        <Box flex={1} minW={0}>
                                            <Text fontSize="sm"
                                                fontWeight={isSelected ? "700" : "500"}
                                                color={isSelected ? `${fc}.700` : "fg"}
                                                _dark={{ color: isSelected ? `${fc}.300` : "fg" }}
                                                isTruncated
                                            >
                                                {folder.name}
                                            </Text>
                                            {folder.setCount !== undefined && (
                                                <Text fontSize="xs" color="fg.muted">{folder.setCount || 0} bộ từ</Text>
                                            )}
                                        </Box>
                                        {isSelected && (
                                            <Box w="8px" h="8px" borderRadius="full" bg={`${fc}.400`} flexShrink={0} />
                                        )}
                                    </Flex>
                                </Box>
                            );
                        })}
                    </Box>
                )}

                {/* Footer */}
                <Flex gap={3} justify="flex-end" mt={6}>
                    <Button variant="ghost" onClick={onClose} size="md">Hủy</Button>
                    <Button
                        colorPalette="blue" onClick={handleMove}
                        loading={moving}
                        size="md" borderRadius="xl"
                        disabled={selected === (set.folderId || null)}
                    >
                        <FiCornerUpRight size={15} />
                        {selected === null ? "Chuyển ra ngoài" : `Chuyển vào "${selectedFolderName}"`}
                    </Button>
                </Flex>
            </Box>
        </Box>
    );
};

// ── Create/Edit Folder Modal ──────────────────────────────────────────────────
const FolderModal = ({ onClose, onSave, initialData = null }) => {
    const [name, setName] = useState(initialData?.name || "");
    const [desc, setDesc] = useState(initialData?.description || "");
    const [color, setColor] = useState(initialData?.color || "purple");
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!name.trim()) return;
        setSaving(true);
        try {
            await onSave({ name, description: desc, color });
            onClose();
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box
            position="fixed" inset={0} zIndex={50}
            bg="blackAlpha.600" display="flex" alignItems="center" justifyContent="center"
            onClick={onClose}
        >
            <Box
                bg="bg.panel" borderRadius="2xl" p={8} w="full" maxW="480px"
                mx={4} shadow="2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <Text fontSize="xl" fontWeight="bold" mb={6}>
                    {initialData ? "Chỉnh sửa thư mục" : "Tạo thư mục mới"}
                </Text>

                <Box mb={4}>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>Tên thư mục *</Text>
                    <Input
                        placeholder="VD: IELTS Preparation"
                        value={name} onChange={(e) => setName(e.target.value)}
                        borderRadius="lg"
                        autoFocus
                    />
                </Box>

                <Box mb={4}>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>Mô tả</Text>
                    <Textarea
                        placeholder="Mô tả ngắn..."
                        value={desc} onChange={(e) => setDesc(e.target.value)}
                        rows={2} borderRadius="lg" resize="none"
                    />
                </Box>

                <Box mb={6}>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>Màu sắc</Text>
                    <Flex gap={2} flexWrap="wrap">
                        {COLORS.map((c) => (
                            <Box
                                key={c} w="28px" h="28px" borderRadius="full"
                                bg={`${c}.400`} cursor="pointer"
                                borderWidth={color === c ? "3px" : "2px"}
                                borderColor={color === c ? "white" : "transparent"}
                                boxShadow={color === c ? `0 0 0 2px var(--chakra-colors-${c}-500)` : "none"}
                                onClick={() => setColor(c)}
                                transition="all 0.15s"
                            />
                        ))}
                    </Flex>
                </Box>

                <Flex gap={3} justify="flex-end">
                    <Button variant="ghost" onClick={onClose}>Hủy</Button>
                    <Button
                        colorPalette={color} onClick={handleSave}
                        loading={saving} disabled={!name.trim()}
                    >
                        {initialData ? "Lưu thay đổi" : "Tạo thư mục"}
                    </Button>
                </Flex>
            </Box>
        </Box>
    );
};

// ── Create/Edit WordSet Modal ────────────────────────────────────────────────
const WordSetModal = ({ onClose, onSave, initialData = null }) => {
    const [title, setTitle] = useState(initialData?.title || "");
    const [desc, setDesc] = useState(initialData?.description || "");
    const [color, setColor] = useState(initialData?.color || "blue");
    const [isPublic, setIsPublic] = useState(initialData?.isPublic || false);
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!title.trim()) return;
        setSaving(true);
        try {
            await onSave({ title, description: desc, color, isPublic });
            onClose();
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box
            position="fixed" inset={0} zIndex={50}
            bg="blackAlpha.600" display="flex" alignItems="center" justifyContent="center"
            onClick={onClose}
        >
            <Box
                bg="bg.panel" borderRadius="2xl" p={8} w="full" maxW="480px"
                mx={4} shadow="2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <Text fontSize="xl" fontWeight="bold" mb={6}>
                    {initialData ? "Chỉnh sửa bộ từ" : "Tạo bộ từ mới"}
                </Text>

                <Box mb={4}>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>Tên bộ từ *</Text>
                    <Input
                        placeholder="VD: IELTS Academic - Task 2"
                        value={title} onChange={(e) => setTitle(e.target.value)}
                        borderRadius="lg"
                    />
                </Box>

                <Box mb={4}>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>Mô tả</Text>
                    <Textarea
                        placeholder="Mô tả ngắn về bộ từ này..."
                        value={desc} onChange={(e) => setDesc(e.target.value)}
                        rows={3} borderRadius="lg" resize="none"
                    />
                </Box>

                <Box mb={4}>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>Màu sắc</Text>
                    <Flex gap={2} flexWrap="wrap">
                        {COLORS.map((c) => (
                            <Box
                                key={c} w="28px" h="28px" borderRadius="full"
                                bg={`${c}.400`} cursor="pointer"
                                borderWidth={color === c ? "3px" : "2px"}
                                borderColor={color === c ? "white" : "transparent"}
                                boxShadow={color === c ? `0 0 0 2px var(--chakra-colors-${c}-500)` : "none"}
                                onClick={() => setColor(c)}
                                transition="all 0.15s"
                            />
                        ))}
                    </Flex>
                </Box>

                {/* Public / Private toggle */}
                <Box mb={6}>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>Hiển thị</Text>
                    <Flex gap={2}>
                        <Box
                            flex={1} py={3} px={4} borderRadius="xl" cursor="pointer"
                            borderWidth="2px"
                            borderColor={!isPublic ? "blue.400" : "border.muted"}
                            bg={!isPublic ? "blue.50" : "transparent"}
                            _dark={{ bg: !isPublic ? "blue.900/30" : "transparent" }}
                            onClick={() => setIsPublic(false)}
                            transition="all 0.15s"
                        >
                            <Flex align="center" gap={2} mb={0.5}>
                                <FiLock size={14} color={!isPublic ? "#3b82f6" : undefined} />
                                <Text fontSize="sm" fontWeight={!isPublic ? "700" : "500"}
                                    color={!isPublic ? "blue.600" : "fg.muted"}>Riêng tư</Text>
                            </Flex>
                            <Text fontSize="xs" color="fg.muted">Chỉ bạn mới thấy</Text>
                        </Box>
                        <Box
                            flex={1} py={3} px={4} borderRadius="xl" cursor="pointer"
                            borderWidth="2px"
                            borderColor={isPublic ? "green.400" : "border.muted"}
                            bg={isPublic ? "green.50" : "transparent"}
                            _dark={{ bg: isPublic ? "green.900/30" : "transparent" }}
                            onClick={() => setIsPublic(true)}
                            transition="all 0.15s"
                        >
                            <Flex align="center" gap={2} mb={0.5}>
                                <FiGlobe size={14} color={isPublic ? "#22c55e" : undefined} />
                                <Text fontSize="sm" fontWeight={isPublic ? "700" : "500"}
                                    color={isPublic ? "green.600" : "fg.muted"}>Công khai</Text>
                            </Flex>
                            <Text fontSize="xs" color="fg.muted">Mọi người có thể thấy & fork</Text>
                        </Box>
                    </Flex>
                </Box>

                <Flex gap={3} justify="flex-end">
                    <Button variant="ghost" onClick={onClose}>Hủy</Button>
                    <Button
                        colorPalette={color} onClick={handleSave}
                        loading={saving} disabled={!title.trim()}
                    >
                        {initialData ? "Lưu thay đổi" : "Tạo bộ từ"}
                    </Button>
                </Flex>
            </Box>
        </Box>
    );
};

// ── My Set Card ─────────────────────────────────────────────────────────────────
const SetCard = ({ set, folders, onDelete, onTogglePublic, onEdit, onToggleDisable, onMoveToFolder }) => {
    const navigate = useNavigate();
    const [toggling, setToggling] = useState(false);
    const [togglingDisable, setTogglingDisable] = useState(false);
    const [showMoveModal, setShowMoveModal] = useState(false);
    const c = set.color || "blue";
    const isDisabled = !!set.isDisabled;

    return (
        <Box
            position="relative" bg="bg.panel" borderRadius="2xl" p={5}
            borderWidth="1px"
            borderColor={isDisabled ? "orange.300" : "border.muted"}
            overflow="hidden"
            cursor={isDisabled ? "default" : "pointer"}
            opacity={isDisabled ? 0.65 : 1}
            transition="all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
            _hover={isDisabled ? {} : {
                transform: "translateY(-6px)",
                shadow: `0 20px 40px -10px var(--chakra-colors-${c}-500)`,
                borderColor: `${c}.400`,
            }}
            onClick={() => !isDisabled && navigate(`/sets/${set._id}`)}
        >
            {/* Disabled overlay badge */}
            {isDisabled && (
                <Box
                    position="absolute" top={3} right={3} zIndex={2}
                    bg="orange.100" color="orange.700"
                    _dark={{ bg: "orange.900/50", color: "orange.300" }}
                    px={2} py={0.5} borderRadius="md" fontSize="10px" fontWeight="800"
                    textTransform="uppercase" letterSpacing="wider"
                    display="flex" alignItems="center" gap={1}
                >
                    <FiPauseCircle size={10} /> Tắt
                </Box>
            )}

            <Box position="absolute" top="-20px" right="-20px"
                w="120px" h="120px" bg={isDisabled ? "gray.400" : `${c}.400`} opacity={0.15}
                filter="blur(40px)" borderRadius="full" pointerEvents="none"
            />
            <Box position="absolute" top={0} left={0} right={0} h="5px"
                bg={isDisabled
                    ? "linear-gradient(90deg, var(--chakra-colors-gray-300) 0%, var(--chakra-colors-gray-400) 100%)"
                    : `linear-gradient(90deg, var(--chakra-colors-${c}-400) 0%, var(--chakra-colors-${c}-600) 100%)`
                }
            />

            <Flex align="flex-start" justify="space-between" mb={4} mt={2}>
                <Flex align="center" gap={4} flex={1} minW={0}>
                    <Flex w="48px" h="48px" flexShrink={0} borderRadius="xl"
                        bg={isDisabled ? "gray.100" : `${c}.100`}
                        _dark={{ bg: isDisabled ? "gray.700" : `${c}.900` }}
                        align="center" justify="center" fontSize="2xl"
                        boxShadow={isDisabled ? "none" : `0 10px 20px -5px var(--chakra-colors-${c}-500)`}
                    >
                        {isDisabled ? "🚫" : "📖"}
                    </Flex>
                    <Box minW={0}>
                        <Flex align="center" gap={2}>
                            <Text fontWeight="800" fontSize="lg" isTruncated letterSpacing="tight">
                                {set.title}
                            </Text>
                            {set.isPublic ? (
                                <FiGlobe size={13} color="var(--chakra-colors-green-500)" title="Công khai" />
                            ) : (
                                <FiLock size={13} color="var(--chakra-colors-gray-400)" title="Riêng tư" />
                            )}
                        </Flex>
                        <Badge colorPalette={isDisabled ? "orange" : c} variant="subtle" size="sm" mt={1}
                            px={2} py={0.5} borderRadius="md" fontWeight="bold">
                            {set.wordCount} TỪ VỰNG
                        </Badge>
                    </Box>
                </Flex>

                <Flex gap={1}>
                    <IconButton size="sm" variant="ghost" colorPalette="gray" borderRadius="full"
                        _hover={{ bg: "gray.100", transform: "scale(1.1)" }}
                        _dark={{ _hover: { bg: "whiteAlpha.100" } }}
                        transition="all 0.2s"
                        onClick={(e) => { e.stopPropagation(); onEdit(set); }}
                    >
                        <FiEdit2 size={14} />
                    </IconButton>
                    <IconButton size="sm" variant="ghost" colorPalette="red" borderRadius="full"
                        _hover={{ bg: "red.100", color: "red.600", transform: "rotate(10deg)" }}
                        _dark={{ _hover: { bg: "red.900/40" } }}
                        transition="all 0.2s"
                        onClick={(e) => { e.stopPropagation(); onDelete(set._id); }}
                    >
                        <FiTrash2 size={14} />
                    </IconButton>
                </Flex>
            </Flex>

            <Text color="fg.muted" fontSize="sm" mb={4} lineHeight="1.6" noOfLines={2} minH="45px">
                {isDisabled
                    ? <Text as="span" color="orange.500" fontStyle="italic" fontSize="xs">⚠️ Bộ từ này đang bị tắt. Các từ sẽ không được học hay tính vào thống kê.</Text>
                    : (set.description || "Chưa có mô tả nào cho bộ từ này.")
                }
            </Text>

            <Flex gap={3} mb={2}>
                <Button flex={1} size="md" variant="subtle" colorPalette={isDisabled ? "gray" : c} borderRadius="xl" gap={2}
                    onClick={(e) => { e.stopPropagation(); navigate(`/sets/${set._id}`); }}
                    _hover={{ bg: isDisabled ? "gray.200" : `${c}.200` }}
                    _dark={{ _hover: { bg: isDisabled ? "gray.700" : `${c}.800` } }}
                    transition="all 0.2s"
                >
                    <FiBook size={16} /> Quản lý
                </Button>
                <Button flex={1} size="md" borderRadius="xl" gap={2}
                    bg={isDisabled
                        ? "gray.200"
                        : `linear-gradient(135deg, var(--chakra-colors-${c}-400) 0%, var(--chakra-colors-${c}-600) 100%)`
                    }
                    color={isDisabled ? "gray.500" : "white"}
                    cursor={isDisabled ? "not-allowed" : "pointer"}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (!isDisabled) navigate(`/study/${set._id}`);
                    }}
                    _hover={isDisabled ? {} : { opacity: 0.9, transform: "scale(1.02)" }}
                    transition="all 0.2s"
                    title={isDisabled ? "Bộ từ đang bị tắt" : "Học ngay"}
                >
                    <FiPlay size={16} /> Học ngay
                </Button>
            </Flex>

            {/* Disable toggle */}
            <Button
                w="full" size="sm" borderRadius="xl" gap={2} variant="ghost"
                colorPalette={isDisabled ? "orange" : "gray"}
                loading={togglingDisable}
                onClick={async (e) => {
                    e.stopPropagation();
                    setTogglingDisable(true);
                    try { await onToggleDisable(set._id); }
                    finally { setTogglingDisable(false); }
                }}
                borderWidth="1px"
                borderColor={isDisabled ? "orange.300" : "border.muted"}
                _dark={{ borderColor: isDisabled ? "orange.700" : "border.muted" }}
                transition="all 0.2s"
                mb={1}
            >
                {isDisabled
                    ? <><FiPlayCircle size={13} /> Bật lại bộ từ</>  
                    : <><FiPauseCircle size={13} /> Tắt bộ từ</>  
                }
            </Button>

            {/* Privacy toggle */}
            <Button
                w="full" size="sm" borderRadius="xl" gap={2} variant="ghost"
                colorPalette={set.isPublic ? "green" : "gray"}
                loading={toggling}
                onClick={async (e) => {
                    e.stopPropagation();
                    setToggling(true);
                    try { await onTogglePublic(set._id, !set.isPublic); }
                    finally { setToggling(false); }
                }}
                borderWidth="1px"
                borderColor={set.isPublic ? "green.200" : "border.muted"}
                _dark={{ borderColor: set.isPublic ? "green.700" : "border.muted" }}
                transition="all 0.2s"
            >
                {set.isPublic ? <><FiGlobe size={13} /> Công khai — chuyển thành Riêng tư</> : <><FiLock size={13} /> Riêng tư — chuyển thành Công khai</>}
            </Button>

            {/* Move to folder */}
            <Button
                w="full" size="sm" borderRadius="xl" gap={2} variant="ghost"
                colorPalette="purple"
                onClick={(e) => { e.stopPropagation(); setShowMoveModal(true); }}
                borderWidth="1px" borderColor="border.muted"
                _dark={{ borderColor: "border.muted" }}
                transition="all 0.2s"
            >
                <FiCornerUpRight size={13} /> Chuyển vào thư mục
            </Button>

            {/* Move Modal */}
            {showMoveModal && (
                <MoveFolderModal
                    set={set}
                    folders={folders}
                    onClose={() => setShowMoveModal(false)}
                    onMove={onMoveToFolder}
                />
            )}
        </Box>
    );
};

// ── Folder Card (Compact Redesign) ───────────────────────────────────────────
const FolderCard = ({ folder, onClick, onDelete, onEdit }) => {
    const c = folder.color || "purple";
    const hasDesc = !!folder.description?.trim();
    return (
        <Box
            position="relative"
            role="group"
            onClick={() => onClick(folder._id, folder.name)}
            bg="bg.panel"
            _dark={{ bg: "gray.800" }}
            borderRadius="xl"
            p={5}
            cursor="pointer"
            borderWidth="1px"
            borderColor="border.muted"
            transition="all 0.2s"
            _hover={{
                transform: "translateY(-2px)",
                shadow: "md",
                borderColor: `${c}.400`,
            }}
            display="flex"
            gap={4}
            minH="100px"
        >
            <Flex
                w="44px"
                h="44px"
                borderRadius="lg"
                bg={`${c}.500`}
                color="white"
                align="center"
                justify="center"
                flexShrink={0}
                mt={1}
            >
                <FiFolder size={20} />
            </Flex>

            <Box flex={1} minW={0}>
                <Flex justify="space-between" align="flex-start" mb={1}>
                    <Box minW={0}>
                        <Text fontSize="md" fontWeight="bold" isTruncated>
                            {folder.name}
                        </Text>
                        <Text fontSize="xs" fontWeight="bold" color={`${c}.500`}>
                            {folder.setCount || 0} bộ từ
                        </Text>
                    </Box>

                    <Flex gap={1} opacity={0} _groupHover={{ opacity: 1 }} transition="opacity 0.2s">
                        <IconButton
                            size="xs" variant="ghost" colorPalette="gray"
                            onClick={(e) => { e.stopPropagation(); onEdit(folder); }}
                        >
                            <FiEdit2 size={12} />
                        </IconButton>
                        <IconButton
                            size="xs" variant="ghost" colorPalette="red"
                            onClick={(e) => { e.stopPropagation(); onDelete(folder._id); }}
                        >
                            <FiTrash2 size={12} />
                        </IconButton>
                    </Flex>
                </Flex>

                <Text fontSize="xs" color={hasDesc ? "fg.muted" : "gray.400"} noOfLines={2} fontStyle={hasDesc ? "normal" : "italic"}>
                    {hasDesc ? folder.description : "Chưa có mô tả cho thư mục này."}
                </Text>
            </Box>
        </Box>
    );
};

// ── Public Set Card ───────────────────────────────────────────────────────────
const PublicSetCard = ({ set, onFork }) => {
    const [forking, setForking] = useState(false);
    const c = set.color || "blue";

    const handleFork = async (e) => {
        e.stopPropagation();
        setForking(true);
        try {
            await onFork(set._id);
        } finally {
            setForking(false);
        }
    };

    return (
        <Box
            position="relative" bg="bg.panel" borderRadius="2xl" p={5}
            borderWidth="1px" borderColor="border.muted" overflow="hidden"
            transition="all 0.3s ease"
            _hover={{ transform: "translateY(-4px)", shadow: "lg", borderColor: `${c}.300` }}
        >
            <Box position="absolute" top={0} left={0} right={0} h="4px"
                bg={`linear-gradient(90deg, var(--chakra-colors-${c}-400), var(--chakra-colors-${c}-600))`}
            />

            <Flex align="center" gap={3} mb={3} mt={2}>
                <Flex w="44px" h="44px" flexShrink={0} borderRadius="xl"
                    bg={`${c}.100`} _dark={{ bg: `${c}.900` }}
                    align="center" justify="center" fontSize="xl"
                >
                    📖
                </Flex>
                <Box flex={1} minW={0}>
                    <Text fontWeight="700" fontSize="md" isTruncated>{set.title}</Text>
                    <Flex align="center" gap={2} mt={0.5}>
                        <Badge colorPalette={c} variant="subtle" size="sm">{set.wordCount} từ</Badge>
                        <Badge colorPalette="green" variant="subtle" size="sm" gap={1}>
                            <FiGlobe size={9} /> Công khai
                        </Badge>
                    </Flex>
                </Box>
            </Flex>

            <Text color="fg.muted" fontSize="sm" mb={3} noOfLines={2} minH="40px" lineHeight="1.6">
                {set.description || "Chưa có mô tả."}
            </Text>

            {/* Owner info */}
            {set.owner && (
                <Flex align="center" gap={2} mb={4}>
                    {set.owner.picture ? (
                        <Box as="img" src={set.owner.picture} w="20px" h="20px"
                            borderRadius="full" flexShrink={0} />
                    ) : (
                        <Box w="20px" h="20px" borderRadius="full" bg="gray.300" flexShrink={0} />
                    )}
                    <Text fontSize="xs" color="fg.muted" isTruncated>
                        {set.owner.name}
                    </Text>
                </Flex>
            )}

            <Button
                w="full" size="sm" colorPalette="green" borderRadius="xl" gap={2}
                onClick={handleFork} loading={forking}
                _hover={{ transform: "scale(1.02)" }} transition="all 0.2s"
            >
                <FiGitBranch size={14} /> Fork & Học bộ từ này
            </Button>
        </Box>
    );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const SetsPage = () => {
    const {
        wordSets, folders, publicSets,
        fetchWordSets, fetchFolders, fetchPublicSets,
        createWordSet, deleteWordSet, updateWordSet, toggleDisableWordSet, moveWordSetToFolder,
        createFolder, updateFolder, deleteFolder,
        forkWordSet,
        loading, publicLoading, totalPublicSets
    } = useVocabularyStore();

    const [showCreate, setShowCreate] = useState(false);
    const [editingSet, setEditingSet] = useState(null);
    const [showFolderModal, setShowFolderModal] = useState(false);
    const [editingFolder, setEditingFolder] = useState(null);
    const [tab, setTab] = useState("mine"); // "mine" | "community"
    const [publicPage, setPublicPage] = useState(1);
    const [setFilter, setSetFilter] = useState("active"); // "all" | "active" | "disabled"

    // Navigation state
    const [currentFolder, setCurrentFolder] = useState(null); // { id, name } | null

    useEffect(() => {
        if (tab === "mine") {
            if (currentFolder) {
                fetchWordSets(currentFolder.id);
            } else {
                fetchFolders();
                fetchWordSets("root"); // Fetch orphaned sets
            }
        }
        // Reset filter khi chuyển folder/tab
        setSetFilter("active");
    }, [tab, currentFolder]);

    useEffect(() => {
        if (tab === "community") {
            fetchPublicSets({ page: publicPage, limit: 10 });
        } else {
            // Fetch public sets once at start just to get the count
            if (totalPublicSets === 0) fetchPublicSets({ page: 1, limit: 10 });
        }
    }, [tab, publicPage]);

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc muốn xóa bộ từ này? Tất cả từ vựng trong bộ sẽ bị xóa.")) return;
        await deleteWordSet(id);
    };

    const handleTogglePublic = async (id, isPublic) => {
        await updateWordSet(id, { isPublic });
    };

    const handleToggleDisable = async (id) => {
        await toggleDisableWordSet(id);
    };

    const handleMoveToFolder = async (id, folderId) => {
        const res = await moveWordSetToFolder(id, folderId);
        // Refresh folders to update setCount
        await fetchFolders();
        return res;
    };

    const handleFork = async (id) => {
        const res = await forkWordSet(id);
        if (res.alreadyForked) {
            alert("Bạn đã fork bộ từ này trước đó rồi!");
        } else {
            alert(res.message || "Fork thành công! Bộ từ đã được thêm vào danh sách của bạn.");
            setTab("mine");
            setCurrentFolder(null); // Go to root to see the new set
        }
    };

    const handleCreateOrUpdateSet = async (payload) => {
        if (editingSet) {
            await updateWordSet(editingSet._id, payload);
        } else {
            await createWordSet({
                ...payload,
                folderId: currentFolder?.id || null
            });
        }
        setEditingSet(null);
        setShowCreate(false);
    };

    const handleDeleteFolder = async (id) => {
        if (!window.confirm("Xóa thư mục này? Các bộ từ bên trong sẽ được đưa ra ngoài màn hình chính.")) return;
        await deleteFolder(id);
    };

    const isRoot = !currentFolder;

    return (
        <BaseLayout>
            <Box maxW="1400px" mx="auto">
                {/* Header */}
                <Flex
                    direction={{ base: "column", sm: "row" }}
                    justify="space-between" align={{ base: "flex-start", sm: "center" }}
                    gap={4} mb={8} p={8} borderRadius="2xl"
                    bg="bg.panel" borderWidth="1px" borderColor="border.muted"
                    boxShadow="sm" position="relative" overflow="hidden"
                >
                    <Box position="absolute" top="-20%" left="-5%"
                        w="250px" h="250px" bg="brand.400" opacity={0.05}
                        filter="blur(60px)" borderRadius="full" pointerEvents="none"
                    />

                    <Box position="relative" zIndex={1} flex={1}>
                        <Flex align="center" gap={3} mb={1}>
                            {currentFolder && (
                                <IconButton
                                    variant="subtle" size="sm" borderRadius="lg"
                                    onClick={() => setCurrentFolder(null)}
                                >
                                    <FiChevronLeft size={18} />
                                </IconButton>
                            )}
                            <Text fontSize={{ base: "xl", md: "2xl" }}
                                fontWeight="900" letterSpacing="tight">
                                {currentFolder ? currentFolder.name : "Thư viện bộ từ"}
                            </Text>

                            {currentFolder && (
                                <IconButton
                                    variant="ghost" size="xs" colorPalette="gray" borderRadius="full"
                                    onClick={() => {
                                        const folderToEdit = folders.find(f => f._id === currentFolder.id);
                                        if (folderToEdit) {
                                            setEditingFolder(folderToEdit);
                                            setShowFolderModal(true);
                                        }
                                    }}
                                >
                                    <FiEdit2 size={14} />
                                </IconButton>
                            )}
                        </Flex>
                        <Text color="fg.muted" fontSize="sm" fontWeight="500">
                            {currentFolder
                                ? `Khám phá ${wordSets.length} học liệu trong thư mục này`
                                : `Hệ thống hóa ${folders.length} thư mục và ${wordSets.length} học liệu lẻ`
                            }
                        </Text>
                    </Box>

                    {isRoot ? (
                        <Button
                            size="md" borderRadius="xl"
                            colorPalette="purple" variant="solid"
                            fontWeight="700" flexShrink={0}
                            _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
                            transition="all 0.2s"
                            onClick={() => {
                                setEditingFolder(null);
                                setShowFolderModal(true);
                            }} gap={2} zIndex={1}
                        >
                            <FiPlus size={18} /> Tạo thư mục
                        </Button>
                    ) : (
                        <Button
                            size="md" borderRadius="xl"
                            bg="linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)"
                            color="white" fontWeight="700" flexShrink={0}
                            _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
                            transition="all 0.2s"
                            onClick={() => setShowCreate(true)} gap={2} zIndex={1}
                        >
                            <FiPlus size={18} /> Tạo bộ từ mới
                        </Button>
                    )}
                </Flex>

                {/* Tabs */}
                <Flex gap={1} mb={6} bg="bg.subtle" p={1} borderRadius="xl" w="fit-content">
                    {[
                        { key: "mine", label: "📚 Của tôi", count: wordSets.length },
                        { key: "community", label: "🌐 Cộng đồng", count: totalPublicSets || null },
                    ].map(({ key, label, count }) => (
                        <Button
                            key={key} size="sm" borderRadius="lg"
                            variant={tab === key ? "solid" : "ghost"}
                            colorPalette={tab === key ? "blue" : "gray"}
                            onClick={() => setTab(key)}
                            gap={1.5}
                        >
                            {label}
                            {count ? (
                                <Badge size="sm" colorPalette={tab === key ? "blue" : "gray"}
                                    variant="subtle" borderRadius="full">{count}</Badge>
                            ) : null}
                        </Button>
                    ))}
                </Flex>

                {/* ── Tab: Của tôi ── */}
                {tab === "mine" && (
                    loading ? (
                        <Flex justify="center" py={40}><Spinner size="xl" color="brand.500" thickness="4px" /></Flex>
                    ) : (wordSets.length === 0 && folders.length === 0 && isRoot) ? (
                        <Flex direction="column" align="center" justify="center"
                            py={32} borderRadius="3xl" borderWidth="2px"
                            borderStyle="dashed" borderColor="border.muted" gap={6}
                            bg="bg.panel"
                        >
                            <Box fontSize="7xl" mb={2}>📁</Box>
                            <Box textAlign="center">
                                <Text fontWeight="900" fontSize="2xl" mb={2}>Thư viện trống</Text>
                                <Text color="fg.muted" maxW="400px" fontSize="md">
                                    Hãy bắt đầu bằng việc tạo một thư mục để lưu trữ các bộ từ vựng của bạn một cách khoa học.
                                </Text>
                            </Box>
                            <Button colorPalette="purple" size="xl" h="60px" px={10} borderRadius="2xl" onClick={() => {
                                setEditingFolder(null);
                                setShowFolderModal(true);
                            }}>
                                <FiPlus size={24} /> Tạo thư mục đầu tiên
                            </Button>
                        </Flex>
                    ) : (
                        <Box>
                            {/* Render Folders (only at root) */}
                            {isRoot && folders.length > 0 && (
                                <Box mb={12}>
                                    <Text fontSize="xs" fontWeight="900" color="fg.muted" mb={5} textTransform="uppercase" letterSpacing="widest">
                                        Thư mục của bạn
                                    </Text>
                                    <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap={5}>
                                        {folders.map(f => (
                                            <FolderCard
                                                key={f._id} folder={f}
                                                onClick={(id, name) => setCurrentFolder({ id, name })}
                                                onDelete={handleDeleteFolder}
                                                onEdit={(folder) => {
                                                    setEditingFolder(folder);
                                                    setShowFolderModal(true);
                                                }}
                                            />
                                        ))}
                                    </SimpleGrid>
                                </Box>
                            )}

                            {/* Render Sets */}
                            <Box>
                                {/* Filter bar — chỉ hiện khi bên trong folder */}
                                {!isRoot && wordSets.length > 0 && (
                                    <Flex align="center" justify="space-between" mb={5} gap={3} flexWrap="wrap">
                                        <Text fontSize="xs" fontWeight="900" color="fg.muted" textTransform="uppercase" letterSpacing="widest">
                                            Bộ từ trong "{currentFolder.name}"
                                        </Text>
                                        <Flex gap={1} bg="bg.subtle" p={1} borderRadius="lg">
                                            {[
                                                { key: "all", label: "Tất cả", count: wordSets.length },
                                                { key: "active", label: "✅ Bật", count: wordSets.filter(s => !s.isDisabled).length },
                                                { key: "disabled", label: "⏸ Tắt", count: wordSets.filter(s => s.isDisabled).length },
                                            ].map(({ key, label, count }) => (
                                                <Button
                                                    key={key} size="xs" borderRadius="md"
                                                    variant={setFilter === key ? "solid" : "ghost"}
                                                    colorPalette={setFilter === key
                                                        ? key === "disabled" ? "orange" : "blue"
                                                        : "gray"
                                                    }
                                                    onClick={() => setSetFilter(key)}
                                                    gap={1}
                                                >
                                                    {label}
                                                    <Badge
                                                        size="xs" borderRadius="full"
                                                        colorPalette={setFilter === key
                                                            ? key === "disabled" ? "orange" : "blue"
                                                            : "gray"
                                                        }
                                                        variant="subtle"
                                                    >
                                                        {count}
                                                    </Badge>
                                                </Button>
                                            ))}
                                        </Flex>
                                    </Flex>
                                )}

                                {isRoot && wordSets.length > 0 && (
                                    <Text fontSize="xs" fontWeight="900" color="fg.muted" mb={5} textTransform="uppercase" letterSpacing="widest">
                                        Bộ từ lẻ
                                    </Text>
                                )}

                                {(() => {
                                    const filteredSets = !isRoot
                                        ? wordSets.filter(s => {
                                            if (setFilter === "active") return !s.isDisabled;
                                            if (setFilter === "disabled") return !!s.isDisabled;
                                            return true;
                                        })
                                        : wordSets;

                                    return filteredSets.length > 0 ? (
                                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
                                        {filteredSets.map((set) => (
                                            <SetCard
                                            key={set._id}
                                            set={set}
                                            folders={folders}
                                            onDelete={handleDelete}
                                            onTogglePublic={handleTogglePublic}
                                            onToggleDisable={handleToggleDisable}
                                            onMoveToFolder={handleMoveToFolder}
                                            onEdit={(s) => {
                                                setEditingSet(s);
                                                setShowCreate(true);
                                            }}
                                        />
                                        ))}
                                    </SimpleGrid>
                                    ) : (
                                        <Flex direction="column" align="center" justify="center"
                                            py={20} bg="bg.panel" borderRadius="3xl"
                                            borderStyle="dashed" borderWidth="2px" borderColor="border.muted" gap={3}
                                        >
                                            <Box fontSize="4xl">
                                                {setFilter === "disabled" ? "⏸" : setFilter === "active" ? "✅" : "📖"}
                                            </Box>
                                            <Box textAlign="center">
                                                <Text fontWeight="bold" fontSize="md">
                                                    {setFilter === "disabled"
                                                        ? "Không có bộ từ nào đang tắt"
                                                        : setFilter === "active"
                                                        ? "Không có bộ từ nào đang bật"
                                                        : "Thư mục này chưa có bộ từ"
                                                    }
                                                </Text>
                                                <Text fontSize="sm" color="fg.muted">
                                                    {setFilter !== "all"
                                                        ? `Chuyển sang xem "Tất cả" để xem đầy đủ`
                                                        : "Bắt đầu tạo học liệu đầu tiên cho thư mục này"
                                                    }
                                                </Text>
                                            </Box>
                                            {setFilter !== "all" && (
                                                <Button size="sm" variant="subtle" colorPalette="blue"
                                                    borderRadius="xl"
                                                    onClick={() => setSetFilter("all")}
                                                >
                                                    Xem tất cả bộ từ
                                                </Button>
                                            )}
                                            {setFilter === "all" && !isRoot && (
                                                <Button size="lg" colorPalette="blue" borderRadius="xl" onClick={() => setShowCreate(true)}>
                                                    <FiPlus /> Tạo bộ từ mới
                                                </Button>
                                            )}
                                        </Flex>
                                    );
                                })()}
                            </Box>
                        </Box>
                    )
                )}

                {/* ── Tab: Cộng đồng ── */}
                {tab === "community" && (
                    publicLoading ? (
                        <Flex justify="center" py={20}><Spinner size="xl" /></Flex>
                    ) : publicSets.length === 0 ? (
                        <Flex direction="column" align="center" py={20} gap={3} color="fg.muted">
                            <Text fontSize="5xl">🌐</Text>
                            <Text fontWeight="bold" fontSize="lg">Chưa có bộ từ công khai nào</Text>
                            <Text fontSize="sm">Hãy chia sẻ bộ từ của bạn để cộng đồng cùng học!</Text>
                        </Flex>
                    ) : (
                        <Box>
                            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={5} mb={8}>
                                {publicSets.map((set) => (
                                    <PublicSetCard key={set._id} set={set} onFork={handleFork} />
                                ))}
                            </SimpleGrid>

                            {/* Pagination - WordTable Style */}
                            <Flex
                                align="center" justify="space-between"
                                px={5} py={4}
                                borderTop="1px solid"
                                borderColor="border.muted"
                                bg="bg.subtle"
                                borderRadius="xl"
                                mt={8}
                            >
                                <Text fontSize="sm" color="fg.muted">
                                    Hiển thị <strong>{(publicPage - 1) * 10 + 1}–{Math.min(publicPage * 10, totalPublicSets)}</strong> / {totalPublicSets} bộ từ
                                </Text>

                                <Flex align="center" gap={2}>
                                    <IconButton
                                        size="sm" variant="ghost"
                                        disabled={publicPage === 1 || publicLoading}
                                        onClick={() => setPublicPage((p) => p - 1)}
                                        aria-label="Trang trước"
                                    >
                                        <FiChevronLeft />
                                    </IconButton>

                                    {/* Page numbers logic from WordTable */}
                                    {Array.from({ length: Math.ceil(totalPublicSets / 10) }, (_, i) => i + 1)
                                        .filter((p) => p === 1 || p === Math.ceil(totalPublicSets / 10) || Math.abs(p - publicPage) <= 1)
                                        .reduce((acc, p, i, arr) => {
                                            if (i > 0 && p - arr[i - 1] > 1) acc.push("...");
                                            acc.push(p);
                                            return acc;
                                        }, [])
                                        .map((p, i) =>
                                            p === "..." ? (
                                                <Text key={`dot-${i}`} fontSize="sm" color="fg.muted" px={1}>…</Text>
                                            ) : (
                                                <Button
                                                    key={p}
                                                    size="sm"
                                                    variant={p === publicPage ? "solid" : "ghost"}
                                                    colorPalette={p === publicPage ? "blue" : "gray"}
                                                    onClick={() => setPublicPage(p)}
                                                    minW="32px"
                                                    borderRadius="lg"
                                                >
                                                    {p}
                                                </Button>
                                            )
                                        )}

                                    <IconButton
                                        size="sm" variant="ghost"
                                        disabled={publicPage >= Math.ceil(totalPublicSets / 10) || publicLoading}
                                        onClick={() => setPublicPage((p) => p + 1)}
                                        aria-label="Trang sau"
                                    >
                                        <FiChevronRight />
                                    </IconButton>
                                </Flex>
                            </Flex>
                        </Box>
                    )
                )}
            </Box>

            {showCreate && (
                <WordSetModal
                    onClose={() => {
                        setShowCreate(false);
                        setEditingSet(null);
                    }}
                    onSave={handleCreateOrUpdateSet}
                    initialData={editingSet}
                />
            )}

            {showFolderModal && (
                <FolderModal
                    onClose={() => {
                        setShowFolderModal(false);
                        setEditingFolder(null);
                    }}
                    onSave={async (data) => {
                        if (editingFolder) {
                            await updateFolder(editingFolder._id, data);
                            // Cập nhật lại tên Header nếu đang ở trong folder này
                            if (currentFolder && currentFolder.id === editingFolder._id) {
                                setCurrentFolder(prev => ({ ...prev, name: data.name }));
                            }
                        } else {
                            await createFolder(data);
                        }
                    }}
                    initialData={editingFolder}
                />
            )}
        </BaseLayout>
    );
};

export default SetsPage;
