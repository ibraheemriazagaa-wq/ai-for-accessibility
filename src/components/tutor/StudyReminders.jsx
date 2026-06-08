import { useState, useEffect, useRef } from "react";
import { Bell, BellOff, Plus, Trash2, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";

const STORAGE_KEY = "study_reminders";

function loadReminders() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveReminders(reminders) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
}

export default function StudyReminders({ subjects, subjectLabels }) {
  const [open, setOpen] = useState(false);
  const [reminders, setReminders] = useState(loadReminders);
  const [newSubject, setNewSubject] = useState(subjects[0]);
  const [newTime, setNewTime] = useState("08:00");
  const [permission, setPermission] = useState(Notification.permission);
  const panelRef = useRef(null);
  const firedTodayRef = useRef(new Set());

  // Persist on change
  useEffect(() => { saveReminders(reminders); }, [reminders]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Check reminders every minute
  useEffect(() => {
    const check = () => {
      if (permission !== "granted") return;
      const now = new Date();
      const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const todayKey = `${now.toDateString()}`;

      reminders.forEach((r) => {
        const key = `${todayKey}-${r.id}`;
        if (r.time === hhmm && !firedTodayRef.current.has(key)) {
          firedTodayRef.current.add(key);
          new Notification("📚 Study Reminder", {
            body: `Time to study ${subjectLabels[r.subject] || r.subject}! Open your study plan and get started.`,
            icon: "/favicon.ico",
          });
        }
      });
    };
    check();
    const interval = setInterval(check, 60000);
    return () => clearInterval(interval);
  }, [reminders, permission, subjectLabels]);

  const requestPermission = async () => {
    const result = await Notification.requestPermission();
    setPermission(result);
  };

  const addReminder = () => {
    const reminder = { id: Date.now(), subject: newSubject, time: newTime };
    setReminders((prev) => [...prev, reminder]);
  };

  const removeReminder = (id) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const activeCount = reminders.length;

  return (
    <div className="relative" ref={panelRef}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen((v) => !v)}
        className="rounded-xl gap-1.5 text-xs font-semibold"
        title="Study Reminders"
      >
        <Bell className="w-3.5 h-3.5" />
        Reminders
        {activeCount > 0 && (
          <span className="ml-0.5 bg-primary text-primary-foreground rounded-full w-4 h-4 text-[10px] flex items-center justify-center font-bold">
            {activeCount}
          </span>
        )}
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            className="absolute right-0 top-11 z-50 bg-card border border-border rounded-2xl shadow-xl p-4 w-80"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="font-heading font-semibold text-sm text-foreground flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-primary" /> Daily Study Reminders
              </p>
              <button onClick={() => setOpen(false)}>
                <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
              </button>
            </div>

            {permission !== "granted" && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3 text-xs text-amber-800">
                <p className="font-semibold mb-1">Enable notifications</p>
                <p className="mb-2">Allow notifications so reminders can alert you at the right time.</p>
                <Button size="sm" onClick={requestPermission} className="rounded-lg h-7 text-xs">
                  Enable Notifications
                </Button>
              </div>
            )}

            {/* Add new reminder */}
            <div className="bg-muted/40 rounded-xl p-3 mb-3">
              <p className="text-xs font-semibold text-foreground mb-2">Add Reminder</p>
              <div className="flex flex-col gap-2">
                <select
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full text-xs rounded-lg border border-border bg-card px-2 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {subjects.map((s) => (
                    <option key={s} value={s}>{subjectLabels[s] || s}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1.5 flex-1 border border-border rounded-lg bg-card px-2 py-1.5">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <input
                      type="time"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="flex-1 text-xs bg-transparent text-foreground focus:outline-none"
                    />
                  </div>
                  <Button size="sm" onClick={addReminder} className="rounded-lg h-8 px-3 text-xs gap-1">
                    <Plus className="w-3 h-3" /> Add
                  </Button>
                </div>
              </div>
            </div>

            {/* Existing reminders */}
            {reminders.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-3">No reminders set. Add one above!</p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {reminders.map((r) => (
                  <div key={r.id} className="flex items-center justify-between bg-muted/30 rounded-xl px-3 py-2 text-xs">
                    <div>
                      <span className="font-semibold text-foreground">{subjectLabels[r.subject] || r.subject}</span>
                      <span className="text-muted-foreground ml-2">every day at {r.time}</span>
                    </div>
                    <button onClick={() => removeReminder(r.id)} className="text-muted-foreground hover:text-destructive ml-2">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}