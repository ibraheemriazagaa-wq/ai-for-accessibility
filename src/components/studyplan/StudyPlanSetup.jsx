import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Target, Clock, Calendar } from "lucide-react";

const subjects = [
  { value: "English", label: "English" },
  { value: "Math", label: "Math" },
  { value: "Biology", label: "Biology" },
  { value: "Chemistry", label: "Chemistry" },
  { value: "Physics", label: "Physics" },
  { value: "History", label: "History" },
  { value: "Geography", label: "Geography" },
  { value: "Computer Science", label: "Computer Science" },
  { value: "Islamic Studies", label: "Islamic Studies" },
  { value: "Economics", label: "Economics" },
];

const durations = [7, 14, 21, 30];
const dailyTimes = [
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1.5 hrs" },
  { value: 120, label: "2 hours" },
];
const levels = ["Beginner", "Intermediate", "Advanced"];

export default function StudyPlanSetup({ onGenerate, subject: initialSubject }) {
  const [subject, setSubject] = useState(initialSubject || "");
  const [goal, setGoal] = useState("");
  const [duration, setDuration] = useState(14);
  const [dailyTime, setDailyTime] = useState(30);
  const [level, setLevel] = useState("Beginner");

  const canSubmit = subject && goal.trim();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-xl mx-auto px-4"
    >
      <div className="text-center mb-8">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
          <BookOpen className="w-6 h-6 text-primary" />
        </div>
        <h2 className="font-heading text-2xl font-bold text-foreground mb-2">Create Your Study Plan</h2>
        <p className="text-muted-foreground text-sm">Tell us your goal and we'll build a personalized plan for you.</p>
      </div>

      {/* Subject — only show picker if not pre-selected */}
      {!initialSubject && (
        <div className="mb-6">
          <label className="block font-heading font-semibold text-sm text-foreground mb-3">
            <BookOpen className="inline w-4 h-4 mr-1.5 text-primary" />Subject
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {subjects.map((s) => (
              <button
                key={s.value}
                onClick={() => setSubject(s.value)}
                className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                  subject === s.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border text-foreground hover:border-primary/50"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Goal */}
      <div className="mb-6">
        <label className="block font-heading font-semibold text-sm text-foreground mb-3">
          <Target className="inline w-4 h-4 mr-1.5 text-primary" />Your Goal
        </label>
        <Textarea
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder='e.g. "Pass my chemistry exam in 2 weeks" or "Understand algebra basics"'
          className="rounded-xl resize-none bg-card"
          rows={3}
        />
      </div>

      {/* Duration */}
      <div className="mb-6">
        <label className="block font-heading font-semibold text-sm text-foreground mb-3">
          <Calendar className="inline w-4 h-4 mr-1.5 text-primary" />Plan Duration
        </label>
        <div className="flex gap-2 flex-wrap">
          {durations.map((d) => (
            <button
              key={d}
              onClick={() => setDuration(d)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                duration === d
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-foreground hover:border-primary/50"
              }`}
            >
              {d} days
            </button>
          ))}
        </div>
      </div>

      {/* Daily time */}
      <div className="mb-6">
        <label className="block font-heading font-semibold text-sm text-foreground mb-3">
          <Clock className="inline w-4 h-4 mr-1.5 text-primary" />Daily Study Time
        </label>
        <div className="flex gap-2 flex-wrap">
          {dailyTimes.map((t) => (
            <button
              key={t.value}
              onClick={() => setDailyTime(t.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                dailyTime === t.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-foreground hover:border-primary/50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Level */}
      <div className="mb-8">
        <label className="block font-heading font-semibold text-sm text-foreground mb-3">Current Level</label>
        <div className="flex gap-2">
          {levels.map((l) => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                level === l
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-foreground hover:border-primary/50"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <Button
        onClick={() => onGenerate({ subject, goal: goal.trim(), duration, dailyTime, level })}
        disabled={!canSubmit}
        className="w-full h-12 rounded-xl font-semibold text-base"
      >
        Generate My Study Plan 📚
      </Button>
    </motion.div>
  );
}