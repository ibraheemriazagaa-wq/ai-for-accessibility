import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX, X, ChevronDown, Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { base44 } from "@/api/base44Client";

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
  const [previewingVoice, setPreviewingVoice] = useState(null);
  const [speed, setSpeed] = useState(1.0);
  const synthRef = useRef(window.speechSynthesis);
  const panelRef = useRef(null);
  const currentTextRef = useRef(null); // track text currently being spoken
  const speedRef = useRef(1.0); // always-fresh speed for mid-speech restarts

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

  // Keep speedRef in sync
  useEffect(() => { speedRef.current = speed; }, [speed]);

  // Close panel on outside click — also stop speech
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
        synthRef.current.cancel();
        currentTextRef.current = null;
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Only show voices matching the selected language
  // Normalize both sides: replace underscores with dashes, lowercase, match by prefix
  const langPrefix = locale.split("-")[0].toLowerCase();
  const langVoices = voices.filter((v) => {
    const normalized = v.lang.toLowerCase().replace(/_/g, "-");
    return normalized.startsWith(langPrefix);
  });

  const SAMPLE_PHRASES = {
    "en": "Hello! This is how I sound.", "ar": "مرحباً، هذا هو صوتي.",
    "fr": "Bonjour! Voici ma voix.", "es": "¡Hola! Así es como sueno.",
    "de": "Hallo! So klingt meine Stimme.", "it": "Ciao! Ecco come suono.",
    "pt": "Olá! Assim é como eu soo.", "ru": "Привет! Вот как я звучу.",
    "zh": "你好！这是我的声音。", "ja": "こんにちは！これが私の声です。",
    "ko": "안녕하세요! 이것이 제 목소리입니다.", "hi": "नमस्ते! यह मेरी आवाज़ है।",
    "ur": "ہیلو! یہ میری آواز ہے۔", "tr": "Merhaba! Böyle ses çıkarırım.",
    "nl": "Hallo! Zo klink ik.", "pl": "Cześć! Tak brzmię.",
    "sv": "Hej! Så här låter jag.", "da": "Hej! Sådan lyder jeg.",
    "nb": "Hei! Slik lyder jeg.", "fi": "Hei! Tältä kuulostan.",
    "el": "Γεια σου! Έτσι ακούγομαι.", "he": "שלום! כך אני נשמע.",
    "fa": "سلام! این صدای من است.", "id": "Halo! Begini suara saya.",
    "ms": "Helo! Ini suara saya.", "th": "สวัสดี! นี่คือเสียงของฉัน",
    "vi": "Xin chào! Đây là giọng nói của tôi.", "ro": "Bună! Acesta este sunetul meu.",
    "uk": "Привіт! Так я звучу.", "cs": "Ahoj! Takhle znám.",
    "hu": "Helló! Így hangzom.", "bn": "হ্যালো! এটি আমার কণ্ঠস্বর।",
    "sw": "Habari! Hivi ndivyo ninavyosikika.", "fil": "Kamusta! Ganito ang aking boses.",
  };
  const samplePhrase = SAMPLE_PHRASES[langPrefix] || SAMPLE_PHRASES["en"];

  const previewVoice = (voiceName) => {
    if (previewingVoice === voiceName) {
      synthRef.current.cancel();
      setPreviewingVoice(null);
      return;
    }
    const voice = voices.find((v) => v.name === voiceName);
    if (!voice) return;
    synthRef.current.cancel();
    // Always preview in the currently selected language
    const utterance = new SpeechSynthesisUtterance(samplePhrase);
    utterance.voice = voice;
    utterance.lang = locale;
    utterance.rate = speed;
    setPreviewingVoice(voiceName);
    utterance.onend = () => setPreviewingVoice(null);
    utterance.onerror = () => setPreviewingVoice(null);
    synthRef.current.speak(utterance);
  };

  // API-based preview for languages with no browser voices
  const [apiPreviewing, setApiPreviewing] = useState(false);
  const apiAudioRef = useRef(null);

  const previewApiVoice = async () => {
    if (apiPreviewing) {
      apiAudioRef.current?.pause();
      setApiPreviewing(false);
      return;
    }
    setApiPreviewing(true);
    const result = await base44.integrations.Core.GenerateSpeech({
      text: samplePhrase,
      language_code: langPrefix,
    });
    if (result?.url) {
      const audio = new Audio(result.url);
      apiAudioRef.current = audio;
      audio.onended = () => setApiPreviewing(false);
      audio.onerror = () => setApiPreviewing(false);
      audio.play();
    } else {
      setApiPreviewing(false);
    }
  };

  // Use a ref so Home always calls the freshest version with current locale/voices
  const speakRef = useRef(null);
  speakRef.current = async (text) => {
    if (!enabled) return;
    synthRef.current.cancel();
    currentTextRef.current = text;

    // If we have a matching browser voice, use it directly
    const found = selectedVoice
      ? voices.find((v) => v.name === selectedVoice && v.lang.toLowerCase().startsWith(langPrefix))
      : null;
    const voiceToUse = found || langVoices[0] || null;

    if (voiceToUse) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = locale;
      utterance.voice = voiceToUse;
      utterance.rate = speedRef.current;
      utterance.onend = () => { currentTextRef.current = null; };
      utterance.onerror = () => { currentTextRef.current = null; };
      synthRef.current.speak(utterance);
    } else {
      // No browser voice for this language — fall back to GenerateSpeech API
      try {
        const result = await base44.integrations.Core.GenerateSpeech({
          text: text.slice(0, 500), // cap for cost
          language_code: locale.split("-")[0],
        });
        if (result?.url) {
          const audio = new Audio(result.url);
          audio.onended = () => { currentTextRef.current = null; };
          audio.play();
        }
      } catch {
        // Silently fail — still set lang and let browser attempt it
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = locale;
        utterance.onend = () => { currentTextRef.current = null; };
        synthRef.current.speak(utterance);
      }
    }
  };

  const toggle = () => {
    if (enabled) {
      synthRef.current.cancel();
      currentTextRef.current = null;
      setEnabled(false);
    } else {
      setEnabled(true);
      setOpen(true);
    }
  };

  // Expose speak via stable ref so Home always calls the latest closure
  useEffect(() => {
    window.__ttsSpeak = (text) => speakRef.current?.(text);
    return () => { window.__ttsSpeak = null; };
  }, []);

  return (
    <div className="relative" dir="ltr" ref={panelRef}>
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
              <p className="font-heading font-semibold text-sm text-foreground">TTS Settings</p>
              <button onClick={() => { setOpen(false); synthRef.current.cancel(); currentTextRef.current = null; }}>
                <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
              </button>
            </div>

            {/* Speed slider */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs font-semibold text-foreground">Speaking Speed</p>
                <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-full">{speed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={speed}
                onChange={(e) => {
                  const newSpeed = parseFloat(e.target.value);
                  setSpeed(newSpeed);
                  speedRef.current = newSpeed;
                  // If currently speaking, restart with new speed
                  if (currentTextRef.current && synthRef.current.speaking) {
                    speakRef.current(currentTextRef.current);
                  }
                }}
                className="w-full h-1.5 rounded-full appearance-none bg-muted cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground/60 mt-1">
                <span>0.5x</span>
                <span>1.0x</span>
                <span>2.0x</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mb-3">
              {langVoices.length > 0
                ? <><span className="font-semibold text-foreground">{langVoices.length}</span> {language} voices available</>
                : <><span className="font-semibold text-foreground">AI voice</span> will be used for {language}</>
              }
            </p>
            <div className="max-h-64 overflow-y-auto space-y-1">
              {langVoices.length === 0 ? (
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs border border-primary bg-primary/10 text-primary"
                >
                  <div className="flex-1 text-left">
                    <span className="font-medium">AI Voice ({language})</span>
                    <span className="ml-2 opacity-60">via GenerateSpeech</span>
                    <span className="ml-2 font-semibold">✓</span>
                  </div>
                  <button
                    onClick={previewApiVoice}
                    title="Preview AI voice"
                    className={`flex-shrink-0 p-1 rounded-lg transition-colors ${apiPreviewing ? "text-red-500 hover:text-red-600" : "text-muted-foreground hover:text-primary"}`}
                  >
                    {apiPreviewing ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                  </button>
                </div>
              ) : (
                langVoices.map((v, idx) => {
                  const isSelected = selectedVoice === v.name || (!selectedVoice && idx === 0);
                  const isPreviewing = previewingVoice === v.name;
                  return (
                    <div
                      key={v.name}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs border transition-all
                        ${isSelected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-muted-foreground/40"}`}
                    >
                      <button
                        className="flex-1 text-left"
                        onClick={() => { setSelectedVoice(v.name); setOpen(false); synthRef.current.cancel(); setPreviewingVoice(null); }}
                      >
                        <span className="font-medium">{v.name}</span>
                        <span className="ml-2 opacity-60">{v.lang}</span>
                        {isSelected && <span className="ml-2 text-primary font-semibold">✓</span>}
                      </button>
                      <button
                        onClick={() => previewVoice(v.name)}
                        title="Preview this voice"
                        className={`flex-shrink-0 p-1 rounded-lg transition-colors ${isPreviewing ? "text-red-500 hover:text-red-600" : "text-muted-foreground hover:text-primary"}`}
                      >
                        {isPreviewing ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export { LANGUAGE_LOCALES };