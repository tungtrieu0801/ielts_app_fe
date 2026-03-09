import React from "react";
import { Flex, Box } from "@chakra-ui/react";

import Sidebar from "../shared/components/Slidebar.jsx";
import Header from "./components/Header.jsx";

const BaseLayout = ({ children }) => {

    return (
        <Flex h="100vh" bg="bg.main">

            {/* Sidebar Desktop */}
            <Box display={{ base: "none", md: "block" }}>
                <Sidebar />
            </Box>

            {/* Main Layout */}
            <Flex flex="1" direction="column" h="100vh" overflow="hidden">

                {/* Header */}
                <Header />

                {/* Page Content */}
                <Box
                    flex="1"
                    overflowY="auto"
                    p={{ base: 4, md: 8 }}
                >
                    {children}
                </Box>

            </Flex>

        </Flex>
    );
};

export default BaseLayout;