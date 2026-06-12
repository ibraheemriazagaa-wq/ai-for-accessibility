import { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Sparkles, ArrowLeft, Trash2, ClipboardList, CalendarDays, BarChart2, History } from "lucide-react";
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
import ChatHistoryPanel from "@/components/tutor/ChatHistoryPanel";

// RTL languages
const RTL_LANGUAGES = new Set([
  "arabic", "arabic_egyptian", "arabic_levantine", "arabic_gulf", "arabic_maghrebi",
  "arabic_iraqi", "arabic_sudanese", "arabic_yemeni", "arabic_libyan", "arabic_tunisian",
  "arabic_algerian", "moroccan_arabic", "classical_arabic", "maltese_arabic",
  "hebrew", "persian", "dari", "urdu", "sindhi", "pashto", "balochi",
  "uyghur", "kurdish_sorani", "kashmiri", "dhivehi", "syriac", "aramaic",
  "assyrian", "coptic", "berber_tamazight",
]);

const isRTL = (lang) => RTL_LANGUAGES.has(lang);

const DEFAULT_UI_TEXT = {
  badge: "AI-Powered Learning",
  title: "Your Personal",
  titleHighlight: " AI Tutor",
  subtitle: "Choose a subject and start learning with instant, simple explanations in your preferred language.",
  generateTest: "Generate a Test",
  studyPlan: "Study Plan",
  myProgress: "My Progress",
  readyToLearn: "Ready to learn {subject}!",
  chatSubtitle: "Ask any question and I'll explain it in simple words. No question is too basic!",
  askAbout: "Ask about {subject}...",
  studyPlanTitle: "Study Plan — Pick a Subject",
  studyPlanSubtitle: "Which subject do you want a study plan for?",
  testTitle: "Generate a Test — Pick a Subject",
  testSubtitle: "Which subject do you want to be tested on?",
  progressTitle: "My Progress — Pick a Subject",
  progressSubtitle: "Which subject do you want to see progress for?",
  viewAll: "View All Subjects",
};

