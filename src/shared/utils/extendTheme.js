import { createSystem, defineConfig, defaultConfig } from "@chakra-ui/react";

const config = defineConfig({
    theme: {
        semanticTokens: {
            colors: {
                // === Backgrounds (Dynamic via CSS Variables) ===
                "bg.main": {
                    value: { _light: "var(--bg-main)", _dark: "#0d0d12" },
                },
                "bg.panel": {
                    value: { _light: "var(--bg-panel)", _dark: "#16161f" },
                },
                "bg.subtle": {
                    value: { _light: "var(--bg-subtle)", _dark: "#1c1c28" },
                },
                "bg.elevated": {
                    value: { _light: "var(--bg-elevated)", _dark: "#1e1e2e" },
                },
                "bg.input": {
                    value: { _light: "var(--bg-input)", _dark: "#1a1a26" },
                },

                // === Borders ===
                "border.muted": {
                    value: { _light: "var(--border-muted)", _dark: "#252535" },
                },
                "border.subtle": {
                    value: { _light: "var(--border-subtle)", _dark: "#1f1f2e" },
                },
                "border.strong": {
                    value: { _light: "var(--border-strong)", _dark: "#34344a" },
                },

                // === Text ===
                "fg": {
                    value: { _light: "var(--fg-main)", _dark: "#e8eaf0" },
                },
                "fg.muted": {
                    value: { _light: "var(--fg-muted)", _dark: "#8b8fa8" },
                },
                "fg.subtle": {
                    value: { _light: "var(--fg-subtle)", _dark: "#5a5d72" },
                },

                // === Brand accent ===
                "brand.solid": {
                    value: { _light: "var(--brand-solid)", _dark: "#818cf8" },
                },
                "brand.muted": {
                    value: { _light: "var(--brand-muted)", _dark: "#1e1b4b" },
                },
                "brand.text": {
                    value: { _light: "var(--brand-text)", _dark: "#a5b4fc" },
                },

                // === States ===
                "success.bg": { value: { _light: "#f0fdf4", _dark: "#052e16" } },
                "success.text": { value: { _light: "#15803d", _dark: "#4ade80" } },
                "warning.bg": { value: { _light: "#fffbeb", _dark: "#1c1100" } },
                "danger.bg": { value: { _light: "#fff1f2", _dark: "#1f0a0e" } },
            },
        },
    },
    globalCss: {
        "html, body": {
            height: "100%",
            margin: 0,
            padding: 0,
            // Default: Warm Palette
            "--bg-main": "#fef6e4",
            "--bg-panel": "#fffffe", // Solid warm white
            "--bg-subtle": "#f3d2c1",
            "--bg-elevated": "#fffffe",
            "--bg-input": "#fffffe",
            "--border-muted": "rgba(139, 211, 221, 0.4)",
            "--border-subtle": "rgba(0, 24, 88, 0.1)",
            "--border-strong": "rgba(0, 24, 88, 0.2)",
            "--fg-main": "#001858",
            "--fg-muted": "#172c66",
            "--fg-subtle": "#172c66",
            "--brand-solid": "#f582ae",
            "--brand-muted": "#f3d2c1",
            "--brand-text": "#001858",
        },
        // Navy Palette
        "[data-palette='navy']": {
            "--bg-main": "#232946",
            "--bg-panel": "#121629", // Solid deep navy
            "--bg-subtle": "#232946",
            "--bg-elevated": "#232946",
            "--bg-input": "#0b0e1a",
            "--border-muted": "rgba(184, 193, 236, 0.2)",
            "--border-subtle": "rgba(184, 193, 236, 0.1)",
            "--border-strong": "rgba(184, 193, 236, 0.3)",
            "--fg-main": "#fffffe",
            "--fg-muted": "#b8c1ec",
            "--fg-subtle": "#b8c1ec",
            "--brand-solid": "#eebbc3",
            "--brand-muted": "rgba(238, 187, 195, 0.2)",
            "--brand-text": "#fffffe",
        },
        // Chocolate Palette
        "[data-palette='chocolate']": {
            "--bg-main": "#55423d",
            "--bg-panel": "#271c19", // Dark brown panel
            "--bg-subtle": "#55423d",
            "--bg-elevated": "#271c19",
            "--bg-input": "#140d0b",
            "--border-muted": "rgba(255, 192, 173, 0.2)",
            "--border-subtle": "rgba(255, 192, 173, 0.1)",
            "--border-strong": "rgba(255, 192, 173, 0.3)",
            "--fg-main": "#fffffe",
            "--fg-muted": "#fff3ec",
            "--fg-subtle": "#fff3ec",
            "--brand-solid": "#ffc0ad",
            "--brand-muted": "rgba(255, 192, 173, 0.2)",
            "--brand-text": "#271c19",
        },
        // Forest Palette
        "[data-palette='forest']": {
            "--bg-main": "#004643",
            "--bg-panel": "#001e1d", // Deep forest panel
            "--bg-subtle": "#004643",
            "--bg-elevated": "#001e1d",
            "--bg-input": "#000c0b",
            "--border-muted": "rgba(171, 209, 198, 0.2)",
            "--border-subtle": "rgba(171, 209, 198, 0.1)",
            "--border-strong": "rgba(171, 209, 198, 0.3)",
            "--fg-main": "#fffffe",
            "--fg-muted": "#abd1c6",
            "--fg-subtle": "#abd1c6",
            "--brand-solid": "#f9bc60",
            "--brand-muted": "rgba(249, 188, 96, 0.2)",
            "--brand-text": "#001e1d",
        },
        // Sky Palette
        "[data-palette='sky']": {
            "--bg-main": "#fffffe",
            "--bg-panel": "#f2f7fb", // Very light blue panel
            "--bg-subtle": "#d1e8f7",
            "--bg-elevated": "#fffffe",
            "--bg-input": "#ffffff",
            "--border-muted": "rgba(9, 64, 103, 0.1)",
            "--border-subtle": "rgba(9, 64, 103, 0.05)",
            "--border-strong": "rgba(9, 64, 103, 0.2)",
            "--fg-main": "#094067",
            "--fg-muted": "#5f6c7b",
            "--fg-subtle": "#5f6c7b",
            "--brand-solid": "#3da9fc",
            "--brand-muted": "rgba(61, 169, 252, 0.1)",
            "--brand-text": "#fffffe",
        },
        "[data-theme='light'] .chakra-box, [data-theme='light'] .chakra-flex, [data-theme='light'] .chakra-stack": {
            "&[bg*='bg.panel'], &[background*='bg.panel'], &[bg*='bg.elevated'], &[background*='bg.elevated']": {
                // Reduced blur and added solid fallback to prevent transparency issues
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                border: "1px solid var(--border-strong)",
                boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.15)",
            }
        }
    }
});

export const system = createSystem(defaultConfig, config);