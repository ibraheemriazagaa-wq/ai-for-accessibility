import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Volume2, VolumeX, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { LANGUAGE_LOCALES } from "@/components/tutor/TTSButton";

// Map language value to BCP-47 recognition locale
const RECOGNITION_LOCALES = {
  ...LANGUAGE_LOCALES,
  // A few extras that differ between recognition and TTS
  chinese_simplified: "zh-CN",
  chinese_traditional: "zh-TW",
};

// Map BCP-47 prefix back to app language value (for auto-detection)
const LOCALE_TO_LANG = Object.entries(LANGUAGE_LOCALES).reduce((acc, [lang, locale]) => {
  const prefix = locale.split("-")[0].toLowerCase();
  if (!acc[prefix]) acc[prefix] = lang;
  return acc;
}, {});

export default function VoiceChat({ onSend, isLoading, lastResponse, language, onLanguageDetected }) {
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [availableSysVoices, setAvailableSysVoices] = useState([]);
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  const locale = RECOGNITION_LOCALES[language] || "en-US";

  useEffect(() => {
    const loadVoices = () => setAvailableSysVoices(synthRef.current.getVoices());
    loadVoices();
    synthRef.current.onvoiceschanged = loadVoices;
  }, []);

  // Speak last response when it changes and panel is open
  useEffect(() => {
    if (open && lastResponse) speakText(lastResponse);
  }, [lastResponse, open]);

  const getVoiceForLocale = (loc) => {
    const langPrefix = loc.split("-")[0].toLowerCase();
    // First try exact locale match
    let voice = availableSysVoices.find((v) => v.lang.toLowerCase() === loc.toLowerCase());
    // Then try same language prefix
    if (!voice) voice = availableSysVoices.find((v) => v.lang.toLowerCase().startsWith(langPrefix));
    // Fallback to first available
    if (!voice) voice = availableSysVoices[0];
    return voice;
  };

  const speakText = (text) => {
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = locale;
    const voice = getVoiceForLocale(locale);
    if (voice) utterance.voice = voice;
    utterance.rate = 0.95;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    synthRef.current.cancel();
    setSpeaking(false);
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in your browser. Please use Chrome.");
      return;
    }
    stopSpeaking();
    const recognition = new SpeechRecognition();
    // Use current language locale so the browser understands the spoken language
    recognition.lang = locale;
    recognition.interimResults = true;
    recognition.continuous = false;
    recognitionRef.current = recognition;

    recognition.onresult = (e) => {
      const t = Array.from(e.results).map((r) => r[0].transcript).join("");
      setTranscript(t);
    };

    recognition.onspeechend = () => {
      recognition.stop();
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.onerror = (e) => {
      setListening(false);
      if (e.error === "language-not-supported") {
        // Fallback to English if chosen language not supported for recognition
        const fallback = new SpeechRecognition();
        fallback.lang = "en-US";
        fallback.interimResults = true;
        fallback.continuous = false;
        fallback.onresult = (ev) => {
          const t = Array.from(ev.results).map((r) => r[0].transcript).join("");
          setTranscript(t);
        };
        fallback.onend = () => setListening(false);
        fallback.start();
        recognitionRef.current = fallback;
        setListening(true);
      }
    };

    recognition.start();
    setListening(true);
    setTranscript("");
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const handleSend = () => {
    if (!transcript.trim()) return;
    onSend(transcript.trim());
    setTranscript("");
  };

  const handleClose = () => {
    stopSpeaking();
    stopListening();
    setOpen(false);
    setTranscript("");
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="rounded-xl gap-1.5 text-xs font-semibold"
        title="Voice Chat"
      >
        <Mic className="w-3.5 h-3.5" />
        Voice
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={handleClose}
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-heading font-bold text-lg text-foreground mb-1">Voice Chat</h3>
              <p className="text-muted-foreground text-sm mb-1">
                Speak your question and hear the answer
              </p>
              <p className="text-xs text-muted-foreground mb-5">
                Recognition language: <span className="font-semibold text-foreground">{locale}</span>
              </p>

              {/* Mic area */}
              <div className="flex flex-col items-center gap-4 py-4">
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={listening ? stopListening : startListening}
                  disabled={isLoading}
                  className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all
                    ${listening
                      ? "bg-red-500 shadow-red-500/30"
                      : "bg-primary shadow-primary/30 hover:bg-primary/90"}`}
                >
                  {listening ? (
                    <MicOff className="w-8 h-8 text-white" />
                  ) : (
                    <Mic className="w-8 h-8 text-white" />
                  )}
                </motion.button>

                {listening && (
                  <div className="flex gap-1">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ height: ["8px", `${16 + i * 6}px`, "8px"] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                        className="w-1.5 bg-primary rounded-full"
                      />
                    ))}
                  </div>
                )}

                <p className="text-sm text-muted-foreground">
                  {listening ? "Listening… tap to stop" : isLoading ? "Thinking…" : "Tap the mic to speak"}
                </p>
              </div>

              {/* Transcript */}
              {transcript && (
                <div className="bg-muted/50 rounded-xl px-4 py-3 mb-4">
                  <p className="text-sm text-foreground italic">"{transcript}"</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                {speaking ? (
                  <Button variant="outline" onClick={stopSpeaking} className="flex-1 rounded-xl gap-2">
                    <VolumeX className="w-4 h-4" />
                    Stop Speaking
                  </Button>
                ) : lastResponse ? (
                  <Button variant="outline" onClick={() => speakText(lastResponse)} className="flex-1 rounded-xl gap-2">
                    <Volume2 className="w-4 h-4" />
                    Replay Answer
                  </Button>
                ) : null}

                {transcript && (
                  <Button
                    onClick={handleSend}
                    disabled={isLoading}
                    className="flex-1 rounded-xl font-semibold"
                  >
                    {isLoading ? "Thinking…" : "Send →"}
                  </Button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}