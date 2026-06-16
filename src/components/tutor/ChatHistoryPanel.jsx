import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageSquare, Plus, Search, Bot, ChevronDown, ChevronRight } from "lucide-react";

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

// chatHistory shape: { [subject]: Array<Array<message>> }  (list of sessions)
export default function ChatHistoryPanel({ open, onClose, chatHistory, currentSubject, onLoadSession, onNewChat, translatedSubjectLabel }) {
  const [search, setSearch] = useState("");
  const [expandedSession, setExpandedSession] = useState(null);

  const subjectLabel = translatedSubjectLabel || subjectLabels[currentSubject] || currentSubject || "Subject";
  const subjectEmoji = subjectEmojis[currentSubject] || "📖";

  // sessions is an array of message arrays for the current subject
  const sessions = currentSubject ? (chatHistory[currentSubject] || []) : [];

  // Filter sessions: a session matches if any assistant message contains the search term
  const filteredSessions = search.trim()
    ? sessions.filter((session) =>
        session.some((m) => m.role === "assistant" && m.content?.toLowerCase().includes(search.toLowerCase()))
      )
    : sessions;

  // Show newest first
  const reversedSessions = [...filteredSessions].reverse();

  const getSessionPreview = (session) => {
    const lastAssistant = [...session].reverse().find((m) => m.role === "assistant");
    return lastAssistant?.content?.slice(0, 100) + (lastAssistant?.content?.length > 100 ? "…" : "") || "Empty session";
  };

  const getSessionTitle = (session, idx) => {
    const firstUser = session.find((m) => m.role === "user");
    return firstUser?.content?.slice(0, 40) + (firstUser?.content?.length > 40 ? "…" : "") || `Chat ${idx + 1}`;
  };

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
                  <p className="text-xs text-muted-foreground">{sessions.length} conversation{sessions.length !== 1 ? "s" : ""}</p>
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
                  placeholder="Search conversations..."
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

            {/* Sessions list */}
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
              {sessions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-xs">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  No chat history yet.<br />Start a conversation!
                </div>
              ) : reversedSessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-xs">
                  <Search className="w-6 h-6 mx-auto mb-2 opacity-30" />
                  No conversations match your search.
                </div>
              ) : (
                reversedSessions.map((session, i) => {
                  const realIdx = filteredSessions.length - 1 - i;
                  const isExpanded = expandedSession === realIdx;
                  const title = getSessionTitle(session, realIdx);
                  const preview = getSessionPreview(session);
                  const msgCount = session.filter((m) => m.role === "assistant").length;

                  return (
                    <div key={realIdx} className="rounded-xl border border-border overflow-hidden">
                      <div className="flex items-stretch bg-muted/30 hover:bg-muted/60 transition-colors">
                        <button
                          className="flex-1 flex items-start gap-2 px-3 py-2.5 text-left"
                          onClick={() => { onLoadSession(session); onClose(); }}
                        >
                          <div className="flex-shrink-0 w-5 h-5 rounded-lg flex items-center justify-center mt-0.5 bg-gradient-to-br from-accent to-emerald-500 text-white">
                            <Bot className="w-2.5 h-2.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-foreground truncate">{title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">{preview}</p>
                            <p className="text-xs text-muted-foreground/60 mt-0.5">{msgCount} response{msgCount !== 1 ? "s" : ""}</p>
                          </div>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setExpandedSession(isExpanded ? null : realIdx); }}
                          className="px-2 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {isExpanded
                            ? <ChevronDown className="w-3.5 h-3.5" />
                            : <ChevronRight className="w-3.5 h-3.5" />
                          }
                        </button>
                      </div>

                      {isExpanded && (
                        <div className="px-3 py-2 space-y-2 bg-card border-t border-border">
                          {session.filter((m) => m.role === "assistant").map((msg, j) => {
                            const msgPreview = msg.content?.slice(0, 150) + (msg.content?.length > 150 ? "…" : "");
                            return (
                              <div key={j} className="text-xs text-foreground/80 leading-relaxed border-l-2 border-accent/40 pl-2">
                                {search.trim() ? (
                                  <span dangerouslySetInnerHTML={{
                                    __html: msgPreview.replace(
                                      new RegExp(`(${search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"),
                                      '<mark class="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">$1</mark>'
                                    )
                                  }} />
                                ) : msgPreview}
                              </div>
                            );
                          })}
                        </div>
                      )}
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