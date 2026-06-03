import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import QuizSetup from "@/components/quiz/QuizSetup";
import QuizQuestion from "@/components/quiz/QuizQuestion";
import QuizResults from "@/components/quiz/QuizResults";

const subjectLabels = {
  english: "English", math: "Math", biology: "Biology", chemistry: "Chemistry",
  physics: "Physics", history: "History", geography: "Geography",
  computer_science: "Computer Science", islamic: "Islamic Studies", economics: "Economics",
};

export default function QuizPage({ subject, language, onBack }) {
  const [phase, setPhase] = useState("setup"); // setup | loading | quiz | results
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [config, setConfig] = useState(null);

  const handleStart = async (cfg) => {
    setConfig(cfg);
    setPhase("loading");

    const formatInstruction = cfg.format === "multiple_choice"
      ? 'All questions must be "multiple_choice" type with 4 options.'
      : cfg.format === "type_answer"
      ? 'All questions must be "type_answer" type (no options needed, just correct_answer as a short word or phrase).'
      : 'Mix of "multiple_choice" and "type_answer" types evenly.';

    const prompt = `Generate ${cfg.count} quiz questions about ${subjectLabels[subject]} at ${cfg.difficulty} difficulty level.
${formatInstruction}

Respond in ${language} language for all text (questions, options, explanations).

Return a JSON object with this exact structure:
{
  "questions": [
    {
      "type": "multiple_choice",
      "question": "question text",
      "options": ["A", "B", "C", "D"],
      "correct_answer": "exact text of correct option",
      "explanation": "brief simple explanation in 1-2 sentences"
    },
    {
      "type": "type_answer",
      "question": "question text",
      "options": [],
      "correct_answer": "short answer",
      "explanation": "brief simple explanation in 1-2 sentences"
    }
  ]
}`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          questions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                type: { type: "string" },
                question: { type: "string" },
                options: { type: "array", items: { type: "string" } },
                correct_answer: { type: "string" },
                explanation: { type: "string" },
              },
            },
          },
        },
      },
    });

    setQuestions(result.questions || []);
    setScore(0);
    setCurrentIndex(0);
    setPhase("quiz");
  };

  const handleAnswer = ({ correct }) => {
    if (correct) setScore((s) => s + 1);
    if (currentIndex + 1 >= questions.length) {
      setPhase("results");
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handleRetry = () => {
    setPhase("setup");
    setQuestions([]);
    setCurrentIndex(0);
    setScore(0);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h2 className="font-heading font-semibold text-foreground">
            {subjectLabels[subject]} Quiz
          </h2>
        </div>
      </div>

      <div className="py-8">
        <AnimatePresence mode="wait">
          {phase === "setup" && (
            <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <QuizSetup subject={subjectLabels[subject]} onStart={handleStart} />
            </motion.div>
          )}

          {phase === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32 gap-4"
            >
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="font-heading font-semibold text-foreground">Generating your quiz...</p>
              <p className="text-muted-foreground text-sm">Hang tight!</p>
            </motion.div>
          )}

          {phase === "quiz" && questions[currentIndex] && (
            <motion.div key={`q-${currentIndex}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <QuizQuestion
                question={questions[currentIndex]}
                questionNumber={currentIndex + 1}
                total={questions.length}
                onAnswer={handleAnswer}
              />
            </motion.div>
          )}

          {phase === "results" && (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <QuizResults
                score={score}
                total={questions.length}
                subject={subjectLabels[subject]}
                onRetry={handleRetry}
                onBackToChat={onBack}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}