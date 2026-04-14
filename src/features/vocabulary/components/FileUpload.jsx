import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { Box, Button, Text, Flex } from "@chakra-ui/react";
import { FiUpload } from "react-icons/fi";

const FileUpload = ({ onFileProcessed }) => {
    const fileRef = useRef(null);
    const [dragging, setDragging] = useState(false);

    const parseFile = (file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const workbook = XLSX.read(event.target.result, { type: "binary" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            const headers = jsonData[0]?.map((h) => String(h).trim()) || [];
            const rows = jsonData.slice(1).map((row) => {
                let obj = {};
                headers.forEach((h, i) => (obj[h] = row[i] !== undefined ? String(row[i]).trim() : ""));
                return obj;
            }).filter((r) => Object.values(r).some((v) => v));
            onFileProcessed(headers, rows);
        };
        reader.readAsBinaryString(file);
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) parseFile(file);
        e.target.value = "";
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) parseFile(file);
    };

    return (
        <Box
            borderWidth="2px"
            borderStyle="dashed"
            borderColor={dragging ? "blue.400" : "border.muted"}
            borderRadius="2xl"
            p={8}
            textAlign="center"
            bg={dragging ? "blue.50" : "transparent"}
            _dark={{ bg: dragging ? "blue.900/20" : "transparent" }}
            transition="all 0.2s"
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            cursor="pointer"
            onClick={() => fileRef.current?.click()}
        >
            <Flex direction="column" align="center" gap={3}>
                <Box color="blue.400" fontSize="3xl"><FiUpload /></Box>
                <Text fontWeight="bold" fontSize="md">
                    Kéo thả file hoặc click để chọn
                </Text>
                <Text color="fg.muted" fontSize="sm">
                    Hỗ trợ file <strong>.xlsx</strong> và <strong>.csv</strong>
                </Text>
                <Text color="fg.subtle" fontSize="xs">
                    Cột bắt buộc: <strong>English</strong>, <strong>Vietnamese</strong> &nbsp;|&nbsp;
                    Tùy chọn: Example, Synonyms, Antonyms
                </Text>
                <Button colorPalette="blue" size="sm" mt={1} onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}>
                    Chọn file
                </Button>
            </Flex>
            <input
                type="file"
                accept=".xlsx,.csv"
                ref={fileRef}
                onChange={handleFileChange}
                hidden
            />
        </Box>
    );
};

export default FileUpload;