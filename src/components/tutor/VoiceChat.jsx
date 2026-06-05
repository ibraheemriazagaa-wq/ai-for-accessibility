import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Volume2, VolumeX, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const voices = [
  { id: "male_1", label: "James", gender: "male", emoji: "👨" },
  { id: "female_1", label: "Sophie", gender: "female", emoji: "👩" },
  { id: "male_2", label: "Marcus", gender: "male", emoji: "🧔" },
  { id: "female_2", label: "Aria", gender: "female", emoji: "👧" },
  { id: "male_3", label: "Oliver", gender: "male", emoji: "👨‍🦳" },
  { id: "female_3", label: "Luna", gender: "female", emoji: "👩‍🦰" },
];

export default function VoiceChat({ onSend, isLoading, lastResponse }) {
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(voices[0]);
  const [availableSysVoices, setAvailableSysVoices] = useState([]);
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  useEffect(() => {
    const loadVoices = () => {
      setAvailableSysVoices(synthRef.current.getVoices());
    };
    loadVoices();
    synthRef.current.onvoiceschanged = loadVoices;
  }, []);

  // Speak last response when it changes (if panel is open)
  useEffect(() => {
    if (open && lastResponse) speakText(lastResponse);
  }, [lastResponse, open]);

  const getSysVoice = (voiceMeta) => {
    const sysVoices = availableSysVoices;
    if (voiceMeta.gender === "female") {
      return sysVoices.find((v) => /female|woman|girl|f\b/i.test(v.name)) ||
        sysVoices.find((v) => /zira|hazel|victoria|karen|samantha|moira|fiona|tessa|veena|susan|linda|alice|amelie|anna/i.test(v.name)) ||
        sysVoices[0];
    } else {
      return sysVoices.find((v) => /male|man|boy|m\b/i.test(v.name)) ||
        sysVoices.find((v) => /david|daniel|mark|alex|luca|jorge|thomas|lee|paul|james|oliver|fred/i.test(v.name)) ||
        sysVoices[0];
    }
  };

  const speakText = (text) => {
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const sysVoice = getSysVoice(selectedVoice);
    if (sysVoice) utterance.voice = sysVoice;
    utterance.rate = 0.95;
    utterance.pitch = selectedVoice.gender === "female" ? 1.15 : 0.9;
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
      alert("Speech recognition is not supported in your browser. Try Chrome.");
      return;
    }
    stopSpeaking();
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognitionRef.current = recognition;

    recognition.onresult = (e) => {
      const t = Array.from(e.results).map((r) => r[0].transcript).join("");
      setTranscript(t);
    };
    recognition.onend = () => {
      setListening(false);
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
      {/* Voice button */}
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

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md p-6 relative"
            >
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-heading font-bold text-lg text-foreground mb-1">Voice Chat</h3>
              <p className="text-muted-foreground text-sm mb-5">Speak your question and hear the answer</p>

              {/* Voice selector */}
              <div className="mb-5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Choose Voice</p>
                <div className="grid grid-cols-3 gap-2">
                  {voices.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVoice(v)}
                      className={`rounded-xl py-2 px-3 border-2 text-center transition-all text-sm
                        ${selectedVoice.id === v.id
                          ? "border-primary bg-primary/10 text-primary font-semibold"
                          : "border-border bg-background text-muted-foreground hover:border-muted-foreground/40"}`}
                    >
                      <div className="text-lg mb-0.5">{v.emoji}</div>
                      <div className="text-xs font-medium">{v.label}</div>
                    </button>
                  ))}
                </div>
              </div>

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
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="flex gap-1"
                  >
                    {[0, 1, 2, 3, 4].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ height: ["8px", `${16 + i * 6}px`, "8px"] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                        className="w-1.5 bg-primary rounded-full"
                      />
                    ))}
                  </motion.div>
                )}

                <p className="text-sm text-muted-foreground">
                  {listening ? "Listening... tap to stop" : "Tap mic to speak"}
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
                    {isLoading ? "Thinking..." : "Send →"}
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