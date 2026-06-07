import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2, Wand2, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import StudyPlanSetup from "@/components/studyplan/StudyPlanSetup";
import StudyPlanDisplay from "@/components/studyplan/StudyPlanDisplay";

export default function StudyPlan({ onBack }) {
  const [phase, setPhase] = useState("mode"); // mode | setup | loading | plan
  const [planMode, setPlanMode] = useState(null); // "manual" | "automatic"
  const [plan, setPlan] = useState(null);
  const [config, setConfig] = useState(null);

  const handleModeSelect = (m) => {
    setPlanMode(m);
    setPhase(m === "manual" ? "setup" : "auto-loading");
    if (m === "automatic") generateAutomatic();
  };

  const generateAutomatic = async () => {
    setPhase("loading");

    // Fetch test scores to find weak areas
    const scores = await base44.entities.TestScore.list("-created_date", 100);

    let weakAreasPrompt = "";
    if (scores.length === 0) {
      weakAreasPrompt = "The student has no test history yet. Create a balanced beginner study plan covering foundational topics across all subjects.";
    } else {
      // Group by subject, calculate averages
      const bySubject = scores.reduce((acc, s) => {
        if (!acc[s.subject]) acc[s.subject] = { total: 0, count: 0 };
        acc[s.subject].total += s.percentage;
        acc[s.subject].count += 1;
        return acc;
      }, {});

      const subjectSummaries = Object.entries(bySubject)
        .map(([subject, { total, count }]) => ({
          subject,
          avg: Math.round(total / count),
          tests: count,
        }))
        .sort((a, b) => a.avg - b.avg); // Weakest first

      const weakSubjects = subjectSummaries.filter((s) => s.avg < 70);
      const strongSubjects = subjectSummaries.filter((s) => s.avg >= 70);

      weakAreasPrompt = `Based on the student's test history:

WEAK AREAS (needs most focus):
${weakSubjects.length > 0
  ? weakSubjects.map((s) => `- ${s.subject}: ${s.avg}% average across ${s.tests} test(s)`).join("\n")
  : "None identified yet."}

STRONGER AREAS:
${strongSubjects.length > 0
  ? strongSubjects.map((s) => `- ${s.subject}: ${s.avg}% average`).join("\n")
  : "None identified yet."}

Focus the study plan heavily on the weak areas. Allocate more time to subjects with lower scores. For stronger subjects, only include brief review sessions.`;
    }

    const prompt = `You are an expert study planner. Create a smart, personalized study plan based on this student's performance data.

${weakAreasPrompt}

Plan duration: 14 days
Daily study time: 45 minutes

Generate a practical, day-by-day study plan. Group days into weeks. For each day, provide 2-4 specific, actionable study tasks. Start with the weakest subjects and build up progressively.

Return a JSON object with this exact structure:
{
  "title": "short plan title",
  "overview": "2-sentence overview explaining what this plan focuses on and why",
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
      response_json_schema: {
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
      },
    });

    setPlan(result);
    setConfig({ mode: "automatic" });
    setPhase("plan");
  };

  const handleManualGenerate = async (cfg) => {
    setConfig(cfg);
    setPhase("loading");

    const prompt = `You are an expert study planner. Create a detailed, realistic study plan for a student.

Subject: ${cfg.subject}
Goal: ${cfg.goal}
Duration: ${cfg.duration} days
Daily study time available: ${cfg.dailyTime} minutes
Current level: ${cfg.level}

Generate a day-by-day study plan. Group days into weeks. For each day, provide 2-4 specific study tasks that are concise and actionable. Make the plan progressive (start easy, build up).

Return a JSON object with this exact structure:
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
      response_json_schema: {
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
      },
    });

    setPlan(result);
    setPhase("plan");
  };

  const handleReset = () => {
    setPhase("mode");
    setPlan(null);
    setConfig(null);
    setPlanMode(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={phase === "setup" ? () => setPhase("mode") : onBack}
            className="rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h2 className="font-heading font-semibold text-foreground">Study Plan Generator</h2>
        </div>
      </div>

      <div className="py-8">
        <AnimatePresence mode="wait">
          {phase === "mode" && (
            <motion.div
              key="mode"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-xl mx-auto px-4"
            >
              <div className="text-center mb-10">
                <h2 className="font-heading text-2xl font-bold text-foreground mb-2">Choose Plan Type</h2>
                <p className="text-muted-foreground text-sm">
                  How would you like to create your study plan?
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Automatic */}
                <button
                  onClick={() => handleModeSelect("automatic")}
                  className="group text-left bg-card border-2 border-border hover:border-primary rounded-2xl p-6 transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Wand2 className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-heading font-bold text-foreground mb-1">Automatic</h3>
                  <p className="text-sm text-muted-foreground">
                    AI analyzes your test scores and weak areas to build a smart, personalized plan for you.
                  </p>
                  <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                    Recommended ✨
                  </div>
                </button>

                {/* Manual */}
                <button
                  onClick={() => handleModeSelect("manual")}
                  className="group text-left bg-card border-2 border-border hover:border-primary rounded-2xl p-6 transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                    <PenLine className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="font-heading font-bold text-foreground mb-1">Manual</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose your own subject, goal, duration, and daily study time to build a custom plan.
                  </p>
                </button>
              </div>
            </motion.div>
          )}

          {phase === "setup" && (
            <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <StudyPlanSetup onGenerate={handleManualGenerate} />
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
              <p className="font-heading font-semibold text-foreground">
                {planMode === "automatic" ? "Analyzing your scores and building your plan…" : "Building your study plan…"}
              </p>
              <p className="text-muted-foreground text-sm">This may take a few seconds</p>
            </motion.div>
          )}

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