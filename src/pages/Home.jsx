import { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Sparkles, ArrowLeft, Trash2, ClipboardList, CalendarDays, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import SubjectCard from "@/components/tutor/SubjectCard";
import LanguageSelector from "@/components/tutor/LanguageSelector";
import ChatMessage from "@/components/tutor/ChatMessage";
import ChatInput from "@/components/tutor/ChatInput";
import TypingIndicator from "@/components/tutor/TypingIndicator";
import StudyPlan from "@/pages/StudyPlan";
import TestGenerator from "@/pages/TestGenerator";
import VoiceChat from "@/components/tutor/VoiceChat";
import TTSButton from "@/components/tutor/TTSButton";
import Dashboard from "@/pages/Dashboard";

const subjects = [
  "english", "math", "biology", "chemistry", "physics",
  "history", "geography", "computer_science", "islamic", "economics",
  "language", "art", "music", "psychology",
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
  psychology: "Psychology",
};

export default function Home() {
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [language, setLanguage] = useState("english");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState("tutor"); // "tutor" | "studyplan-subject" | "studyplan" | "test-subject" | "test" | "dashboard"
  const [studyPlanSubject, setStudyPlanSubject] = useState(null);
  const [testSubject, setTestSubject] = useState(null);
  const chatEndRef = useRef(null);

  const speak = (text) => {
    if (window.__ttsSpeak) window.__ttsSpeak(text);
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

  // Detect language from voice transcript and auto-switch
  const handleVoiceSend = (question) => {
    // Try to detect language via recognition lang hint — VoiceChat passes detected lang
    handleSend(question);
  };

  const handleSend = async (question) => {
    const userMessage = { role: "user", content: question };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    const detailRequest = /more detail|explain more|elaborate|in depth|deeper|expand|tell me more|explain further|can you explain|detailed|thoroughly|fully explain/i.test(question);

    const isLanguageLearning = selectedSubject === "language";

    // Map subject to its related sibling subjects for boundary checking
    const subjectBoundaryNote = `IMPORTANT — Subject Boundary Rule:
You are ONLY allowed to answer questions that are clearly related to ${subjectLabels[selectedSubject]}.
If the student asks something that belongs to a clearly different academic subject (e.g. they ask a Math question while you are the Biology tutor, or a History question while you are the Physics tutor), you must:
1. Politely decline to answer that question.
2. Explain in ONE sentence that this topic belongs to a different subject.
3. Suggest they switch to the appropriate subject tutor (e.g. "I suggest heading to the Math tutor for this!").
Do NOT answer off-topic subject questions, even partially.`;

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

${subjectBoundaryNote}

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
            <div className="flex flex-wrap justify-center gap-3">
              <Button variant="outline" onClick={() => setMode("test-subject")} className="rounded-xl gap-2 text-sm">
                <ClipboardList className="w-4 h-4" />
                Generate a Test
              </Button>
              <Button variant="outline" onClick={() => setMode("studyplan-subject")} className="rounded-xl gap-2 text-sm">
                <CalendarDays className="w-4 h-4" />
                Study Plan
              </Button>
              <Button variant="outline" onClick={() => setMode("dashboard")} className="rounded-xl gap-2 text-sm">
                <BarChart2 className="w-4 h-4" />
                My Progress
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Study plan subject picker
  if (mode === "studyplan-subject") {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setMode("tutor")} className="rounded-xl">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h2 className="font-heading font-semibold text-foreground">Study Plan — Pick a Subject</h2>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 py-8">
          <p className="text-muted-foreground text-sm text-center mb-6">Which subject do you want a study plan for?</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {subjects.map((subject) => (
              <SubjectCard
                key={subject}
                subject={subject}
                isSelected={false}
                onClick={() => {
                  setStudyPlanSubject(subjectLabels[subject]);
                  setMode("studyplan");
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Study plan mode
  if (mode === "studyplan") {
    return <StudyPlan subject={studyPlanSubject} onBack={() => setMode("studyplan-subject")} />;
  }

  // Test subject picker
  if (mode === "test-subject") {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setMode("tutor")} className="rounded-xl">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h2 className="font-heading font-semibold text-foreground">Generate a Test — Pick a Subject</h2>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 py-8">
          <p className="text-muted-foreground text-sm text-center mb-6">Which subject do you want to be tested on?</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {subjects.map((subject) => (
              <SubjectCard
                key={subject}
                subject={subject}
                isSelected={false}
                onClick={() => {
                  setTestSubject(subjectLabels[subject]);
                  setMode("test");
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Test generator mode
  if (mode === "test") {
    return <TestGenerator initialSubject={testSubject} onBack={() => setMode("test-subject")} />;
  }

  // Dashboard mode
  if (mode === "dashboard") {
    return <Dashboard onBack={() => setMode("tutor")} />;
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
              language={language}
              onLanguageDetected={setLanguage}
              lastResponse={messages.filter(m => m.role === "assistant").at(-1)?.content || ""}
            />
            <TTSButton language={language} />

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
    psychology: ["What is Maslow's hierarchy of needs?", "Explain classical conditioning", "What is cognitive dissonance?"],
  };
  return suggestions[subject] || [];
}