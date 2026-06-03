import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import StudyPlanSetup from "@/components/studyplan/StudyPlanSetup";
import StudyPlanDisplay from "@/components/studyplan/StudyPlanDisplay";

export default function StudyPlan({ onBack }) {
  const [phase, setPhase] = useState("setup"); // setup | loading | plan
  const [plan, setPlan] = useState(null);
  const [config, setConfig] = useState(null);

  const handleGenerate = async (cfg) => {
    setConfig(cfg);
    setPhase("loading");

    const prompt = `You are an expert study planner. Create a detailed, realistic study plan for a student.

Subject: ${cfg.subject}
Goal: ${cfg.goal}
Duration: ${cfg.duration} days
Daily study time available: ${cfg.dailyTime} minutes
Current level: ${cfg.level}

Generate a day-by-day study plan. Group days into weeks. For each day, provide 2-4 specific study tasks/topics that are concise and actionable. Make the plan progressive (start easy, build up).

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
    setPhase("setup");
    setPlan(null);
    setConfig(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h2 className="font-heading font-semibold text-foreground">Study Plan Generator</h2>
        </div>
      </div>

      <div className="py-8">
        <AnimatePresence mode="wait">
          {phase === "setup" && (
            <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <StudyPlanSetup onGenerate={handleGenerate} />
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
              <p className="font-heading font-semibold text-foreground">Building your study plan...</p>
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