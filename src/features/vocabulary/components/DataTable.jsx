import React from "react";
import { Table, Badge } from "@chakra-ui/react";

const DataTable = ({ columns, data }) => {

    const badgeColor = {
        VERB: "blue",
        NOUN: "green",
        ADJECTIVE: "purple"
    };

    return (

        <Table.Root variant="outline" size="sm">

            <Table.Header>

                <Table.Row>

                    {columns.map((col, i) => (

                        <Table.ColumnHeader key={i}>
                            {col.replace(/_/g, " ")}
                        </Table.ColumnHeader>

                    ))}

                </Table.Row>

            </Table.Header>

            <Table.Body>

                {data.map((row, i) => (

                    <Table.Row key={i}>

                        {columns.map((col, j) => (

                            <Table.Cell key={j}>

                                {col === "Loại_từ"
                                    ? (
                                        <Badge colorScheme={badgeColor[row[col]]}>
                                            {row[col]}
                                        </Badge>
                                    )
                                    : row[col]
                                }

                            </Table.Cell>

                        ))}

                    </Table.Row>

                ))}

            </Table.Body>

        </Table.Root>

    );
};

export default DataTable;