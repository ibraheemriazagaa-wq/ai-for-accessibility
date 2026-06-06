import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, RotateCcw, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

export default function TestResults({ testData, onReset }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [expandedSections, setExpandedSections] = useState(() =>
    Object.fromEntries((testData.sections || []).map((_, i) => [i, true]))
  );

  const toggleSection = (i) =>
    setExpandedSections((s) => ({ ...s, [i]: !s[i] }));

  const setAnswer = (secIdx, qIdx, val) => {
    if (submitted) return;
    setAnswers((a) => ({ ...a, [`${secIdx}-${qIdx}`]: val }));
  };

  const totalQuestions = (testData.sections || []).reduce((sum, s) => sum + (s.questions?.length || 0), 0);
  const answeredCount = Object.keys(answers).length;

  const handleSubmit = async () => {
    setSubmitted(true);
    // Calculate per-section scores and save each
    const sections = testData.sections || [];
    for (const [si, sec] of sections.entries()) {
      const sectionTotal = sec.questions?.length || 0;
      if (sectionTotal === 0) continue;
      const sectionScore = (sec.questions || []).filter((q, qi) => {
        const a = answers[`${si}-${qi}`] || "";
        return a.trim().toLowerCase() === q.correct_answer.trim().toLowerCase();
      }).length;
      base44.entities.TestScore.create({
        subject: sec.subject,
        topic: sec.topic || "",
        difficulty: sec.difficulty || "",
        score: sectionScore,
        total: sectionTotal,
        percentage: Math.round((sectionScore / sectionTotal) * 100),
        test_title: testData.title || "Custom Test",
      });
    }
  };

  const score = submitted
    ? (testData.sections || []).reduce((total, sec, si) =>
        total + (sec.questions || []).filter((q, qi) => {
          const a = answers[`${si}-${qi}`] || "";
          return a.trim().toLowerCase() === q.correct_answer.trim().toLowerCase();
        }).length, 0)
    : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display text-2xl font-bold text-foreground">{testData.title || "Your Test"}</h3>
          {submitted && (
            <p className="text-sm text-muted-foreground mt-1">
              Score: <span className="font-bold text-primary">{score}/{totalQuestions}</span> ({Math.round((score / totalQuestions) * 100)}%)
            </p>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={onReset} className="rounded-xl gap-2">
          <RotateCcw className="w-3.5 h-3.5" />
          New Test
        </Button>
      </div>

      <div className="space-y-4 mb-6">
        {(testData.sections || []).map((sec, si) => (
          <div key={si} className="bg-card border border-border rounded-2xl overflow-hidden">
            <button
              onClick={() => toggleSection(si)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors"
            >
              <div className="text-left">
                <p className="font-heading font-semibold text-foreground">{sec.subject}</p>
                {sec.topic && <p className="text-xs text-muted-foreground">Topic: {sec.topic}</p>}
                <p className="text-xs text-muted-foreground">{sec.difficulty} • {sec.questions?.length} questions</p>
              </div>
              {expandedSections[si] ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>

            <AnimatePresence>
              {expandedSections[si] && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 space-y-5 border-t border-border pt-4">
                    {(sec.questions || []).map((q, qi) => {
                      const key = `${si}-${qi}`;
                      const selected = answers[key] || "";
                      const isCorrect = submitted && selected.trim().toLowerCase() === q.correct_answer.trim().toLowerCase();
                      const isWrong = submitted && selected && !isCorrect;

                      return (
                        <div key={qi} className="space-y-2">
                          <p className="text-sm font-medium text-foreground">
                            <span className="text-muted-foreground mr-2">{qi + 1}.</span>
                            {q.question}
                          </p>

                          {/* Multiple choice / true-false */}
                          {(q.options && q.options.length > 0) ? (
                            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                              {q.options.map((opt, oi) => {
                                const isSelectedOpt = selected === opt;
                                const isCorrectOpt = submitted && opt.trim().toLowerCase() === q.correct_answer.trim().toLowerCase();
                                const isWrongOpt = submitted && isSelectedOpt && !isCorrectOpt;
                                return (
                                  <button
                                    key={oi}
                                    onClick={() => setAnswer(si, qi, opt)}
                                    disabled={submitted}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm text-left transition-all
                                      ${isCorrectOpt && submitted ? "border-green-500 bg-green-50 text-green-700" :
                                        isWrongOpt ? "border-red-400 bg-red-50 text-red-700" :
                                        isSelectedOpt ? "border-primary bg-primary/10 text-primary" :
                                        "border-border bg-background text-foreground hover:border-muted-foreground/40"}`}
                                  >
                                    {submitted && isCorrectOpt && <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />}
                                    {submitted && isWrongOpt && <XCircle className="w-3.5 h-3.5 flex-shrink-0" />}
                                    <span>{opt}</span>
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            /* Type answer */
                            <div>
                              <input
                                type="text"
                                value={selected}
                                onChange={(e) => setAnswer(si, qi, e.target.value)}
                                disabled={submitted}
                                placeholder="Type your answer..."
                                className={`w-full px-3 py-2 rounded-xl border text-sm bg-background outline-none transition-colors
                                  ${submitted
                                    ? isCorrect ? "border-green-500 text-green-700" : "border-red-400 text-red-700"
                                    : "border-border focus:border-primary"}`}
                              />
                              {submitted && (
                                <p className={`text-xs mt-1 ${isCorrect ? "text-green-600" : "text-red-600"}`}>
                                  {isCorrect ? "✓ Correct!" : `✗ Correct answer: ${q.correct_answer}`}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Explanation */}
                          {submitted && q.explanation && (
                            <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">{q.explanation}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {!submitted ? (
        <Button
          onClick={handleSubmit}
          disabled={answeredCount === 0}
          className="w-full h-12 rounded-xl font-semibold text-base"
        >
          Submit Test ({answeredCount}/{totalQuestions} answered)
        </Button>
      ) : (
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6 text-center">
          <p className="font-display text-3xl font-bold text-primary mb-1">{score}/{totalQuestions}</p>
          <p className="text-muted-foreground text-sm">{Math.round((score / totalQuestions) * 100)}% — {score === totalQuestions ? "🎉 Perfect score!" : score >= totalQuestions * 0.7 ? "👍 Great job!" : "📚 Keep studying!"}</p>
        </div>
      )}
    </div>
  );
}