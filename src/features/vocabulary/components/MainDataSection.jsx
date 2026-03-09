import React from "react";
import { Input, Button, Flex, Card, Text } from "@chakra-ui/react";
import DataTable from "./DataTable";

const MainDataSection = ({ mainData, columns }) => {

    return (

        <Card.Root p="6">

            {mainData.length > 0 && (

                <Flex gap="4" mb="4">

                    <Input
                        placeholder="Tìm kiếm từ vựng..."
                        maxW="300px"
                    />

                    <Button variant="outline">
                        Filter
                    </Button>

                </Flex>

            )}

            {mainData.length === 0 ? (

                <Flex direction="column" align="center" py="20">

                    <Text color="gray.400">
                        Chưa có dữ liệu từ vựng
                    </Text>

                </Flex>

            ) : (

                <DataTable columns={columns} data={mainData} />

            )}

        </Card.Root>

    );
};

export default MainDataSection;