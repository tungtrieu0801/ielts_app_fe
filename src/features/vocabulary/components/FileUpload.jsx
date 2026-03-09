import React, { useRef } from "react";
import * as XLSX from "xlsx";
import { Button } from "@chakra-ui/react";

const FileUpload = ({ onFileProcessed }) => {

    const fileRef = useRef(null);

    const handleOpenFile = () => {
        fileRef.current?.click();
    };

    const handleFileUpload = (e) => {

        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = (event) => {

            const workbook = XLSX.read(event.target.result, { type: "binary" });

            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            const headers = jsonData[0];

            const rows = jsonData.slice(1).map(row => {
                let obj = {};
                headers.forEach((h, i) => obj[h] = row[i]);
                return obj;
            });

            onFileProcessed(headers, rows);
        };

        reader.readAsBinaryString(file);
    };

    return (
        <>
            <Button colorScheme="blue" onClick={handleOpenFile}>
                Import File
            </Button>

            <input
                type="file"
                accept=".xlsx,.csv"
                ref={fileRef}
                onChange={handleFileUpload}
                hidden
            />
        </>
    );
};

export default FileUpload;