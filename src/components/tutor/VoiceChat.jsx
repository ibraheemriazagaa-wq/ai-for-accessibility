import { useState, useRef } from "react";
import { Mic, MicOff, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { LANGUAGE_LOCALES } from "@/components/tutor/TTSButton";

const RECOGNITION_LOCALES = {
  ...LANGUAGE_LOCALES,
  chinese_simplified: "zh-CN",
  chinese_traditional: "zh-TW",
};

export default function VoiceChat({ onSend, isLoading, language }) {
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  const locale = RECOGNITION_LOCALES[language] || "en-US";

  const stopListening = () => {
    try { recognitionRef.current?.stop(); } catch {}
    recognitionRef.current = null;
    setListening(false);
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Speech recognition not supported. Please use Chrome.");
      return;
    }

    setError(null);

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = locale;
      recognition.interimResults = true;
      recognition.continuous = false;
      recognitionRef.current = recognition;

      recognition.onresult = (e) => {
        const t = Array.from(e.results).map((r) => r[0].transcript).join("");
        setTranscript(t);
      };

      recognition.onspeechend = () => {
        try { recognition.stop(); } catch {}
      };

      recognition.onend = () => {
        setListening(false);
        recognitionRef.current = null;
      };

      recognition.onerror = (e) => {
        setListening(false);
        recognitionRef.current = null;
        if (e.error === "not-allowed") {
          setError("Microphone access denied. Please allow it in your browser settings.");
        } else if (e.error === "language-not-supported") {
          setError(null);
          // Fallback to English
          try {
            const fallback = new SpeechRecognition();
            fallback.lang = "en-US";
            fallback.interimResults = true;
            fallback.continuous = false;
            fallback.onresult = (ev) => {
              const t = Array.from(ev.results).map((r) => r[0].transcript).join("");
              setTranscript(t);
            };
            fallback.onspeechend = () => { try { fallback.stop(); } catch {} };
            fallback.onend = () => { setListening(false); recognitionRef.current = null; };
            fallback.onerror = () => { setListening(false); recognitionRef.current = null; };
            fallback.start();
            recognitionRef.current = fallback;
            setListening(true);
          } catch {}
        } else if (e.error === "no-speech") {
          setError("No speech detected. Try again.");
        } else if (e.error === "aborted") {
          // User stopped manually, no error
        } else {
          setError("Recognition error: " + e.error);
        }
      };

      recognition.start();
      setListening(true);
      setTranscript("");
    } catch (err) {
      setError("Could not start microphone. " + (err.message || ""));
      setListening(false);
    }
  };

  const handleSend = () => {
    if (!transcript.trim()) return;
    onSend(transcript.trim());
    setTranscript("");
    setError(null);
    setOpen(false);
  };

  const handleClose = () => {
    stopListening();
    setOpen(false);
    setTranscript("");
    setError(null);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => { setOpen(true); setError(null); setTranscript(""); }}
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
                Tap the mic, speak your question, then tap to stop
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

              {/* Error message */}
              {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-4 text-red-700 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Transcript */}
              {transcript && (
                <div className="bg-muted/50 rounded-xl px-4 py-3 mb-4">
                  <p className="text-sm text-foreground italic">"{transcript}"</p>
                </div>
              )}

              {/* Send button */}
              {transcript && (
                <Button
                  onClick={handleSend}
                  disabled={isLoading}
                  className="w-full rounded-xl font-semibold"
                >
                  {isLoading ? "Thinking…" : "Send →"}
                </Button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}