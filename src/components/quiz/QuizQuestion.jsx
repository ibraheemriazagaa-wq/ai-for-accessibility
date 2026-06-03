import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";

export default function QuizQuestion({ question, questionNumber, total, onAnswer }) {
  const [selected, setSelected] = useState(null);
  const [typed, setTyped] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const isMultiple = question.type === "multiple_choice";

  const handleSubmit = () => {
    if (submitted) return;
    const answer = isMultiple ? selected : typed.trim();
    if (!answer) return;
    setSubmitted(true);
  };

  const handleNext = () => {
    const answer = isMultiple ? selected : typed.trim();
    const correct = isMultiple
      ? selected === question.correct_answer
      : typed.trim().toLowerCase() === question.correct_answer.toLowerCase();
    onAnswer({ answer, correct });
    setSelected(null);
    setTyped("");
    setSubmitted(false);
  };

  const isCorrect = isMultiple
    ? selected === question.correct_answer
    : typed.trim().toLowerCase() === question.correct_answer?.toLowerCase();

  return (
    <motion.div
      key={questionNumber}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className="max-w-xl mx-auto px-4"
    >
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>Question {questionNumber} of {total}</span>
          <span>{Math.round((questionNumber - 1) / total * 100)}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: `${((questionNumber - 2) / total) * 100}%` }}
            animate={{ width: `${((questionNumber - 1) / total) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="bg-card border border-border rounded-2xl p-5 mb-5 shadow-sm">
        <p className="font-heading font-semibold text-foreground leading-relaxed">{question.question}</p>
      </div>

      {/* Multiple choice */}
      {isMultiple && (
        <div className="space-y-2.5 mb-5">
          {question.options.map((opt, i) => {
            const letter = ["A", "B", "C", "D"][i];
            let state = "default";
            if (submitted) {
              if (opt === question.correct_answer) state = "correct";
              else if (opt === selected) state = "wrong";
            } else if (selected === opt) {
              state = "selected";
            }

            return (
              <button
                key={i}
                disabled={submitted}
                onClick={() => setSelected(opt)}
                className={`w-full flex items-center gap-3 rounded-xl p-3.5 border-2 text-left transition-all
                  ${state === "correct" ? "border-green-500 bg-green-50 dark:bg-green-950/30" :
                    state === "wrong" ? "border-red-400 bg-red-50 dark:bg-red-950/30" :
                    state === "selected" ? "border-primary bg-primary/5" :
                    "border-border bg-card hover:border-muted-foreground/30"}`}
              >
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0
                  ${state === "correct" ? "bg-green-500 text-white" :
                    state === "wrong" ? "bg-red-400 text-white" :
                    state === "selected" ? "bg-primary text-primary-foreground" :
                    "bg-muted text-muted-foreground"}`}>
                  {letter}
                </span>
                <span className="text-sm font-medium text-foreground">{opt}</span>
                {state === "correct" && <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto" />}
                {state === "wrong" && <XCircle className="w-4 h-4 text-red-400 ml-auto" />}
              </button>
            );
          })}
        </div>
      )}

      {/* Type answer */}
      {!isMultiple && (
        <div className="mb-5">
          <Input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !submitted && handleSubmit()}
            disabled={submitted}
            placeholder="Type your answer here..."
            className="rounded-xl h-12 bg-card text-sm"
          />
          {submitted && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-3 rounded-xl p-3.5 border ${isCorrect ? "bg-green-50 border-green-300 dark:bg-green-950/30" : "bg-red-50 border-red-300 dark:bg-red-950/30"}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {isCorrect
                    ? <CheckCircle2 className="w-4 h-4 text-green-600" />
                    : <XCircle className="w-4 h-4 text-red-500" />}
                  <span className={`text-sm font-semibold ${isCorrect ? "text-green-700 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                    {isCorrect ? "Correct!" : "Not quite!"}
                  </span>
                </div>
                {!isCorrect && (
                  <p className="text-sm text-muted-foreground">
                    Correct answer: <span className="font-semibold text-foreground">{question.correct_answer}</span>
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">{question.explanation}</p>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      )}

      {/* Feedback for multiple choice */}
      {isMultiple && submitted && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-5 rounded-xl p-3.5 border ${isCorrect ? "bg-green-50 border-green-300 dark:bg-green-950/30" : "bg-red-50 border-red-300 dark:bg-red-950/30"}`}
          >
            <div className="flex items-center gap-2 mb-1">
              {isCorrect
                ? <CheckCircle2 className="w-4 h-4 text-green-600" />
                : <XCircle className="w-4 h-4 text-red-500" />}
              <span className={`text-sm font-semibold ${isCorrect ? "text-green-700 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                {isCorrect ? "Correct!" : "Not quite!"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{question.explanation}</p>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Buttons */}
      {!submitted ? (
        <Button
          onClick={handleSubmit}
          disabled={isMultiple ? !selected : !typed.trim()}
          className="w-full h-11 rounded-xl font-semibold"
        >
          Submit Answer
        </Button>
      ) : (
        <Button onClick={handleNext} className="w-full h-11 rounded-xl font-semibold gap-2">
          {questionNumber === total ? "See Results" : "Next Question"}
          <ArrowRight className="w-4 h-4" />
        </Button>
      )}
    </motion.div>
  );
}