import { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Sparkles, ArrowLeft, Trash2, ClipboardList, CalendarDays, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import SubjectCard from "@/components/tutor/SubjectCard";
import LanguageSelector from "@/components/tutor/LanguageSelector";
import ChatMessage from "@/components/tutor/ChatMessage";
import ChatInput from "@/components/tutor/ChatInput";
import TypingIndicator from "@/components/tutor/TypingIndicator";
import QuizPage from "@/pages/QuizPage";
import StudyPlan from "@/pages/StudyPlan";
import TestGenerator from "@/pages/TestGenerator";
import VoiceChat from "@/components/tutor/VoiceChat";

const subjects = [
  "english", "math", "biology", "chemistry", "physics",
  "history", "geography", "computer_science", "islamic", "economics",
  "language", "art", "music", "literature", "psychology",
];

const subjectLabels = {
  english: "English",
  math: "Math",
  biology: "Biology",
  chemistry: "Chemistry",
  physics: "Physics",
  history: "History",
  geography: "Geography",
  computer_science: "Computer Science",
  islamic: "Islamic Studies",
  economics: "Economics",
  language: "Language Learning",
  art: "Art",
  music: "Music",
  literature: "Literature",
  psychology: "Psychology",
};

export default function Home() {
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [language, setLanguage] = useState("english");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState("tutor"); // "tutor" | "quiz" | "studyplan" | "test"
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const chatEndRef = useRef(null);

  const speak = (text) => {
    if (!ttsEnabled) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject);
    setMessages([]);
  };

  const handleBack = () => {
    window.speechSynthesis.cancel();
    setSelectedSubject(null);
    setMessages([]);
    setMode("tutor");
  };

  const handleClearChat = () => {
    window.speechSynthesis.cancel();
    setMessages([]);
  };

  const handleSend = async (question) => {
    const userMessage = { role: "user", content: question };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    const detailRequest = /more detail|explain more|elaborate|in depth|deeper|expand|tell me more|explain further|can you explain|detailed|thoroughly|fully explain/i.test(question);

    const isLanguageLearning = selectedSubject === "language";

    const prompt = isLanguageLearning
      ? `You are a friendly and engaging language tutor. Your job is to help students learn foreign languages — vocabulary, grammar, phrases, pronunciation tips, and more.

STRICT RULES:
- Respond ENTIRELY in ${language} language (use it for your explanations), but include the foreign language words/phrases being taught as well.
- When teaching vocabulary: present words clearly with their meaning, example sentence, and a memory tip or fun fact.
- When asked for grammar: explain the rule simply with 2–3 examples.
- When asked to practice: give a short exercise or quiz question for the student to try.
- Always be encouraging and make learning feel fun.
- Keep answers clear and structured. Use bullet points or tables when listing vocabulary.
- If the student doesn't specify a language, ask them which language they want to learn.

Student's question: ${question}`
      : `You are a friendly AI tutor for ${subjectLabels[selectedSubject]}.

STRICT RULES:
- Respond ENTIRELY in ${language} language.
- Use simple, clear language appropriate for a student.
- Always use relatable real-life examples or analogies.
- No unexplained jargon. If you use a technical term, immediately explain it.
- End with ONE short encouraging sentence.
${detailRequest ? `- The student is asking for a DETAILED explanation. Provide a thorough, comprehensive response:
  * Cover all key concepts, sub-concepts, and nuances
  * Use multiple examples and analogies
  * Use numbered steps or bullet points where helpful
  * Include relevant background context
  * Be as thorough as needed — do NOT limit length` : `- Keep your answer SHORT: 3–5 sentences max for simple questions.
- Use bullet points only when listing steps or multiple items — max 4 bullets.
- Never write long paragraphs.`}

Student's question: ${question}`;

    const response = await base44.integrations.Core.InvokeLLM({ prompt });
    setMessages((prev) => [...prev, { role: "assistant", content: response }]);
    setIsLoading(false);
    speak(response);
  };

  // Subject selection view
  if (!selectedSubject) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8 md:py-16">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              AI-Powered Learning
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
              Your Personal
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> AI Tutor</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              Choose a subject and start learning with instant, simple explanations in your preferred language.
            </p>
          </motion.div>

          {/* Language selector */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex justify-center mb-10"
          >
            <LanguageSelector value={language} onChange={setLanguage} />
          </motion.div>

          {/* Subject grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3"
          >
            {subjects.map((subject, i) => (
              <motion.div
                key={subject}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
              >
                <SubjectCard
                  subject={subject}
                  isSelected={false}
                  onClick={() => handleSubjectSelect(subject)}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Study Plan CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-10"
          >
            <p className="text-muted-foreground text-sm mb-3">Tap a subject to start a tutoring session →</p>
            <Button variant="outline" onClick={() => setMode("test")} className="rounded-xl gap-2 text-sm">
              <ClipboardList className="w-4 h-4" />
              Generate a Test
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Quiz mode
  if (selectedSubject && mode === "quiz") {
    return (
      <QuizPage
        subject={selectedSubject}
        language={language}
        onBack={() => setMode("tutor")}
      />
    );
  }

  // Study plan mode
  if (mode === "studyplan") {
    return <StudyPlan onBack={() => setMode("tutor")} />;
  }

  // Test generator mode
  if (mode === "test") {
    return <TestGenerator onBack={() => setMode("tutor")} />;
  }

  // Chat view
  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top bar */}
      <div className="flex-shrink-0 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleBack} className="rounded-xl">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <h2 className="font-heading font-semibold text-foreground">
                {subjectLabels[selectedSubject]}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelector value={language} onChange={setLanguage} />
            <VoiceChat
              onSend={handleSend}
              isLoading={isLoading}
              lastResponse={messages.filter(m => m.role === "assistant").at(-1)?.content || ""}
            />
            <Button
              variant={ttsEnabled ? "default" : "outline"}
              size="sm"
              onClick={() => { setTtsEnabled((v) => !v); window.speechSynthesis.cancel(); }}
              className="rounded-xl gap-1.5 text-xs font-semibold"
              title={ttsEnabled ? "Turn off text-to-speech" : "Turn on text-to-speech"}
            >
              {ttsEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              TTS
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMode("quiz")}
              className="rounded-xl gap-1.5 text-xs font-semibold"
            >
              <ClipboardList className="w-3.5 h-3.5" />
              Quiz
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMode("studyplan")}
              className="rounded-xl gap-1.5 text-xs font-semibold"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              Plan
            </Button>
            {messages.length > 0 && (
              <Button variant="ghost" size="icon" onClick={handleClearChat} className="rounded-xl text-muted-foreground">
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                Ready to learn {subjectLabels[selectedSubject]}!
              </h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                Ask any question and I'll explain it in simple words. No question is too basic!
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-6">
                {getPromptSuggestions(selectedSubject).map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(suggestion)}
                    className="text-xs bg-card border border-border text-muted-foreground rounded-full px-3 py-1.5 hover:bg-muted transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {messages.map((msg, i) => (
              <ChatMessage key={i} message={msg} />
            ))}
          </AnimatePresence>

          {isLoading && <TypingIndicator />}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 border-t border-border bg-card/80 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <ChatInput
            onSend={handleSend}
            isLoading={isLoading}
            placeholder={`Ask about ${subjectLabels[selectedSubject]}...`}
          />
        </div>
      </div>
    </div>
  );
}

