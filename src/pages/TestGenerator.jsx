import { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2, Plus, Trash2, FileText, CheckSquare, List, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TestResults from "@/components/test/TestResults";

const ALL_SUBJECTS = [
  "Math", "English", "Biology", "Chemistry", "Physics", "History",
  "Geography", "Computer Science", "Islamic Studies", "Economics",
  "Language Learning", "Art", "Music", "Literature", "Psychology",
  "Sociology", "Philosophy", "Political Science", "Business Studies",
  "Environmental Science",
];

const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const FORMATS = [
  { value: "multiple_choice", label: "Multiple Choice", icon: List },
  { value: "type_answer", label: "Type Answer", icon: PenLine },
  { value: "true_false", label: "True / False", icon: CheckSquare },
  { value: "mixed", label: "Mixed", icon: FileText },
];
const COUNTS = [5, 10, 15, 20, 25, 30];

const emptySection = (subject = "Math") => ({
  id: Date.now() + Math.random(),
  subject,
  topic: "",
  difficulty: "Medium",
  format: "multiple_choice",
  count: 10,
});

export default function TestGenerator({ onBack, initialSubject }) {
  const [sections, setSections] = useState([emptySection(initialSubject || "Math")]);
  const [phase, setPhase] = useState("setup");
  const [testData, setTestData] = useState(null);
  const [topicErrors, setTopicErrors] = useState({});
  const topicRefs = useRef({});

  const addSection = () => setSections((s) => [...s, emptySection()]);
  const removeSection = (id) => setSections((s) => s.filter((sec) => sec.id !== id));
  const updateSection = (id, key, val) =>
    setSections((s) => s.map((sec) => (sec.id === id ? { ...sec, [key]: val } : sec)));

  const handleGenerate = async () => {
    const activeSections = sections;

    // Validate all sections have a topic
    const errors = {};
    activeSections.forEach((sec) => {
      if (!sec.topic.trim()) errors[sec.id] = true;
    });
    if (Object.keys(errors).length > 0) {
      setTopicErrors(errors);
      // Focus the first section with a missing topic
      const firstMissingId = Object.keys(errors)[0];
      setTimeout(() => {
        topicRefs.current[firstMissingId]?.focus();
        topicRefs.current[firstMissingId]?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
      return;
    }
    setTopicErrors({});

    setPhase("loading");

    // Autocorrect topic spellings
    const topicEntries = activeSections.map((sec) => `${sec.subject} — "${sec.topic}"`).join("\n");
    const correctionResult = await base44.integrations.Core.InvokeLLM({
      prompt: `Correct any spelling mistakes in the following academic topics. Keep the meaning the same — only fix misspellings. Return a JSON object with key "topics" containing an array of the corrected topic strings in the same order.\n\nTopics:\n${topicEntries}`,
      response_json_schema: {
        type: "object",
        properties: { topics: { type: "array", items: { type: "string" } } },
      },
    });

    const correctedTopics = correctionResult?.topics || activeSections.map((s) => s.topic);

    // Update sections with corrected topics
    const correctedSections = activeSections.map((sec, i) => ({ ...sec, topic: correctedTopics[i] || sec.topic }));
    setSections(correctedSections);

    const sectionPrompts = correctedSections.map((sec, i) =>
      `Section ${i + 1}: ${sec.subject}${sec.topic ? ` — Topic: "${sec.topic}"` : ""}, Difficulty: ${sec.difficulty}, Format: ${sec.format}, Questions: ${sec.count}`
    ).join("\n");

    const prompt = `Generate a comprehensive test with multiple sections as described below.

${sectionPrompts}

For each section, generate the specified number of questions with the correct format:
- "multiple_choice": 4 options, correct_answer matches one option exactly
- "type_answer": no options, correct_answer is a short word/phrase
- "true_false": options are ["True", "False"], correct_answer is "True" or "False"
- "mixed": mix all three types evenly

Return JSON:
{
  "title": "Custom Test",
  "sections": [
    {
      "subject": "...",
      "topic": "...",
      "difficulty": "...",
      "questions": [
        {
          "type": "multiple_choice",
          "question": "...",
          "options": ["A","B","C","D"],
          "correct_answer": "...",
          "explanation": "..."
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
          sections: {
            type: "array",
            items: {
              type: "object",
              properties: {
                subject: { type: "string" },
                topic: { type: "string" },
                difficulty: { type: "string" },
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
          },
        },
      },
    });

    // Override topics with the corrected versions
    const patchedResult = {
      ...result,
      sections: (result.sections || []).map((sec, i) => ({
        ...sec,
        topic: correctedTopics[i] || sec.topic,
      })),
    };

    setTestData(patchedResult);
    setPhase("results");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h2 className="font-heading font-semibold text-foreground">Test Generator</h2>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {phase === "setup" && (
            <motion.div key="setup" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h3 className="font-display text-2xl font-bold text-foreground mb-1">Build Your Test</h3>
              <p className="text-muted-foreground text-sm mb-6">Add one or more sections, each with its own subject, topic, and settings.</p>

              <div className="space-y-4 mb-6">
                {sections.map((sec, idx) => (
                  <motion.div
                    key={sec.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card border border-border rounded-2xl p-5"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-heading font-semibold text-foreground text-sm">Section {idx + 1}</h4>
                      {sections.length > 1 && (
                        <button onClick={() => removeSection(sec.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Subject */}
                    <div className="mb-4">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">Subject</label>
                      <div className="flex flex-wrap gap-1.5">
                        {ALL_SUBJECTS.map((s) => (
                          <button
                            key={s}
                            onClick={() => updateSection(sec.id, "subject", s)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all
                              ${sec.subject === s
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border bg-background text-muted-foreground hover:border-muted-foreground/40"}`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Topic */}
                    <div className="mb-4">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                        Topic <span className="text-red-500">*</span>
                      </label>
                      <Input
                        ref={(el) => { topicRefs.current[sec.id] = el; }}
                        value={sec.topic}
                        onChange={(e) => {
                          updateSection(sec.id, "topic", e.target.value);
                          if (topicErrors[sec.id]) setTopicErrors((prev) => { const next = { ...prev }; delete next[sec.id]; return next; });
                        }}
                        placeholder={`e.g. specific topic in ${sec.subject}...`}
                        className={`rounded-xl bg-background text-sm h-9 ${topicErrors[sec.id] ? "border-red-500 ring-1 ring-red-500" : ""}`}
                      />
                      {topicErrors[sec.id] && (
                        <p className="text-red-500 text-xs mt-1.5 font-medium">Topic is required</p>
                      )}
                    </div>

                    {/* Difficulty */}
                    <div className="mb-4">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">Difficulty</label>
                      <div className="flex gap-2">
                        {DIFFICULTIES.map((d) => (
                          <button
                            key={d}
                            onClick={() => updateSection(sec.id, "difficulty", d)}
                            className={`flex-1 py-2 rounded-xl text-xs font-semibold border-2 transition-all
                              ${sec.difficulty === d
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-background text-foreground hover:border-muted-foreground/40"}`}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Format */}
                    <div className="mb-4">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">Question Type</label>
                      <div className="grid grid-cols-2 gap-2">
                        {FORMATS.map(({ value, label, icon: Icon }) => (
                          <button
                            key={value}
                            onClick={() => updateSection(sec.id, "format", value)}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-left transition-all
                              ${sec.format === value
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border bg-background text-muted-foreground hover:border-muted-foreground/40"}`}
                          >
                            <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="text-xs font-medium">{label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Count */}
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">Number of Questions</label>
                      <div className="flex gap-2 flex-wrap">
                        {COUNTS.map((n) => (
                          <button
                            key={n}
                            onClick={() => updateSection(sec.id, "count", n)}
                            className={`w-10 h-10 rounded-xl text-sm font-semibold border-2 transition-all
                              ${sec.count === n
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-background text-foreground hover:border-muted-foreground/40"}`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <Button variant="outline" onClick={addSection} className="w-full rounded-xl gap-2 mb-4 border-dashed">
                <Plus className="w-4 h-4" />
                Add Another Section
              </Button>

              <Button onClick={handleGenerate} className="w-full h-12 rounded-xl font-semibold text-base">
                Generate Test 🎓
              </Button>
            </motion.div>
          )}

          {phase === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-32 gap-4"
            >
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="font-heading font-semibold text-foreground">Generating your test...</p>
              <p className="text-muted-foreground text-sm">This may take a moment</p>
            </motion.div>
          )}

          {phase === "results" && testData && (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <TestResults testData={testData} onReset={() => { setPhase("setup"); setTestData(null); }} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}