import React, { useState } from "react";
import { IconButton } from "@chakra-ui/react";
import { FiVolume2 } from "react-icons/fi";

const SpeakButton = ({ text, lang = "en-US", size = "sm", label, rate }) => {
    const [speaking, setSpeaking] = useState(false);

    const handleSpeak = (e) => {
        e.stopPropagation();
        if (!window.speechSynthesis || !text) return;
        window.speechSynthesis.cancel();
        setSpeaking(true);
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = lang;
        utter.rate = rate || 0.9;
        utter.onend = () => setSpeaking(false);
        utter.onerror = () => setSpeaking(false);
        const voices = window.speechSynthesis.getVoices();
        const preferred = voices.find((v) => v.lang.startsWith(lang.slice(0, 2)) && v.localService)
            || voices.find((v) => v.lang.startsWith(lang.slice(0, 2)));
        if (preferred) utter.voice = preferred;
        window.speechSynthesis.speak(utter);
    };

    return (
        <IconButton
            size={size} variant="ghost" borderRadius="full"
            onClick={handleSpeak}
            color={speaking ? "blue.400" : "fg.muted"}
            _hover={{ color: "blue.500", bg: "brand.muted" }}
            transition="color 0.2s"
            title={label || "Nghe phát âm"}
            aria-label={label || "Speak"}
        >
            <FiVolume2 size={16} />
        </IconButton>
    );
};

export default SpeakButton;
