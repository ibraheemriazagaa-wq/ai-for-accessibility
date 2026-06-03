import { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Sparkles, ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import SubjectCard from "@/components/tutor/SubjectCard";
import LanguageSelector from "@/components/tutor/LanguageSelector";
import ChatMessage from "@/components/tutor/ChatMessage";
import ChatInput from "@/components/tutor/ChatInput";
import TypingIndicator from "@/components/tutor/TypingIndicator";

const subjects = [
  "english", "math", "biology", "chemistry", "physics",
  "history", "geography", "computer_science", "islamic", "economics",
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
};

export default function Home() {
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [language, setLanguage] = useState("english");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject);
    setMessages([]);
  };

  const handleBack = () => {
    setSelectedSubject(null);
    setMessages([]);
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  const handleSend = async (question) => {
    const userMessage = { role: "user", content: question };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    const prompt = `You are a friendly, patient AI tutor specializing in ${subjectLabels[selectedSubject]}. 

IMPORTANT RULES:
- Respond ENTIRELY in ${language} language.
- Explain concepts in simple, easy-to-understand words.
- Use examples and analogies that students can relate to.
- Break down complex topics into smaller, digestible parts.
- Use bullet points and numbered lists for clarity.
- If the student asks something outside your subject, politely redirect them.
- Be encouraging and supportive.
- Keep explanations concise but thorough.

Student's question: ${question}`;

    const response = await base44.integrations.Core.InvokeLLM({ prompt });
    setMessages((prev) => [...prev, { role: "assistant", content: response }]);
    setIsLoading(false);
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

          {/* Footer hint */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-muted-foreground text-sm mt-10"
          >
            Tap a subject to start a tutoring session →
          </motion.p>
        </div>
      </div>
    );
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
  };
  return suggestions[subject] || [];
}