import React from "react";
import { Flex, Box } from "@chakra-ui/react";

import Sidebar from "../shared/components/Slidebar.jsx";
import Header from "./components/Header.jsx";
import { useUIStore } from "../stores/useUIStore.js";

const BaseLayout = ({ children }) => {
    const { currentPalette } = useUIStore();
    const [isCollapsed, setIsCollapsed] = React.useState(false);

    // Sync palette to document element for global CSS variables access
    React.useEffect(() => {
        document.documentElement.setAttribute("data-palette", currentPalette);
    }, [currentPalette]);

    return (
        <Flex 
            h="100vh" 
            bg="bg.main" 
            position="relative"
        >

            {/* Sidebar Desktop */}
            <Box 
                display={{ base: "none", md: "block" }}
                w={isCollapsed ? "80px" : "240px"}
                transition="width 0.3s ease"
            >
                <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
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