export const speak = (text, lang = "en-US", rate = 0.9) => {
    if (!window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang;
    utter.rate = rate;
    // Ưu tiên giọng nội địa (local) cho chất lượng tốt hơn
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find((v) => v.lang.startsWith(lang.slice(0, 2)) && v.localService)
        || voices.find((v) => v.lang.startsWith(lang.slice(0, 2)));
    if (preferred) utter.voice = preferred;
    window.speechSynthesis.speak(utter);
};
