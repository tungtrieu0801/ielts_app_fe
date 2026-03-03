import { createSystem, defineConfig, defaultConfig } from "@chakra-ui/react"

const config = defineConfig({
    theme: {
        tokens: {
            colors: {}, // Bạn có thể định nghĩa màu riêng ở đây
        },
    },
})

export const system = createSystem(defaultConfig, config)