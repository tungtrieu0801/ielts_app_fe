import { createSystem, defineConfig, defaultConfig } from "@chakra-ui/react";

const config = defineConfig({
    theme: {
        semanticTokens: {
            colors: {
                // === Backgrounds ===
                "bg.main": {
                    value: { _light: "#f4f6fb", _dark: "#0d0d12" },
                },
                "bg.panel": {
                    value: { _light: "#ffffff", _dark: "#16161f" },
                },
                "bg.subtle": {
                    value: { _light: "#f0f2f8", _dark: "#1c1c28" },
                },
                "bg.elevated": {
                    value: { _light: "#ffffff", _dark: "#1e1e2e" },
                },
                "bg.input": {
                    value: { _light: "#ffffff", _dark: "#1a1a26" },
                },

                // === Borders ===
                "border.muted": {
                    value: { _light: "#e4e8f0", _dark: "#252535" },
                },
                "border.subtle": {
                    value: { _light: "#edf0f7", _dark: "#1f1f2e" },
                },
                "border.strong": {
                    value: { _light: "#c8cfe0", _dark: "#34344a" },
                },

                // === Text ===
                "fg": {
                    value: { _light: "#111827", _dark: "#e8eaf0" },
                },
                "fg.muted": {
                    value: { _light: "#6b7280", _dark: "#8b8fa8" },
                },
                "fg.subtle": {
                    value: { _light: "#9ca3af", _dark: "#5a5d72" },
                },

                // === Brand accent (indigo/violet) ===
                "brand.solid": {
                    value: { _light: "#6366f1", _dark: "#818cf8" },
                },
                "brand.muted": {
                    value: { _light: "#e0e7ff", _dark: "#1e1b4b" },
                },
                "brand.text": {
                    value: { _light: "#4f46e5", _dark: "#a5b4fc" },
                },

                // === States ===
                "success.bg": {
                    value: { _light: "#f0fdf4", _dark: "#052e16" },
                },
                "success.text": {
                    value: { _light: "#15803d", _dark: "#4ade80" },
                },
                "warning.bg": {
                    value: { _light: "#fffbeb", _dark: "#1c1100" },
                },
                "danger.bg": {
                    value: { _light: "#fff1f2", _dark: "#1f0a0e" },
                },
            },
        },
    },
});

export const system = createSystem(defaultConfig, config);