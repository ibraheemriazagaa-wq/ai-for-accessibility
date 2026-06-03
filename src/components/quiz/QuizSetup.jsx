import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Zap, Brain, Trophy, List, PenLine, CheckSquare } from "lucide-react";

const difficulties = [
  { value: "easy", label: "Easy", icon: Zap, color: "from-green-400 to-emerald-500", desc: "Basic concepts" },
  { value: "medium", label: "Medium", icon: Brain, color: "from-amber-400 to-orange-500", desc: "Some thinking required" },
  { value: "hard", label: "Hard", icon: Trophy, color: "from-red-400 to-rose-500", desc: "Challenge yourself" },
];

const formats = [
  { value: "multiple_choice", label: "Multiple Choice", icon: List, desc: "Pick the correct answer from 4 options" },
  { value: "type_answer", label: "Type Answer", icon: PenLine, desc: "Write your answer in your own words" },
  { value: "mixed", label: "Mixed", icon: CheckSquare, desc: "A mix of both formats" },
];

const questionCounts = [5, 10, 15, 20];

export default function QuizSetup({ subject, onStart }) {
  const [difficulty, setDifficulty] = useState("medium");
  const [format, setFormat] = useState("multiple_choice");
  const [count, setCount] = useState(10);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-xl mx-auto px-4 py-8"
    >
      <h2 className="font-display text-2xl font-bold text-foreground mb-1">Quiz Setup</h2>
      <p className="text-muted-foreground text-sm mb-8">Customize your quiz for <span className="text-primary font-medium">{subject}</span></p>

      {/* Difficulty */}
      <div className="mb-7">
        <h3 className="font-heading font-semibold text-sm text-foreground mb-3">Difficulty</h3>
        <div className="grid grid-cols-3 gap-3">
          {difficulties.map(({ value, label, icon: Icon, color, desc }) => (
            <button
              key={value}
              onClick={() => setDifficulty(value)}
              className={`rounded-xl p-4 border-2 text-left transition-all
                ${difficulty === value
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-muted-foreground/30"}`}
            >
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center mb-2`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <p className="font-semibold text-sm text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Format */}
      <div className="mb-7">
        <h3 className="font-heading font-semibold text-sm text-foreground mb-3">Question Format</h3>
        <div className="flex flex-col gap-2">
          {formats.map(({ value, label, icon: Icon, desc }) => (
            <button
              key={value}
              onClick={() => setFormat(value)}
              className={`flex items-center gap-3 rounded-xl p-3.5 border-2 text-left transition-all
                ${format === value
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-muted-foreground/30"}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                ${format === value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
              {format === value && <div className="ml-auto w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <div className="mb-8">
        <h3 className="font-heading font-semibold text-sm text-foreground mb-3">Number of Questions</h3>
        <div className="flex gap-3">
          {questionCounts.map((n) => (
            <button
              key={n}
              onClick={() => setCount(n)}
              className={`flex-1 rounded-xl py-3 font-semibold text-sm border-2 transition-all
                ${count === n
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:border-muted-foreground/30"}`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <Button
        onClick={() => onStart({ difficulty, format, count })}
        className="w-full h-12 rounded-xl font-semibold text-base"
      >
        Start Quiz 🚀
      </Button>
    </motion.div>
  );
}