import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import StudyPlanSetup from "@/components/studyplan/StudyPlanSetup";
import StudyPlanDisplay from "@/components/studyplan/StudyPlanDisplay";

const SUBJECTS = [
  { value: "English", emoji: "📖" },
  { value: "Math", emoji: "➗" },
  { value: "Biology", emoji: "🧬" },
  { value: "Chemistry", emoji: "⚗️" },
  { value: "Physics", emoji: "⚡" },
  { value: "History", emoji: "🏛️" },
  { value: "Geography", emoji: "🌍" },
  { value: "Computer Science", emoji: "💻" },
  { value: "Islamic Studies", emoji: "☪️" },
  { value: "Economics", emoji: "📊" },
  { value: "Language Learning", emoji: "🗣️" },
  { value: "Art", emoji: "🎨" },
  { value: "Music", emoji: "🎵" },
  { value: "Psychology", emoji: "🧠" },
];

const PLAN_JSON_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    overview: { type: "string" },
    weeks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          week: { type: "number" },
          theme: { type: "string" },
          days: {
            type: "array",
            items: {
              type: "object",
              properties: {
                day: { type: "number" },
                label: { type: "string" },
                focus: { type: "string" },
                tasks: { type: "array", items: { type: "string" } },
              },
            },
          },
        },
      },
    },
  },
};

export default function StudyPlan({ onBack, subject: initialSubject }) {
  // phases: subject-select | setup | loading | plan
  const [phase, setPhase] = useState("subject-select");
  const [selectedSubject, setSelectedSubject] = useState(initialSubject || null);
  const [plan, setPlan] = useState(null);
  const [config, setConfig] = useState(null);

  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject);
    setPhase("setup");
  };

  const handleManualGenerate = async (cfg) => {
    setConfig(cfg);
    setPhase("loading");

    const prompt = `You are an expert study planner. Create a detailed, realistic study plan for a student.

Subject: ${selectedSubject}
Goal: ${cfg.goal}
Duration: ${cfg.duration} days
Daily study time available: ${cfg.dailyTime} minutes
Current level: ${cfg.level}

Generate a day-by-day study plan. Group days into weeks. For each day, provide 2-4 specific study tasks that are concise and actionable. Make the plan progressive (start easy, build up).

Return a JSON object with this structure:
{
  "title": "short plan title",
  "overview": "2-sentence overview of the plan strategy",
  "weeks": [
    {
      "week": 1,
      "theme": "week theme/focus",
      "days": [
        {
          "day": 1,
          "label": "Day 1",
          "focus": "main focus for this day",
          "tasks": ["task 1", "task 2", "task 3"]
        }
      ]
    }
  ]
}`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: PLAN_JSON_SCHEMA,
    });

    setPlan(result);
    setPhase("plan");
  };

  const handleReset = () => {
    setPhase("subject-select");
    setPlan(null);
    setConfig(null);
    setSelectedSubject(null);

  };

  const handleBack = () => {
    if (phase === "subject-select") onBack();
    else if (phase === "setup") setPhase("subject-select");
    else onBack();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={handleBack} className="rounded-xl">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h2 className="font-heading font-semibold text-foreground">
            Study Plan Generator
            {selectedSubject && phase !== "subject-select" && (
              <span className="text-muted-foreground font-normal"> — {selectedSubject}</span>
            )}
          </h2>
        </div>
      </div>

      <div className="py-8">
        <AnimatePresence mode="wait">

          {/* Step 1: Subject selection */}
          {phase === "subject-select" && (
            <motion.div
              key="subject-select"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-xl mx-auto px-4"
            >
              <div className="text-center mb-8">
                <h2 className="font-heading text-2xl font-bold text-foreground mb-2">Choose a Subject</h2>
                <p className="text-muted-foreground text-sm">Pick the subject you want to create a study plan for.</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {SUBJECTS.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => handleSubjectSelect(s.value)}
                    className="flex flex-col items-center gap-2 bg-card border-2 border-border hover:border-primary rounded-2xl p-4 transition-all group"
                  >
                    <span className="text-3xl">{s.emoji}</span>
                    <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors text-center leading-tight">
                      {s.value}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Setup form */}
          {phase === "setup" && (
            <motion.div key="setup" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <StudyPlanSetup subject={selectedSubject} onGenerate={handleManualGenerate} />
            </motion.div>
          )}

          {/* Loading */}
          {phase === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32 gap-4"
            >
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="font-heading font-semibold text-foreground">
                Building your {selectedSubject} study plan…
              </p>
              <p className="text-muted-foreground text-sm">This may take a few seconds</p>
            </motion.div>
          )}

          {/* Plan display */}
          {phase === "plan" && plan && (
            <motion.div key="plan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <StudyPlanDisplay plan={plan} config={config} onReset={handleReset} />
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}