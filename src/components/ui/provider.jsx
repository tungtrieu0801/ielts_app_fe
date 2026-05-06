"use client"

import { ChakraProvider } from "@chakra-ui/react"
import { ColorModeProvider } from "./color-mode"
import { system } from "../../shared/utils/extendTheme.js"
import { Toaster } from "./toaster.jsx"

export function Provider(props) {
    return (
        <ChakraProvider value={system}>
            <ColorModeProvider {...props} />
            <Toaster />
        </ChakraProvider>
    )
}