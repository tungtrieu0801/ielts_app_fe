import React from "react";
import { Card, Button, Flex, Text, Badge } from "@chakra-ui/react";
import DataTable from "./DataTable";

const PreviewSection = ({ previewData, columns, onConfirm, onCancel }) => {

    if (!previewData.length) return null;

    return (

        <Card.Root p="6" mb="6" borderColor="orange.200">

            <Flex justify="space-between" mb="4">

                <div>

                    <Text fontWeight="bold" fontSize="lg">
                        Preview Import
                    </Text>

                    <Text fontSize="sm" color="gray.500">
                        {previewData.length} words detected
                    </Text>

                </div>

                <Flex gap="3">

                    <Button variant="outline" onClick={onCancel}>
                        Hủy
                    </Button>

                    <Button colorScheme="orange" onClick={onConfirm}>
                        Thêm từ
                    </Button>

                </Flex>

            </Flex>

            <DataTable columns={columns} data={previewData} />

        </Card.Root>
    );
};

export default PreviewSection;