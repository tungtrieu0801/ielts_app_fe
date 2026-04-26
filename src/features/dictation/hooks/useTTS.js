import { useCallback, useEffect } from "react";
import { speak as sharedSpeak } from "../../../shared/utils/speech.js";

/**
 * Web Speech API hook for Text-To-Speech.
 * speak(text, { rate, onEnd }) — speaks the given English text.
 * cancel() — stops current speech.
 */
export function useTTS() {
    const speak = useCallback(
        (text, { rate = 0.85, onEnd } = {}) => {
            sharedSpeak(text, "en-US", rate, onEnd, onEnd);
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
