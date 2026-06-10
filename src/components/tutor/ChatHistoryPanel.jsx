import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageSquare, Plus, Search, Bot, User } from "lucide-react";

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
  const [search, setSearch] = useState("");

  // Only show messages for the current subject
  const currentMessages = currentSubject ? (chatHistory[currentSubject] || []) : [];

  const filtered = search.trim()
    ? currentMessages.filter((m) => m.content?.toLowerCase().includes(search.toLowerCase()))
    : currentMessages;

  const subjectLabel = subjectLabels[currentSubject] || currentSubject || "Subject";
  const subjectEmoji = subjectEmojis[currentSubject] || "📖";

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
            className="fixed right-0 top-0 h-full w-80 z-50 bg-card border-l border-border shadow-2xl flex flex-col"
            dir="ltr"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="text-lg">{subjectEmoji}</span>
                <div>
                  <h3 className="font-heading font-semibold text-foreground text-sm">{subjectLabel} History</h3>
                  <p className="text-xs text-muted-foreground">{currentMessages.length} message{currentMessages.length !== 1 ? "s" : ""}</p>
                </div>
              </div>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search */}
            <div className="px-3 pt-3 pb-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search messages..."
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-border bg-muted/50 focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/60"
                />
              </div>
            </div>

            {/* New chat button */}
            <div className="px-3 pb-2">
              <button
                onClick={() => { onNewChat(); onClose(); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 border-dashed border-primary/30 text-primary text-sm font-medium hover:bg-primary/5 transition-all"
              >
                <Plus className="w-4 h-4" />
                New Chat
              </button>
            </div>

            {/* Messages list */}
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
              {currentMessages.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-xs">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  No chat history yet.<br />Start a conversation!
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-xs">
                  <Search className="w-6 h-6 mx-auto mb-2 opacity-30" />
                  No messages match your search.
                </div>
              ) : (
                filtered.map((msg, i) => {
                  const isUser = msg.role === "user";
                  const preview = msg.content?.slice(0, 120) + (msg.content?.length > 120 ? "…" : "");
                  // Highlight search term
                  const highlighted = search.trim()
                    ? preview.replace(new RegExp(`(${search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"), "**$1**")
                    : preview;

                  return (
                    <div
                      key={i}
                      className={`flex gap-2 px-3 py-2.5 rounded-xl border text-xs
                        ${isUser ? "bg-primary/5 border-primary/10" : "bg-muted/40 border-border"}`}
                    >
                      <div className={`flex-shrink-0 w-5 h-5 rounded-lg flex items-center justify-center mt-0.5
                        ${isUser ? "bg-primary text-white" : "bg-gradient-to-br from-accent to-emerald-500 text-white"}`}>
                        {isUser ? <User className="w-2.5 h-2.5" /> : <Bot className="w-2.5 h-2.5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-muted-foreground mb-0.5">
                          {isUser ? "You" : "Tutor"}
                        </p>
                        <p className="text-xs text-foreground/80 leading-relaxed whitespace-pre-wrap break-words">
                          {search.trim() ? (
                            <span dangerouslySetInnerHTML={{
                              __html: preview.replace(
                                new RegExp(`(${search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"),
                                '<mark class="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">$1</mark>'
                              )
                            }} />
                          ) : preview}
                        </p>
                      </div>
                    </div>
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