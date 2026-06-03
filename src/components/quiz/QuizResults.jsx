import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Trophy, RotateCcw, BookOpen } from "lucide-react";

export default function QuizResults({ score, total, subject, onRetry, onBackToChat }) {
  const percent = Math.round((score / total) * 100);
  const grade = percent >= 90 ? "Excellent! 🌟" : percent >= 70 ? "Great job! 👍" : percent >= 50 ? "Good effort! 💪" : "Keep practicing! 📚";
  const color = percent >= 90 ? "from-yellow-400 to-amber-500" : percent >= 70 ? "from-green-400 to-emerald-500" : percent >= 50 ? "from-blue-400 to-indigo-500" : "from-slate-400 to-gray-500";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-sm mx-auto px-4 py-10 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 0.2 }}
        className={`w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br ${color} flex items-center justify-center mb-6 shadow-lg`}
      >
        <Trophy className="w-10 h-10 text-white" />
      </motion.div>

      <h2 className="font-display text-3xl font-bold text-foreground mb-1">{score}/{total}</h2>
      <p className="text-muted-foreground text-sm mb-2">{percent}% correct</p>
      <p className="font-heading text-lg font-semibold text-foreground mb-8">{grade}</p>

      {/* Score bar */}
      <div className="h-3 bg-muted rounded-full overflow-hidden mb-8">
        <motion.div
          className={`h-full bg-gradient-to-r ${color} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
        />
      </div>

      <div className="flex flex-col gap-3">
        <Button onClick={onRetry} className="w-full h-11 rounded-xl gap-2">
          <RotateCcw className="w-4 h-4" />
          Try Again
        </Button>
        <Button onClick={onBackToChat} variant="outline" className="w-full h-11 rounded-xl gap-2">
          <BookOpen className="w-4 h-4" />
          Back to Tutor
        </Button>
      </div>
    </motion.div>
  );
}