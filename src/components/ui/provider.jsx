"use client"

import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { ColorModeProvider } from "./color-mode"

export function Provider(props) {
    return (
        // Lưu ý: value phải là một đối tượng system (như defaultSystem)
        <ChakraProvider value={defaultSystem}>
            <ColorModeProvider {...props} />
        </ChakraProvider>
    )
}