function getPromptSuggestions(subject) {
  const suggestions = {
    english: ["What are the parts of speech?", "Explain active vs passive voice", "How to write a good essay?"],
    math: ["What is the Pythagorean theorem?", "How do fractions work?", "Explain algebra basics"],
    biology: ["What is photosynthesis?", "How does DNA work?", "Explain cell structure"],
    chemistry: ["What is the periodic table?", "Explain chemical bonds", "What are acids and bases?"],
    physics: ["What is Newton's first law?", "How does gravity work?", "Explain energy types"],
    history: ["What caused World War I?", "Who were the pharaohs?", "Explain the Industrial Revolution"],
    geography: ["What are tectonic plates?", "Explain the water cycle", "What causes earthquakes?"],
    computer_science: ["What is an algorithm?", "Explain binary code", "How does the internet work?"],
    islamic: ["What are the 5 pillars of Islam?", "Explain the importance of Ramadan", "What is the Quran about?"],
    economics: ["What is supply and demand?", "Explain inflation", "What is GDP?"],
    language: ["Teach me 10 French words for food", "How do I say 'Where is the bathroom?' in Spanish?", "What is the difference between 'tu' and 'vous' in French?", "Teach me basic Japanese greetings"],
    art: ["What are the elements of art?", "Explain impressionism", "What is the difference between oil and watercolor?"],
    music: ["What are the musical notes?", "Explain rhythm and beat", "What is music theory?"],
    literature: ["What is a metaphor vs simile?", "Explain the hero's journey", "What makes a good narrative?"],
    psychology: ["What is Maslow's hierarchy of needs?", "Explain classical conditioning", "What is cognitive dissonance?"],
  };
  return suggestions[subject] || [];
}