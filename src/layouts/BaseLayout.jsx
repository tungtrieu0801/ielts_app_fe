import React from "react";
import { Flex, Box } from "@chakra-ui/react";

import Sidebar from "../shared/components/Slidebar.jsx";
import Header from "./components/Header.jsx";
import { useUIStore } from "../stores/useUIStore.js";

const BaseLayout = ({ children }) => {
    const { currentPalette, bgImage, bgBlur, bgOverlay } = useUIStore();
    const [isCollapsed, setIsCollapsed] = React.useState(false);

    // Sync palette to document element for global CSS variables access
    React.useEffect(() => {
        document.documentElement.setAttribute("data-palette", currentPalette);
    }, [currentPalette]);

    return (
        <Flex 
            h="100vh" 
            bg={bgImage ? "transparent" : "bg.main"}
            position="relative"
            overflow="hidden"
        >
            {/* Custom App Background Layer - Hardware Accelerated */}
            {bgImage && (
                <>
                    <Box
                        position="fixed"
                        top="-20px"
                        left="-20px"
                        right="-20px"
                        bottom="-20px"
                        style={{
                            backgroundImage: `url("${bgImage}")`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            backgroundRepeat: "no-repeat",
                            filter: `blur(${bgBlur}px)`,
                            transform: "translate3d(0,0,0) scale(1.05)",
                            willChange: "filter",
                            transition: "filter 0.2s ease"
                        }}
                        zIndex={0}
                        pointerEvents="none"
                    />
                    <Box
                        position="fixed"
                        inset={0}
                        style={{
                            backgroundColor: `rgba(12, 16, 26, ${bgOverlay})`,
                            transition: "background-color 0.2s ease"
                        }}
                        _light={{
                            style: {
                                backgroundColor: `rgba(255, 255, 255, ${Math.min(0.85, Math.max(0.2, 0.5 - bgOverlay * 0.3))})`,
                                transition: "background-color 0.2s ease"
                            }
                        }}
                        zIndex={0}
                        pointerEvents="none"
                    />
                </>
            )}

            {/* Sidebar Desktop */}
            <Box 
                display={{ base: "none", md: "block" }}
                w={isCollapsed ? "80px" : "240px"}
                transition="width 0.3s ease"
                position="relative"
                zIndex={2}
            >
                <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
            </Box>

            {/* Main Layout */}
            <Flex flex="1" direction="column" h="100vh" overflow="hidden" position="relative" zIndex={1}>

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