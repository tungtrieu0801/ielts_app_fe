"use client"

import { ChakraProvider } from "@chakra-ui/react"
import { ColorModeProvider } from "./color-mode"
import { system } from "../../shared/utils/extendTheme.js"

export function Provider(props) {
    return (
        <ChakraProvider value={system}>
            <ColorModeProvider {...props} />
        </ChakraProvider>
    )
}