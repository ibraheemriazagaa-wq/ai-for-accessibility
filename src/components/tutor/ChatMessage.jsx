import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Bot, User } from "lucide-react";

export default function ChatMessage({ message }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
    >
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center mt-1
          ${isUser
            ? "bg-primary text-primary-foreground"
            : "bg-gradient-to-br from-accent to-emerald-500 text-white"
          }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-md"
            : "bg-card border border-border text-card-foreground rounded-tl-md shadow-sm"
        }`}
      >
        {isUser ? (
          <p className="text-sm leading-relaxed">{message.content}</p>
        ) : (
          <>
            <ReactMarkdown
              className="text-sm prose prose-sm prose-slate dark:prose-invert max-w-none
                [&>*:first-child]:mt-0 [&>*:last-child]:mb-0
                prose-p:my-1.5 prose-p:leading-relaxed
                prose-ul:my-1.5 prose-ol:my-1.5
                prose-li:my-0.5
                prose-headings:font-heading prose-headings:font-semibold
                prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs
                prose-pre:bg-muted prose-pre:rounded-xl"
            >
              {message.content}
            </ReactMarkdown>
            {message.imageUrl && (
              <img
                src={message.imageUrl}
                alt="Educational visual"
                className="mt-3 rounded-xl w-full max-w-sm border border-border"
              />
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}