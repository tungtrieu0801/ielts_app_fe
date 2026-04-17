import React, { useState } from "react";
import {
    Box, Flex, Text, Input, Badge, IconButton, Spinner, Button,
} from "@chakra-ui/react";
import { FiTrash2, FiEdit2, FiCheck, FiX } from "react-icons/fi";
import { useVocabularyStore } from "../../../stores/useVocabularyStore.js";

const WordRow = ({ word, setId, index }) => {
    const { updateWord, deleteWord } = useVocabularyStore();
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({
        english: word.english,
        vietnamese: word.vietnamese,
        pronunciation: word.pronunciation || "",
        partOfSpeech: word.partOfSpeech || "",
        example: word.example,
    });
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        await updateWord(setId, word._id, form);
        setSaving(false);
        setEditing(false);
    };

    const handleDelete = async () => {
        if (!window.confirm(`Xóa từ "${word.english}"?`)) return;
        await deleteWord(setId, word._id);
    };

    const srsColor = word.interval >= 21 ? "green" : word.interval >= 7 ? "blue" : word.interval >= 1 ? "orange" : "gray";
    const srsLabel = word.interval >= 21 ? "Thuộc" : word.interval >= 7 ? "Tốt" : word.interval >= 1 ? "Đang học" : "Mới";

    return (
        <tr style={{
            background: index % 2 === 0 ? "transparent" : "var(--chakra-colors-bg-subtle)",
            transition: "background 0.15s",
        }}>
            <td style={{ padding: "10px 16px", fontSize: "13px", color: "var(--chakra-colors-fg-subtle)", width: "40px" }}>{index + 1}</td>
            <td style={{ padding: "10px 8px", minWidth: "140px", fontWeight: 600 }}>
                {editing ? (
                    <Input size="xs" value={form.english} onChange={(e) => setForm({ ...form, english: e.target.value })} borderColor="blue.400" />
                ) : word.english}
            </td>
            <td style={{ padding: "10px 8px", minWidth: "140px" }}>
                {editing ? (
                    <Input size="xs" value={form.vietnamese} onChange={(e) => setForm({ ...form, vietnamese: e.target.value })} />
                ) : word.vietnamese}
            </td>
            <td style={{ padding: "10px 8px", minWidth: "130px", color: "var(--chakra-colors-fg-muted)", fontSize: "13px", fontStyle: "italic" }}>
                {editing ? (
                    <Input size="xs" value={form.pronunciation} onChange={(e) => setForm({ ...form, pronunciation: e.target.value })} placeholder="/ˈwɜːd/" />
                ) : (word.pronunciation || "—")}
            </td>
            <td style={{ padding: "10px 8px", minWidth: "100px" }}>
                {editing ? (
                    <Input size="xs" value={form.partOfSpeech} onChange={(e) => setForm({ ...form, partOfSpeech: e.target.value })} placeholder="noun, verb..." />
                ) : (
                    word.partOfSpeech
                        ? <Badge colorPalette="blue" size="sm" variant="subtle">{word.partOfSpeech}</Badge>
                        : "—"
                )}
            </td>
            <td style={{ padding: "10px 8px", minWidth: "200px", color: "var(--chakra-colors-fg-muted)", fontSize: "13px" }}>
                {editing ? (
                    <Input size="xs" value={form.example} onChange={(e) => setForm({ ...form, example: e.target.value })} />
                ) : (word.example || "—")}
            </td>
            <td style={{ padding: "10px 8px" }}>
                <Badge colorPalette={srsColor} size="sm">{srsLabel}</Badge>
            </td>
            <td style={{ padding: "10px 8px", fontSize: "12px", color: "var(--chakra-colors-fg-subtle)" }}>
                {word.nextReview ? new Date(word.nextReview).toLocaleDateString("vi-VN") : "—"}
            </td>
            <td style={{ padding: "10px 8px" }}>
                <Flex gap={1}>
                    {editing ? (
                        <>
                            <IconButton size="xs" colorPalette="green" onClick={handleSave} loading={saving}><FiCheck /></IconButton>
                            <IconButton size="xs" variant="ghost" onClick={() => setEditing(false)}><FiX /></IconButton>
                        </>
                    ) : (
                        <>
                            <IconButton size="xs" variant="ghost" onClick={() => setEditing(true)}><FiEdit2 size={12} /></IconButton>
                            <IconButton size="xs" variant="ghost" colorPalette="red" onClick={handleDelete}><FiTrash2 size={12} /></IconButton>
                        </>
                    )}
                </Flex>
            </td>
        </tr>
    );
};

const WordTable = ({ words, setId, loading }) => {
    if (loading) return <Flex justify="center" py={10}><Spinner /></Flex>;

    if (words.length === 0) return (
        <Flex
            direction="column" align="center" py={12} gap={3}
            color="fg.muted"
        >
            <Text fontSize="3xl">📭</Text>
            <Text>Chưa có từ nào trong bộ này. Import file Excel để thêm từ!</Text>
        </Flex>
    );

    return (
        <Box borderWidth="1px" borderColor="border.muted" borderRadius="xl" overflow="hidden">
            <Box overflowX="auto" maxH="520px" overflowY="auto">
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            {["#", "English", "Vietnamese", "Phiên âm", "Từ loại", "Ví dụ", "Trạng thái", "Ôn tiếp", ""].map((h) => (
                                <th key={h} style={{
                                    padding: "10px 12px",
                                    textAlign: "left",
                                    fontSize: "12px",
                                    fontWeight: "600",
                                    background: "var(--chakra-colors-bg-subtle)",
                                    borderBottom: "1px solid var(--chakra-colors-border-muted)",
                                    position: "sticky",
                                    top: 0,
                                    zIndex: 10,
                                    color: "var(--chakra-colors-fg-muted)",
                                    whiteSpace: "nowrap",
                                }}>
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {words.map((word, idx) => (
                            <WordRow key={word._id} word={word} setId={setId} index={idx} />
                        ))}
                    </tbody>
                </table>
            </Box>
        </Box>
    );
};

export default WordTable;
