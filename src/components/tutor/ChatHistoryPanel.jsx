import { motion, AnimatePresence } from "framer-motion";
import { X, MessageSquare, Plus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const subjectLabels = {
  english: "English", math: "Math", biology: "Biology", chemistry: "Chemistry",
  physics: "Physics", history: "History", geography: "Geography",
  computer_science: "Computer Science", islamic: "Islamic Studies", economics: "Economics",
  language: "Language Learning", art: "Art", music: "Music", psychology: "Psychology",
};

const subjectEmojis = {
  english: "📚", math: "🔢", biology: "🧬", chemistry: "⚗️", physics: "⚡",
  history: "🏛️", geography: "🌍", computer_science: "💻", islamic: "🌙",
  economics: "📈", language: "🗣️", art: "🎨", music: "🎵", psychology: "🧠",
};

export default function ChatHistoryPanel({ open, onClose, chatHistory, currentSubject, onSelectSubject, onNewChat }) {
  const subjectsWithHistory = Object.entries(chatHistory)
    .filter(([, msgs]) => msgs.length > 0)
    .sort(([a], [b]) => a.localeCompare(b));

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-72 z-50 bg-card border-l border-border shadow-2xl flex flex-col"
            dir="ltr"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                <h3 className="font-heading font-semibold text-foreground text-sm">Chat History</h3>
              </div>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* New chat button */}
            <div className="px-3 pt-3 pb-2">
              <button
                onClick={() => { onNewChat(); onClose(); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 border-dashed border-primary/30 text-primary text-sm font-medium hover:bg-primary/5 transition-all"
              >
                <Plus className="w-4 h-4" />
                New Chat
              </button>
            </div>

            {/* Subject list */}
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
              {subjectsWithHistory.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-xs">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  No chat history yet.<br />Start a conversation!
                </div>
              ) : (
                subjectsWithHistory.map(([subject, msgs]) => {
                  const isActive = subject === currentSubject;
                  const lastMsg = msgs[msgs.length - 1];
                  const preview = lastMsg?.content?.slice(0, 50) + (lastMsg?.content?.length > 50 ? "…" : "");
                  return (
                    <button
                      key={subject}
                      onClick={() => { onSelectSubject(subject); onClose(); }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center gap-3 group
                        ${isActive ? "bg-primary/10 border border-primary/20" : "hover:bg-muted border border-transparent"}`}
                    >
                      <span className="text-xl flex-shrink-0">{subjectEmojis[subject] || "📖"}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold truncate ${isActive ? "text-primary" : "text-foreground"}`}>
                          {subjectLabels[subject] || subject}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{preview || "No messages"}</p>
                        <p className="text-xs text-muted-foreground/60 mt-0.5">{msgs.length} message{msgs.length !== 1 ? "s" : ""}</p>
                      </div>
                      <ChevronRight className={`w-3 h-3 flex-shrink-0 transition-opacity ${isActive ? "text-primary opacity-100" : "opacity-0 group-hover:opacity-50"}`} />
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}