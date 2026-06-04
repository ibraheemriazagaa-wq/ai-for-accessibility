import { motion } from "framer-motion";

const subjectStyles = {
  english: { gradient: "from-blue-500 to-indigo-600", emoji: "📝" },
  math: { gradient: "from-amber-500 to-orange-600", emoji: "🔢" },
  biology: { gradient: "from-emerald-500 to-green-600", emoji: "🧬" },
  chemistry: { gradient: "from-purple-500 to-violet-600", emoji: "⚗️" },
  physics: { gradient: "from-cyan-500 to-blue-600", emoji: "⚡" },
  history: { gradient: "from-yellow-600 to-amber-700", emoji: "📜" },
  geography: { gradient: "from-teal-500 to-emerald-600", emoji: "🌍" },
  computer_science: { gradient: "from-slate-600 to-gray-800", emoji: "💻" },
  islamic: { gradient: "from-green-600 to-emerald-700", emoji: "☪️" },
  economics: { gradient: "from-rose-500 to-pink-600", emoji: "📊" },
  language: { gradient: "from-fuchsia-500 to-purple-600", emoji: "🗣️" },
};

const subjectLabels = {
  english: "English",
  math: "Math",
  biology: "Biology",
  chemistry: "Chemistry",
  physics: "Physics",
  history: "History",
  geography: "Geography",
  computer_science: "Computer Science",
  islamic: "Islamic Studies",
  economics: "Economics",
  language: "Language Learning",
};

export default function SubjectCard({ subject, isSelected, onClick }) {
  const style = subjectStyles[subject];
  const label = subjectLabels[subject];

  return (
    <motion.button
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl p-5 text-left transition-all duration-200
        ${isSelected
          ? `bg-gradient-to-br ${style.gradient} text-white shadow-lg shadow-primary/20 ring-2 ring-white/30`
          : "bg-card text-card-foreground shadow-sm hover:shadow-md border border-border"
        }`}
    >
      <div className="text-3xl mb-3">{style.emoji}</div>
      <h3 className={`font-heading font-semibold text-sm ${isSelected ? "text-white" : ""}`}>
        {label}
      </h3>
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 right-2 w-5 h-5 bg-white/30 rounded-full flex items-center justify-center"
        >
          <span className="text-white text-xs">✓</span>
        </motion.div>
      )}
    </motion.button>
  );
}