// Resolve template strings with subject substitution
const resolveText = (texts) => ({
  ...texts,
  readyToLearn: (subject) => texts.readyToLearn.replace("{subject}", subject),
  askAbout: (subject) => texts.askAbout.replace("{subject}", subject),
});

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
  // chatHistoryRef: { [subject]: Array<Array<message>> } — each subject has a list of sessions
  const chatHistoryRef = useRef({});
  const [historyPanelOpen, setHistoryPanelOpen] = useState(false);
  const [mode, setMode] = useState("tutor");
  const [studyPlanSubject, setStudyPlanSubject] = useState(null);
  const [testSubject, setTestSubject] = useState(null);
  const [dashboardSubject, setDashboardSubject] = useState(null);
  const [uiTexts, setUiTexts] = useState(DEFAULT_UI_TEXT);
  const [translatedSuggestions, setTranslatedSuggestions] = useState(null);
  const [translatedSubjectLabels, setTranslatedSubjectLabels] = useState(subjectLabels);
  const translationCache = useRef({ english: DEFAULT_UI_TEXT });
  const subjectLabelCache = useRef({ english: subjectLabels });
  const suggestionsCache = useRef({});
  const chatEndRef = useRef(null);

  // Translate UI when language changes — show instantly from cache or default, translate in background
  useEffect(() => {
    if (language === "english") {
      setUiTexts(DEFAULT_UI_TEXT);
      setTranslatedSubjectLabels(subjectLabels);
      return;
    }

    // UI strings
    if (translationCache.current[language]) {
      setUiTexts(translationCache.current[language]);
    } else {
      setUiTexts(DEFAULT_UI_TEXT);
      const keys = Object.entries(DEFAULT_UI_TEXT).map(([k, v]) => `"${k}": "${v}"`).join(",\n");
      base44.integrations.Core.InvokeLLM({
        prompt: `Translate the following UI strings into ${language} language. Keep {subject} placeholders exactly as-is. Return ONLY a valid JSON object with the same keys.\n\n{\n${keys}\n}`,
        response_json_schema: {
          type: "object",
          properties: Object.fromEntries(Object.keys(DEFAULT_UI_TEXT).map(k => [k, { type: "string" }])),
        },
      }).then((result) => {
        const merged = { ...DEFAULT_UI_TEXT, ...result };
        translationCache.current[language] = merged;
        setUiTexts(merged);
      });
    }

    // Subject labels
    if (subjectLabelCache.current[language]) {
      setTranslatedSubjectLabels(subjectLabelCache.current[language]);
    } else {
      setTranslatedSubjectLabels(subjectLabels);
      const subjectEntries = Object.entries(subjectLabels).map(([k, v]) => `"${k}": "${v}"`).join(",\n");
      base44.integrations.Core.InvokeLLM({
        prompt: `Translate the following subject names into ${language} language. Return ONLY a valid JSON object with the same keys.\n\n{\n${subjectEntries}\n}`,
        response_json_schema: {
          type: "object",
          properties: Object.fromEntries(Object.keys(subjectLabels).map(k => [k, { type: "string" }])),
        },
      }).then((result) => {
        const merged = { ...subjectLabels, ...result };
        subjectLabelCache.current[language] = merged;
        setTranslatedSubjectLabels(merged);
      });
    }
  }, [language]);

  // Translate suggestions when language or subject changes
  useEffect(() => {
    if (!selectedSubject) return;
    const englishSuggestions = getPromptSuggestions(selectedSubject);
    if (language === "english") {
      setTranslatedSuggestions(englishSuggestions);
      return;
    }
    const cacheKey = `${language}:${selectedSubject}`;
    if (suggestionsCache.current[cacheKey]) {
      setTranslatedSuggestions(suggestionsCache.current[cacheKey]);
      return;
    }
    // Show English immediately, translate in background
    setTranslatedSuggestions(englishSuggestions);
    base44.integrations.Core.InvokeLLM({
      prompt: `Translate these question suggestions into ${language} language. Return ONLY a JSON object with key "suggestions" containing an array of translated strings, preserving the exact same meaning.\n\nSuggestions:\n${JSON.stringify(englishSuggestions)}`,
      response_json_schema: {
        type: "object",
        properties: { suggestions: { type: "array", items: { type: "string" } } },
      },
    }).then((result) => {
      if (result?.suggestions?.length) {
        suggestionsCache.current[cacheKey] = result.suggestions;
        setTranslatedSuggestions(result.suggestions);
      }
    });
  }, [language, selectedSubject]);

  const speak = (text) => {
    if (window.__ttsSpeak) window.__ttsSpeak(text);
  };

  // Re-translate ALL subject chat histories (and active messages) when language changes
  useEffect(() => {
    const translateMessages = async (msgs) => {
      if (!msgs.length) return msgs;
      // Always translate from originalContent (English source) to avoid chained translation drift
      const textsToTranslate = msgs.map((m) => m.originalContent || m.content);
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Translate the following messages into ${language} language. Preserve all markdown formatting exactly. Return a JSON object with key "translations" containing an array of translated strings in the same order.\n\nMessages:\n${JSON.stringify(textsToTranslate)}`,
        response_json_schema: {
          type: "object",
          properties: { translations: { type: "array", items: { type: "string" } } },
        },
      });

      if (result?.translations?.length === msgs.length) {
        return msgs.map((m, i) => ({
          ...m,
          originalContent: m.originalContent || m.content, // preserve original on first translation
          content: result.translations[i],
          language,
        }));
      }
      return msgs;
    };

    const translateAll = async () => {
      // Translate all sessions across all subjects in parallel
      const allWork = [];
      for (const [subj, sessions] of Object.entries(chatHistoryRef.current)) {
        if (!Array.isArray(sessions)) continue;
        sessions.forEach((session, si) => {
          if (session.length > 0) allWork.push({ subj, si, session });
        });
      }
      const results = await Promise.all(
        allWork.map(async ({ subj, si, session }) => ({ subj, si, translated: await translateMessages(session) }))
      );
      results.forEach(({ subj, si, translated }) => {
        chatHistoryRef.current[subj][si] = translated;
      });

      // Also translate the active (unsaved) messages
      if (messages.length > 0) {
        const translatedActive = await translateMessages(messages);
        setMessages(translatedActive);
      }
    };

    translateAll();
  }, [language]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubjectSelect = (subject) => {
    // Save current session before switching (if non-empty)
    if (selectedSubject && messages.length > 0) {
      if (!chatHistoryRef.current[selectedSubject]) chatHistoryRef.current[selectedSubject] = [];
      const sessions = chatHistoryRef.current[selectedSubject];
      // Update last session if it matches current messages, else push new
      if (sessions.length > 0 && sessions[sessions.length - 1] === messages) {
        sessions[sessions.length - 1] = messages;
      } else {
        sessions.push(messages);
      }
    }
    setSelectedSubject(subject);
    const intro = formatIntro(subject, subjectLabels[subject]);
    const introMessage = { role: "assistant", content: intro, originalContent: intro, language };
    // If language is non-English, translate the intro asynchronously
    if (language !== "english") {
      base44.integrations.Core.InvokeLLM({
        prompt: `Translate the following message into ${language} language. Preserve all markdown formatting. Return ONLY the translated text, nothing else.\n\nMessage: ${intro}`,
      }).then((translated) => {
        setMessages([{ role: "assistant", content: translated, originalContent: intro, language }]);
        speak(translated);
      });
      setMessages([introMessage]);
    } else {
      setMessages([introMessage]);
      speak(intro);
    }
    setTranslatedSuggestions(null);
  };

  const handleBack = () => {
    window.speechSynthesis.cancel();
    // Save current session before going back
    if (selectedSubject && messages.length > 0) {
      if (!chatHistoryRef.current[selectedSubject]) chatHistoryRef.current[selectedSubject] = [];
      const sessions = chatHistoryRef.current[selectedSubject];
      sessions.push([...messages]);
    }
    setSelectedSubject(null);
    setMode("tutor");
  };

  const handleClearChat = () => {
    window.speechSynthesis.cancel();
    setMessages([]);
  };

  const handleNewChat = () => {
    window.speechSynthesis.cancel();
    // Archive current session before starting fresh
    if (selectedSubject && messages.length > 0) {
      if (!chatHistoryRef.current[selectedSubject]) chatHistoryRef.current[selectedSubject] = [];
      chatHistoryRef.current[selectedSubject].push([...messages]);
    }
    setMessages([]);
  };

  // Detect language from voice transcript and auto-switch
  const handleVoiceSend = (question) => {
    // Try to detect language via recognition lang hint — VoiceChat passes detected lang
    handleSend(question);
  };

  const handleSend = async (question) => {
    const userMessage = { role: "user", content: question, originalContent: question, language };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Detect video request
    const videoRequest = /show.*video|video.*about|watch.*video|video.*explain|can.*see.*video|make.*video|create.*video|generate.*video/i.test(question);

    if (videoRequest) {
      // Ask LLM for a vivid visual description
      const imagePrompt = await base44.integrations.Core.InvokeLLM({
        prompt: `The student is studying ${subjectLabels[selectedSubject]} and asked: "${question}".
Write a detailed visual description for an educational diagram or illustration about this topic, suitable for a student.
Focus on what should be visually shown. Be specific and descriptive.
Return ONLY the description, nothing else.`
      });

      const [textRes, imageRes] = await Promise.all([
        base44.integrations.Core.InvokeLLM({
          prompt: `You are a tutor for ${subjectLabels[selectedSubject]}. The student asked: "${question}".
Respond in ${language} language. Give a brief 2-3 sentence explanation to accompany a visual diagram of this topic. Keep it simple and encouraging.`
        }),
        base44.integrations.Core.GenerateImage({ prompt: imagePrompt + ", educational diagram, clear labels, clean illustration, bright colors" })
      ]);

      setMessages((prev) => [...prev, {
        role: "assistant",
        content: textRes,
        originalContent: textRes,
        imageUrl: imageRes.url,
        language,
      }]);
      setIsLoading(false);
      speak(textRes);
      return;
    }

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
    setMessages((prev) => [...prev, { role: "assistant", content: response, originalContent: response, language }]);
    setIsLoading(false);
    speak(response);
  };

  const t = resolveText(uiTexts);
  const dir = isRTL(language) ? "rtl" : "ltr";

  // Study plan mode
  if (mode === "studyplan") {
    return <StudyPlan subject={null} onBack={() => setMode("tutor")} />;
  }

  // Test generator mode
  if (mode === "test") {
    return <TestGenerator initialSubject={null} onBack={() => setMode("tutor")} />;
  }

  // Dashboard subject picker
  if (mode === "dashboard-subject") {
    return (
      <div className="min-h-screen bg-background" dir={dir}>
        <div className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setMode("tutor")} className="rounded-xl">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h2 className="font-heading font-semibold text-foreground">{t.progressTitle}</h2>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 py-8">
          <p className="text-muted-foreground text-sm text-center mb-6">{t.progressSubtitle}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
            {subjects.map((subject) => (
              <SubjectCard
                key={subject}
                subject={subject}
                isSelected={false}
                onClick={() => {
                  setDashboardSubject(subjectLabels[subject]);
                  setMode("dashboard");
                }}
              />
            ))}
          </div>
          <button
            onClick={() => { setDashboardSubject(null); setMode("dashboard"); }}
            className="w-full py-3 rounded-2xl border-2 border-dashed border-border text-muted-foreground text-sm font-medium hover:border-primary hover:text-primary transition-all"
          >
            {t.viewAll}
          </button>
        </div>
      </div>
    );
  }

  // Dashboard mode
  if (mode === "dashboard") {
    return <Dashboard subject={dashboardSubject} onBack={() => setMode("dashboard-subject")} />;
  }

  // Subject selection view

  if (!selectedSubject) {
    return (
      <div className="min-h-screen bg-background" dir={dir}>
        <div className="max-w-4xl mx-auto px-4 py-8 md:py-16">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              {t.badge}
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
              {t.title}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{t.titleHighlight}</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              {t.subtitle}
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

          {/* Bottom CTAs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-10"
          >
            <div className="flex flex-wrap justify-center gap-3">
              <Button variant="outline" onClick={() => setMode("test")} className="rounded-xl gap-2 text-sm">
                <ClipboardList className="w-4 h-4" />
                {t.generateTest}
              </Button>
              <Button variant="outline" onClick={() => setMode("studyplan")} className="rounded-xl gap-2 text-sm">
                <CalendarDays className="w-4 h-4" />
                {t.studyPlan}
              </Button>
              <Button variant="outline" onClick={() => setMode("dashboard-subject")} className="rounded-xl gap-2 text-sm">
                <BarChart2 className="w-4 h-4" />
                {t.myProgress}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Chat view
  return (
    <div className="h-screen flex flex-col bg-background" dir={dir}>
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
                {translatedSubjectLabels[selectedSubject]}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2" dir="ltr">
            <LanguageSelector value={language} onChange={setLanguage} />
            <VoiceChat
              onSend={handleSend}
              isLoading={isLoading}
              language={language}
            />
            <TTSButton language={language} />
            <Button variant="ghost" size="icon" onClick={() => setHistoryPanelOpen(true)} className="rounded-xl text-muted-foreground" title="Chat History">
              <History className="w-4 h-4" />
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
              <h3 className="font-heading text-xl font-semibold text-foreground mb-2" style={{ unicodeBidi: "plaintext" }}>
                {t.readyToLearn(translatedSubjectLabels[selectedSubject])}
              </h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                {t.chatSubtitle}
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-6">
                {(translatedSuggestions || getPromptSuggestions(selectedSubject)).map((suggestion, i) => (
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
            placeholder={t.askAbout(translatedSubjectLabels[selectedSubject])}
          />
        </div>
      </div>

      {/* Chat History Side Panel */}
      <ChatHistoryPanel
        open={historyPanelOpen}
        onClose={() => setHistoryPanelOpen(false)}
        chatHistory={chatHistoryRef.current}
        currentSubject={selectedSubject}
        onSelectSubject={(subject) => handleSubjectSelect(subject)}
        onNewChat={handleNewChat}
        translatedSubjectLabel={translatedSubjectLabels[selectedSubject]}
      />
    </div>
  );
}

function formatIntro(subjectKey, subjectLabel) {
  return `Hi there! I'm **Tutor Bot Pro**, your personal AI tutor for **${subjectLabel}**. I'm here to help you learn in a simple and fun way. Ask me anything about ${subjectLabel} — no question is too basic. Let's get started! 🚀`;
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