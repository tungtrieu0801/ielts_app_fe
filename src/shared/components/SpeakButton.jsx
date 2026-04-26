import React, { useState } from "react";
import { IconButton } from "@chakra-ui/react";
import { FiVolume2 } from "react-icons/fi";
import { speak } from "../utils/speech.js";

const SpeakButton = ({ text, lang = "en-US", size = "sm", label, rate }) => {
    const [speaking, setSpeaking] = useState(false);

    const handleSpeak = (e) => {
        e.stopPropagation();
        setSpeaking(true);
        speak(text, lang, rate || 0.9, () => setSpeaking(false), () => setSpeaking(false));
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
