import { useCallback, useEffect } from "react";

/**
 * Web Speech API hook for Text-To-Speech.
 * speak(text, { rate, onEnd }) — speaks the given English text.
 * cancel() — stops current speech.
 */
export function useTTS() {
    const getBestEnVoice = () => {
        if (!window.speechSynthesis) return null;
        const voices = window.speechSynthesis.getVoices();
        return (
            voices.find(
                (v) =>
                    v.lang.startsWith("en") &&
                    (v.name.includes("Google") ||
                        v.name.includes("Microsoft") ||
                        v.name.includes("Samantha") ||
                        v.name.includes("Karen") ||
                        v.name.includes("Daniel"))
            ) || voices.find((v) => v.lang.startsWith("en-US")) ||
            voices.find((v) => v.lang.startsWith("en"))
        );
    };

    const speak = useCallback(
        (text, { rate = 0.85, pitch = 1, onEnd } = {}) => {
            if (!window.speechSynthesis || !text) return;
            window.speechSynthesis.cancel();

            const utter = new SpeechSynthesisUtterance(text);
            utter.lang = "en-US";
            utter.rate = rate;
            utter.pitch = pitch;

            // Try to assign a good voice (voices may not be loaded yet)
            const voice = getBestEnVoice();
            if (voice) utter.voice = voice;

            utter.onend = () => {
                if (onEnd) onEnd();
            };

            // Some browsers need a tiny delay to avoid being truncated
            setTimeout(() => window.speechSynthesis.speak(utter), 50);
        },
        []
    );

    const cancel = useCallback(() => {
        window.speechSynthesis?.cancel();
    }, []);

    // Cancel on unmount
    useEffect(() => {
        return () => cancel();
    }, [cancel]);

    return { speak, cancel };
}
