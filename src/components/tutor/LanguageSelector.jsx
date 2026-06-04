import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe } from "lucide-react";

const languages = [
  { value: "english", label: "🇬🇧 English" },
  { value: "arabic", label: "🇸🇦 العربية (Arabic)" },
  { value: "french", label: "🇫🇷 Français (French)" },
  { value: "spanish", label: "🇪🇸 Español (Spanish)" },
  { value: "urdu", label: "🇵🇰 اردو (Urdu)" },
  { value: "hindi", label: "🇮🇳 हिन्दी (Hindi)" },
  { value: "malay", label: "🇲🇾 Bahasa Melayu (Malay)" },
  { value: "turkish", label: "🇹🇷 Türkçe (Turkish)" },
  { value: "indonesian", label: "🇮🇩 Bahasa Indonesia" },
  { value: "chinese", label: "🇨🇳 中文 (Chinese)" },
  { value: "portuguese", label: "🇵🇹 Português (Portuguese)" },
  { value: "russian", label: "🇷🇺 Русский (Russian)" },
  { value: "german", label: "🇩🇪 Deutsch (German)" },
  { value: "japanese", label: "🇯🇵 日本語 (Japanese)" },
  { value: "korean", label: "🇰🇷 한국어 (Korean)" },
  { value: "italian", label: "🇮🇹 Italiano (Italian)" },
  { value: "dutch", label: "🇳🇱 Nederlands (Dutch)" },
  { value: "persian", label: "🇮🇷 فارسی (Persian)" },
  { value: "bengali", label: "🇧🇩 বাংলা (Bengali)" },
  { value: "punjabi", label: "🇮🇳 ਪੰਜਾਬੀ (Punjabi)" },
  { value: "swahili", label: "🇰🇪 Kiswahili (Swahili)" },
  { value: "hausa", label: "🇳🇬 Hausa" },
  { value: "yoruba", label: "🇳🇬 Yorùbá (Yoruba)" },
  { value: "amharic", label: "🇪🇹 አማርኛ (Amharic)" },
  { value: "somali", label: "🇸🇴 Soomaali (Somali)" },
  { value: "tagalog", label: "🇵🇭 Filipino (Tagalog)" },
  { value: "vietnamese", label: "🇻🇳 Tiếng Việt (Vietnamese)" },
  { value: "thai", label: "🇹🇭 ภาษาไทย (Thai)" },
  { value: "greek", label: "🇬🇷 Ελληνικά (Greek)" },
  { value: "hebrew", label: "🇮🇱 עברית (Hebrew)" },
  { value: "polish", label: "🇵🇱 Polski (Polish)" },
  { value: "romanian", label: "🇷🇴 Română (Romanian)" },
  { value: "ukrainian", label: "🇺🇦 Українська (Ukrainian)" },
  { value: "czech", label: "🇨🇿 Čeština (Czech)" },
  { value: "hungarian", label: "🇭🇺 Magyar (Hungarian)" },
  { value: "swedish", label: "🇸🇪 Svenska (Swedish)" },
  { value: "norwegian", label: "🇳🇴 Norsk (Norwegian)" },
  { value: "danish", label: "🇩🇰 Dansk (Danish)" },
  { value: "finnish", label: "🇫🇮 Suomi (Finnish)" },
  { value: "nepali", label: "🇳🇵 नेपाली (Nepali)" },
  { value: "sinhala", label: "🇱🇰 සිංහල (Sinhala)" },
  { value: "burmese", label: "🇲🇲 မြန်မာဘာသာ (Burmese)" },
  { value: "khmer", label: "🇰🇭 ខ្មែរ (Khmer)" },
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