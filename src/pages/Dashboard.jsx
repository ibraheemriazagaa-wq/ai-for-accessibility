import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { ArrowLeft, TrendingUp, ClipboardList, Award, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { format } from "date-fns";

const SUBJECT_COLORS = {
  Math: "#6366f1", English: "#14b8a6", Biology: "#22c55e", Chemistry: "#a855f7",
  Physics: "#06b6d4", History: "#f59e0b", Geography: "#10b981", "Computer Science": "#64748b",
  "Islamic Studies": "#16a34a", Economics: "#f43f5e", "Language Learning": "#d946ef",
  Art: "#ec4899", Music: "#8b5cf6", Psychology: "#0ea5e9",
};

const getColor = (subject) => SUBJECT_COLORS[subject] || "#6366f1";

export default function Dashboard({ onBack }) {
  const [selectedSubject, setSelectedSubject] = useState("All");

  const { data: scores = [], isLoading } = useQuery({
    queryKey: ["test-scores"],
    queryFn: () => base44.entities.TestScore.list("-created_date", 200),
  });

  // Unique subjects from scores
  const subjects = ["All", ...Array.from(new Set(scores.map((s) => s.subject)))];

  // Filtered scores
  const filtered = selectedSubject === "All" ? scores : scores.filter((s) => s.subject === selectedSubject);

  // Chart data: last 20 attempts, oldest first
  const chartData = [...filtered].reverse().slice(0, 20).map((s, i) => ({
    attempt: i + 1,
    score: s.percentage,
    subject: s.subject,
    date: s.created_date ? format(new Date(s.created_date), "MMM d") : "",
    label: `${s.subject}${s.topic ? ` — ${s.topic}` : ""}`,
  }));

  // Per-subject averages for bar chart
  const subjectAverages = Object.entries(
    scores.reduce((acc, s) => {
      if (!acc[s.subject]) acc[s.subject] = { total: 0, count: 0 };
      acc[s.subject].total += s.percentage;
      acc[s.subject].count += 1;
      return acc;
    }, {})
  ).map(([subject, { total, count }]) => ({
    subject,
    avg: Math.round(total / count),
  })).sort((a, b) => b.avg - a.avg);

  // Stats
  const avg = filtered.length ? Math.round(filtered.reduce((s, r) => s + r.percentage, 0) / filtered.length) : 0;
  const best = filtered.length ? Math.max(...filtered.map((s) => s.percentage)) : 0;
  const totalTests = filtered.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h2 className="font-heading font-semibold text-foreground">My Progress</h2>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : scores.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-center py-32">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
              <ClipboardList className="w-7 h-7 text-primary" />
            </div>
            <h3 className="font-heading text-xl font-semibold text-foreground mb-2">No test scores yet</h3>
            <p className="text-muted-foreground text-sm">Complete a test to start tracking your progress!</p>
          </motion.div>
        ) : (
          <>
            {/* Subject filter */}
            <div className="flex flex-wrap gap-2">
              {subjects.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSubject(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
                    ${selectedSubject === s
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:border-muted-foreground/50"}`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Tests Taken", value: totalTests, icon: ClipboardList, color: "text-primary" },
                { label: "Average Score", value: `${avg}%`, icon: TrendingUp, color: "text-accent" },
                { label: "Best Score", value: `${best}%`, icon: Award, color: "text-yellow-500" },
              ].map(({ label, value, icon: Icon, color }) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card border border-border rounded-2xl p-4 text-center"
                >
                  <Icon className={`w-5 h-5 mx-auto mb-2 ${color}`} />
                  <p className="font-display text-2xl font-bold text-foreground">{value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                </motion.div>
              ))}
            </div>

            {/* Score over time */}
            {chartData.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-2xl p-5"
              >
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <h3 className="font-heading font-semibold text-foreground text-sm">Score Over Time</h3>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} unit="%" />
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }}
                      formatter={(v, _, props) => [`${v}%`, props.payload.label]}
                    />
                    <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(var(--primary))" }} />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>
            )}

            {/* Average by subject */}
            {subjectAverages.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-2xl p-5"
              >
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-4 h-4 text-accent" />
                  <h3 className="font-heading font-semibold text-foreground text-sm">Average Score by Subject</h3>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={subjectAverages} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} unit="%" />
                    <YAxis type="category" dataKey="subject" width={120} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }}
                      formatter={(v) => [`${v}%`, "Average"]}
                    />
                    <Bar dataKey="avg" radius={[0, 6, 6, 0]}>
                      {subjectAverages.map((entry) => (
                        <Cell key={entry.subject} fill={getColor(entry.subject)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            )}

            {/* Recent scores list */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-2xl overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-border">
                <h3 className="font-heading font-semibold text-foreground text-sm">Recent Tests</h3>
              </div>
              <div className="divide-y divide-border">
                {filtered.slice(0, 10).map((s) => (
                  <div key={s.id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{s.subject}{s.topic ? ` — ${s.topic}` : ""}</p>
                      <p className="text-xs text-muted-foreground">
                        {s.difficulty} • {s.score}/{s.total} correct
                        {s.created_date ? ` • ${format(new Date(s.created_date), "MMM d, yyyy")}` : ""}
                      </p>
                    </div>
                    <div className={`font-bold text-sm px-3 py-1 rounded-full
                      ${s.percentage >= 80 ? "bg-green-100 text-green-700" :
                        s.percentage >= 60 ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"}`}>
                      {s.percentage}%
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}