import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2, Wand2, PenLine } from "lucide-react";
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
  // phases: subject-select | mode-select | setup | loading | plan
  const [phase, setPhase] = useState("subject-select");
  const [selectedSubject, setSelectedSubject] = useState(initialSubject || null);
  const [pendingMode, setPendingMode] = useState(null);
  const [plan, setPlan] = useState(null);
  const [config, setConfig] = useState(null);

  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject);
    setPhase("mode-select");
  };

  const handleModeSelect = (mode) => {
    if (mode === "automatic") {
      runAutomatic(selectedSubject);
    } else {
      setPhase("setup");
    }
  };

  const handleAutomatic = async () => {
    runAutomatic(selectedSubject);
  };

  const runAutomatic = async (subject) => {
    setPhase("loading");

    const prompt = `You are an expert study planner. Create a comprehensive, automatic study plan for a student studying ${subject}.

Plan duration: 14 days
Daily study time: 45 minutes

Build a structured day-by-day ${subject} study plan that:
- Starts from foundational concepts and builds progressively
- Covers the most important topics in ${selectedSubject}
- Includes a variety of task types: reading, practice problems, review, etc.
- Is realistic and motivating

Group days into 2 weeks. For each day, provide 2-4 specific, actionable study tasks focused on ${selectedSubject}.

Return JSON with this structure:
{
  "title": "${subject} Study Plan",
  "overview": "2-sentence overview of what this plan covers and the learning approach",
  "weeks": [
    {
      "week": 1,
      "theme": "week theme",
      "days": [
        {
          "day": 1,
          "label": "Day 1",
          "focus": "main topic for this day",
          "tasks": ["specific task 1", "specific task 2", "specific task 3"]
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
    setConfig({ mode: "automatic", subject });
    setPhase("plan");
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
    setPendingMode(null);
  };

  const handleBack = () => {
    if (phase === "subject-select") onBack();
    else if (phase === "mode-select") setPhase("subject-select");
    else if (phase === "setup") setPhase("mode-select");
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

          {/* Step 2: Automatic or Manual */}
          {phase === "mode-select" && (
            <motion.div
              key="mode-select"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-xl mx-auto px-4"
            >
              <div className="text-center mb-10">
                <h2 className="font-heading text-2xl font-bold text-foreground mb-2">
                  How should we build your study plan?
                </h2>
                <p className="text-muted-foreground text-sm">Choose how you'd like to set it up.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => handleModeSelect("automatic")}
                  className="group text-left bg-card border-2 border-border hover:border-primary rounded-2xl p-6 transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Wand2 className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-heading font-bold text-foreground mb-1">Automatic</h3>
                  <p className="text-sm text-muted-foreground">
                    The AI instantly builds a complete 14-day study plan for you.
                  </p>
                  <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                    Recommended ✨
                  </div>
                </button>

                <button
                  onClick={() => handleModeSelect("manual")}
                  className="group text-left bg-card border-2 border-border hover:border-primary rounded-2xl p-6 transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                    <PenLine className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="font-heading font-bold text-foreground mb-1">Manual</h3>
                  <p className="text-sm text-muted-foreground">
                    Set your own goal, duration, and daily study time for a custom plan.
                  </p>
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3 (manual only): Setup form */}
          {phase === "setup" && (
            <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
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