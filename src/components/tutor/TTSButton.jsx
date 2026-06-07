import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";

// Map language values to BCP-47 locale codes for speech synthesis
const LANGUAGE_LOCALES = {
  english: "en-US", arabic: "ar-SA", french: "fr-FR", spanish: "es-ES",
  urdu: "ur-PK", hindi: "hi-IN", malay: "ms-MY", turkish: "tr-TR",
  indonesian: "id-ID", chinese_simplified: "zh-CN", chinese_traditional: "zh-TW",
  portuguese: "pt-PT", portuguese_brazil: "pt-BR", russian: "ru-RU",
  german: "de-DE", japanese: "ja-JP", korean: "ko-KR", italian: "it-IT",
  dutch: "nl-NL", persian: "fa-IR", bengali: "bn-BD", punjabi: "pa-IN",
  swahili: "sw-KE", tagalog: "fil-PH", vietnamese: "vi-VN", thai: "th-TH",
  greek: "el-GR", hebrew: "he-IL", polish: "pl-PL", romanian: "ro-RO",
  ukrainian: "uk-UA", czech: "cs-CZ", hungarian: "hu-HU", swedish: "sv-SE",
  norwegian: "nb-NO", danish: "da-DK", finnish: "fi-FI",
};

export default function TTSButton({ language }) {
  const [enabled, setEnabled] = useState(false);
  const [open, setOpen] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const synthRef = useRef(window.speechSynthesis);
  const panelRef = useRef(null);

  const locale = LANGUAGE_LOCALES[language] || "en-US";

  useEffect(() => {
    const loadVoices = () => {
      const all = synthRef.current.getVoices();
      setVoices(all);
    };
    loadVoices();
    synthRef.current.onvoiceschanged = loadVoices;
  }, []);

  // Reset selected voice when language changes
  useEffect(() => {
    setSelectedVoice(null);
  }, [language]);

  // Close panel on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Voices filtered for the current language locale
  const langVoices = voices.filter((v) =>
    v.lang.toLowerCase().startsWith(locale.split("-")[0].toLowerCase())
  );
  const fallbackVoices = langVoices.length > 0 ? langVoices : voices.slice(0, 10);

  const speak = (text) => {
    if (!enabled) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = locale;
    if (selectedVoice) {
      const found = voices.find((v) => v.name === selectedVoice);
      if (found) utterance.voice = found;
    } else if (langVoices.length > 0) {
      utterance.voice = langVoices[0];
    }
    synthRef.current.speak(utterance);
  };

  const toggle = () => {
    if (enabled) {
      synthRef.current.cancel();
      setEnabled(false);
    } else {
      setEnabled(true);
      setOpen(true);
    }
  };

  // Expose speak via ref pattern — attach to window so Home can call it
  useEffect(() => {
    window.__ttsSpeak = speak;
    return () => { window.__ttsSpeak = null; };
  });

  return (
    <div className="relative" ref={panelRef}>
      <Button
        variant={enabled ? "default" : "outline"}
        size="sm"
        onClick={toggle}
        className="rounded-xl gap-1.5 text-xs font-semibold"
        title={enabled ? "Turn off text-to-speech" : "Turn on text-to-speech"}
      >
        {enabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        TTS
        {enabled && (
          <button
            onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
            className="ml-0.5 opacity-70 hover:opacity-100"
          >
            <ChevronDown className="w-3 h-3" />
          </button>
        )}
      </Button>

      <AnimatePresence>
        {open && enabled && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            className="absolute right-0 top-11 z-50 bg-card border border-border rounded-2xl shadow-xl p-4 w-72"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="font-heading font-semibold text-sm text-foreground">Choose Voice</p>
              <button onClick={() => setOpen(false)}>
                <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Showing voices for <span className="font-semibold text-foreground">{locale}</span>
            </p>
            <div className="max-h-52 overflow-y-auto space-y-1">
              {fallbackVoices.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No voices available for this language. Your browser may not support it.</p>
              ) : (
                fallbackVoices.map((v) => (
                  <button
                    key={v.name}
                    onClick={() => { setSelectedVoice(v.name); setOpen(false); }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs border transition-all
                      ${selectedVoice === v.name || (!selectedVoice && v === fallbackVoices[0])
                        ? "border-primary bg-primary/10 text-primary font-semibold"
                        : "border-border text-muted-foreground hover:border-muted-foreground/40"}`}
                  >
                    <span className="font-medium">{v.name}</span>
                    <span className="ml-2 opacity-60">{v.lang}</span>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export { LANGUAGE_LOCALES };