import React, { useState } from "react";
import { Heading, Box, Flex } from "@chakra-ui/react";

import BaseLayout from "../../../layouts/BaseLayout.jsx";
import FileUpload from "../components/FileUpload.jsx";
import PreviewSection from "../components/PreviewSection.jsx";
import MainDataSection from "../components/MainDataSection.jsx";

const VocabularyPage = () => {

    const [mainData, setMainData] = useState([]);
    const [previewData, setPreviewData] = useState([]);
    const [columns, setColumns] = useState([]);

    const handleDataParsed = (headers, rows) => {
        setColumns(headers);
        setPreviewData(rows);
    };

    const handleConfirmAdd = () => {
        setMainData(prev => [...prev, ...previewData]);
        setPreviewData([]);
    };

    return (
        <BaseLayout>

            <Box className="max-w-[1400px] mx-auto p-8">

                <Flex justify="space-between" align="center" mb="8">
                    <FileUpload onFileProcessed={handleDataParsed} />
                </Flex>

                <PreviewSection
                    previewData={previewData}
                    columns={columns}
                    onConfirm={handleConfirmAdd}
                    onCancel={() => setPreviewData([])}
                />

                <MainDataSection
                    mainData={mainData}
                    columns={columns}
                />

            </Box>

        </BaseLayout>
    );
};

export default VocabularyPage;