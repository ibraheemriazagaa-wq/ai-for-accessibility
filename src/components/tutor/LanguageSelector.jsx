import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe } from "lucide-react";

const languages = [
  { value: "english", label: "English" },
  { value: "arabic", label: "العربية (Arabic)" },
  { value: "french", label: "Français (French)" },
  { value: "spanish", label: "Español (Spanish)" },
  { value: "urdu", label: "اردو (Urdu)" },
  { value: "hindi", label: "हिन्दी (Hindi)" },
  { value: "malay", label: "Bahasa Melayu (Malay)" },
  { value: "turkish", label: "Türkçe (Turkish)" },
  { value: "indonesian", label: "Bahasa Indonesia" },
  { value: "chinese", label: "中文 (Chinese)" },
];

export default function LanguageSelector({ value, onChange }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium">Language:</span>
      </div>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-48 bg-card">
          <SelectValue placeholder="Select language" />
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.value} value={lang.value}>
              {lang.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}