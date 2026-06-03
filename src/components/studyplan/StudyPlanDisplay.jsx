import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";

export default function StudyPlanDisplay({ plan, config, onReset }) {
  const [completed, setCompleted] = useState(new Set());
  const [expandedWeeks, setExpandedWeeks] = useState(new Set([1]));

  const totalTasks = plan.weeks.flatMap((w) => w.days.flatMap((d) => d.tasks)).length;
  const completedCount = completed.size;
  const progress = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  const toggleTask = (key) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleWeek = (weekNum) => {
    setExpandedWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(weekNum)) next.delete(weekNum);
      else next.add(weekNum);
      return next;
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h2 className="font-heading text-2xl font-bold text-foreground mb-1">{plan.title}</h2>
        <p className="text-muted-foreground text-sm mb-4">{plan.overview}</p>

        {/* Meta */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full">{config.subject}</span>
          <span className="bg-secondary text-secondary-foreground text-xs font-medium px-3 py-1 rounded-full">{config.duration} days</span>
          <span className="bg-secondary text-secondary-foreground text-xs font-medium px-3 py-1 rounded-full">{config.dailyTime} min/day</span>
          <span className="bg-secondary text-secondary-foreground text-xs font-medium px-3 py-1 rounded-full">{config.level}</span>
        </div>

        {/* Progress bar */}
        <div className="bg-muted rounded-full h-2.5 mb-1">
          <motion.div
            className="bg-primary rounded-full h-2.5"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <p className="text-xs text-muted-foreground">{completedCount} / {totalTasks} tasks completed ({progress}%)</p>
      </motion.div>

      {/* Weeks */}
      <div className="space-y-3 mb-8">
        {plan.weeks.map((week, wi) => {
          const isExpanded = expandedWeeks.has(week.week);
          return (
            <motion.div
              key={week.week}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: wi * 0.05 }}
              className="border border-border rounded-2xl overflow-hidden bg-card"
            >
              {/* Week header */}
              <button
                onClick={() => toggleWeek(week.week)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                    W{week.week}
                  </span>
                  <div className="text-left">
                    <p className="font-heading font-semibold text-sm text-foreground">Week {week.week}</p>
                    <p className="text-xs text-muted-foreground">{week.theme}</p>
                  </div>
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>

              {/* Days */}
              {isExpanded && (
                <div className="border-t border-border divide-y divide-border">
                  {week.days.map((day) => (
                    <div key={day.day} className="px-5 py-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-semibold text-primary">{day.label}</span>
                        <span className="text-xs text-muted-foreground">— {day.focus}</span>
                      </div>
                      <ul className="space-y-2">
                        {day.tasks.map((task, ti) => {
                          const key = `${day.day}-${ti}`;
                          const done = completed.has(key);
                          return (
                            <li key={ti} className="flex items-start gap-2.5">
                              <button onClick={() => toggleTask(key)} className="mt-0.5 flex-shrink-0">
                                {done
                                  ? <CheckCircle2 className="w-4 h-4 text-accent" />
                                  : <Circle className="w-4 h-4 text-muted-foreground" />}
                              </button>
                              <span className={`text-sm ${done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                                {task}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <Button variant="outline" onClick={onReset} className="w-full rounded-xl gap-2">
        <RefreshCw className="w-4 h-4" />
        Generate a New Plan
      </Button>
    </div>
  );
}