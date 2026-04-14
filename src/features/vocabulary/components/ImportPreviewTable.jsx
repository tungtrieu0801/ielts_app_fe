import React, { useState } from "react";
import {
    Box, Flex, Text, Button, Input, Badge, IconButton, Tooltip,
} from "@chakra-ui/react";
import { FiTrash2, FiAlertCircle, FiCheck } from "react-icons/fi";

// Các cột cần map từ Excel vào field chuẩn
const FIELD_MAP = {
    english: ["english", "en", "word", "từ", "tu"],
    vietnamese: ["vietnamese", "vi", "meaning", "nghĩa", "nghia"],
    example: ["example", "ex", "sentence", "ví dụ", "vi du"],
    synonyms: ["synonyms", "synonym", "đồng nghĩa", "dong nghia"],
    antonyms: ["antonyms", "antonym", "trái nghĩa", "trai nghia"],
};

const detectField = (header) => {
    const h = header.toLowerCase().trim();
    for (const [field, aliases] of Object.entries(FIELD_MAP)) {
        if (aliases.some((a) => h.includes(a))) return field;
    }
    return null;
};

const ImportPreviewTable = ({ headers, rows, onConfirm, onCancel }) => {
    const [data, setData] = useState(() =>
        rows.map((row, i) => ({
            _id: i,
            english: row[headers.find((h) => detectField(h) === "english")] || "",
            vietnamese: row[headers.find((h) => detectField(h) === "vietnamese")] || "",
            example: row[headers.find((h) => detectField(h) === "example")] || "",
            synonyms: row[headers.find((h) => detectField(h) === "synonyms")] || "",
            antonyms: row[headers.find((h) => detectField(h) === "antonyms")] || "",
        }))
    );
    const [saving, setSaving] = useState(false);

    const isRowInvalid = (row) => !row.english?.trim() || !row.vietnamese?.trim();
    const validCount = data.filter((r) => !isRowInvalid(r)).length;
    const invalidCount = data.length - validCount;

    const updateCell = (rowId, field, value) => {
        setData((prev) =>
            prev.map((r) => (r._id === rowId ? { ...r, [field]: value } : r))
        );
    };

    const deleteRow = (rowId) => {
        setData((prev) => prev.filter((r) => r._id !== rowId));
    };

    const handleConfirm = async () => {
        setSaving(true);
        try {
            const valid = data.filter((r) => !isRowInvalid(r));
            await onConfirm(valid);
        } finally {
            setSaving(false);
        }
    };

    const EditableCell = ({ value, field, rowId, required }) => {
        const [editing, setEditing] = useState(false);
        const [val, setVal] = useState(value);

        const commit = () => {
            updateCell(rowId, field, val);
            setEditing(false);
        };

        if (editing) {
            return (
                <Input
                    size="xs" value={val}
                    onChange={(e) => setVal(e.target.value)}
                    onBlur={commit}
                    onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
                    autoFocus
                    borderColor={required && !val?.trim() ? "red.400" : "border.muted"}
                />
            );
        }

        const isEmpty = required && !value?.trim();
        return (
            <Box
                onClick={() => setEditing(true)}
                cursor="text"
                px={2} py={1}
                borderRadius="md"
                minH="28px"
                _hover={{ bg: "bg.subtle" }}
                color={isEmpty ? "red.400" : "fg"}
                fontSize="sm"
            >
                {isEmpty ? <Flex align="center" gap={1}><FiAlertCircle size={12} /><Text fontSize="xs">Bắt buộc</Text></Flex> : value}
            </Box>
        );
    };

    return (
        <Box mt={6}>
            <Flex justify="space-between" align="center" mb={4}>
                <Flex align="center" gap={3}>
                    <Text fontWeight="bold" fontSize="lg">Preview dữ liệu</Text>
                    <Badge colorPalette="green">{validCount} hợp lệ</Badge>
                    {invalidCount > 0 && <Badge colorPalette="red">{invalidCount} lỗi</Badge>}
                </Flex>
                <Flex gap={2}>
                    <Button size="sm" variant="ghost" onClick={onCancel}>Hủy</Button>
                    <Button
                        size="sm" colorPalette="blue"
                        onClick={handleConfirm}
                        loading={saving}
                        disabled={validCount === 0}
                    >
                        <FiCheck /> Lưu {validCount} từ
                    </Button>
                </Flex>
            </Flex>

            <Box
                borderWidth="1px" borderColor="border.muted" borderRadius="xl"
                overflow="hidden"
            >
                <Box overflowX="auto" maxH="420px" overflowY="auto">
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ position: "sticky", top: 0, zIndex: 10 }}>
                                {["#", "English *", "Vietnamese *", "Example", "Synonyms", "Antonyms", ""].map((h) => (
                                    <th key={h} style={{
                                        padding: "10px 12px",
                                        textAlign: "left",
                                        fontSize: "12px",
                                        fontWeight: "600",
                                        background: "var(--chakra-colors-bg-subtle)",
                                        borderBottom: "1px solid var(--chakra-colors-border-muted)",
                                        whiteSpace: "nowrap",
                                        color: "var(--chakra-colors-fg-muted)",
                                    }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, idx) => {
                                const invalid = isRowInvalid(row);
                                return (
                                    <tr
                                        key={row._id}
                                        style={{
                                            background: invalid
                                                ? "var(--chakra-colors-red-50)"
                                                : idx % 2 === 0 ? "transparent" : "var(--chakra-colors-bg-subtle)",
                                        }}
                                    >
                                        <td style={{ padding: "4px 12px", fontSize: "12px", color: "var(--chakra-colors-fg-subtle)", width: "40px" }}>{idx + 1}</td>
                                        <td style={{ padding: "4px 8px", minWidth: "140px" }}>
                                            <EditableCell value={row.english} field="english" rowId={row._id} required />
                                        </td>
                                        <td style={{ padding: "4px 8px", minWidth: "140px" }}>
                                            <EditableCell value={row.vietnamese} field="vietnamese" rowId={row._id} required />
                                        </td>
                                        <td style={{ padding: "4px 8px", minWidth: "180px" }}>
                                            <EditableCell value={row.example} field="example" rowId={row._id} />
                                        </td>
                                        <td style={{ padding: "4px 8px", minWidth: "120px" }}>
                                            <EditableCell value={row.synonyms} field="synonyms" rowId={row._id} />
                                        </td>
                                        <td style={{ padding: "4px 8px", minWidth: "120px" }}>
                                            <EditableCell value={row.antonyms} field="antonyms" rowId={row._id} />
                                        </td>
                                        <td style={{ padding: "4px 8px", width: "48px" }}>
                                            <IconButton size="xs" variant="ghost" colorPalette="red" onClick={() => deleteRow(row._id)}>
                                                <FiTrash2 size={13} />
                                            </IconButton>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </Box>
            </Box>
        </Box>
    );
};

export default ImportPreviewTable;
