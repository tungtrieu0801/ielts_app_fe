export const speak = (text, lang = "en-US", rate, onEnd, onError) => {
    if (!window.speechSynthesis || !text) return;
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang;
    
    // Get user preferred settings from localStorage
    const preferredVoiceName = localStorage.getItem(`pref-voice-${lang}`);
    const preferredRate = localStorage.getItem(`pref-rate-${lang}`);
    
    // Use provided rate, then preferred rate, then default 0.9
    utter.rate = rate || parseFloat(preferredRate) || 0.9;

    if (onEnd) utter.onend = onEnd;
    if (onError) utter.onerror = onError;

    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
            speak(text, lang, rate, onEnd, onError);
        };
        return;
    }

    let voice = null;
    if (preferredVoiceName) {
        voice = voices.find(v => v.name === preferredVoiceName);
    }

    if (!voice) {
        // Fallback selection
        voice = voices.find(v => v.lang.startsWith(lang.slice(0, 2)) && v.name.includes("Google"))
            || voices.find(v => v.lang.startsWith(lang.slice(0, 2)) && v.name.includes("Natural"))
            || voices.find(v => v.lang.startsWith(lang.slice(0, 2)) && v.localService)
            || voices.find(v => v.lang.startsWith(lang.slice(0, 2)));
    }

    if (voice) utter.voice = voice;
    window.speechSynthesis.speak(utter);
};

export const getAvailableVoices = (langPrefix = "en") => {
    if (!window.speechSynthesis) return [];
    return window.speechSynthesis.getVoices().filter(v => v.lang.startsWith(langPrefix));
};
