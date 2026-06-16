import { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown, Search, X, Grid3X3 } from "lucide-react";

const languages = [
  { value: "english", label: "🇬🇧 English" },
  { value: "arabic", label: "🇸🇦 Arabic (العربية)" },
  { value: "french", label: "🇫🇷 French (Français)" },
  { value: "spanish", label: "🇪🇸 Spanish (Español)" },
  { value: "urdu", label: "🇵🇰 Urdu (اردو)" },
  { value: "hindi", label: "🇮🇳 Hindi (हिन्दी)" },
  { value: "malay", label: "🇲🇾 Malay (Bahasa Melayu)" },
  { value: "turkish", label: "🇹🇷 Turkish (Türkçe)" },
  { value: "indonesian", label: "🇮🇩 Indonesian (Bahasa Indonesia)" },
  { value: "chinese_simplified", label: "🇨🇳 Chinese Simplified (简体中文)" },
  { value: "chinese_traditional", label: "🇹🇼 Chinese Traditional (繁體中文)" },
  { value: "portuguese", label: "🇵🇹 Portuguese (Português)" },
  { value: "portuguese_brazil", label: "🇧🇷 Portuguese Brazilian (Português BR)" },
  { value: "russian", label: "🇷🇺 Russian (Русский)" },
  { value: "german", label: "🇩🇪 German (Deutsch)" },
  { value: "japanese", label: "🇯🇵 Japanese (日本語)" },
  { value: "korean", label: "🇰🇷 Korean (한국어)" },
  { value: "italian", label: "🇮🇹 Italian (Italiano)" },
  { value: "dutch", label: "🇳🇱 Dutch (Nederlands)" },
  { value: "persian", label: "🇮🇷 Persian (فارسی)" },
  { value: "bengali", label: "🇧🇩 Bengali (বাংলা)" },
  { value: "punjabi", label: "🇮🇳 Punjabi (ਪੰਜਾਬੀ)" },
  { value: "swahili", label: "🇰🇪 Swahili (Kiswahili)" },
  { value: "hausa", label: "🇳🇬 Hausa" },
  { value: "yoruba", label: "🇳🇬 Yoruba (Yorùbá)" },
  { value: "amharic", label: "🇪🇹 Amharic (አማርኛ)" },
  { value: "somali", label: "🇸🇴 Somali (Soomaali)" },
  { value: "tagalog", label: "🇵🇭 Filipino / Tagalog" },
  { value: "vietnamese", label: "🇻🇳 Vietnamese (Tiếng Việt)" },
  { value: "thai", label: "🇹🇭 Thai (ภาษาไทย)" },
  { value: "greek", label: "🇬🇷 Greek (Ελληνικά)" },
  { value: "hebrew", label: "🇮🇱 Hebrew (עברית)" },
  { value: "polish", label: "🇵🇱 Polish (Polski)" },
  { value: "romanian", label: "🇷🇴 Romanian (Română)" },
  { value: "ukrainian", label: "🇺🇦 Ukrainian (Українська)" },
  { value: "czech", label: "🇨🇿 Czech (Čeština)" },
  { value: "hungarian", label: "🇭🇺 Hungarian (Magyar)" },
  { value: "swedish", label: "🇸🇪 Swedish (Svenska)" },
  { value: "norwegian", label: "🇳🇴 Norwegian (Norsk)" },
  { value: "danish", label: "🇩🇰 Danish (Dansk)" },
  { value: "finnish", label: "🇫🇮 Finnish (Suomi)" },
  { value: "nepali", label: "🇳🇵 Nepali (नेपाली)" },
  { value: "sinhala", label: "🇱🇰 Sinhala (සිංහල)" },
  { value: "burmese", label: "🇲🇲 Burmese (မြန်မာဘာသာ)" },
  { value: "khmer", label: "🇰🇭 Khmer (ខ្មែរ)" },
  { value: "lao", label: "🇱🇦 Lao (ລາວ)" },
  { value: "mongolian", label: "🇲🇳 Mongolian (Монгол)" },
  { value: "kazakh", label: "🇰🇿 Kazakh (Қазақша)" },
  { value: "uzbek", label: "🇺🇿 Uzbek (Oʻzbek)" },
  { value: "azerbaijani", label: "🇦🇿 Azerbaijani (Azərbaycan)" },
  { value: "georgian", label: "🇬🇪 Georgian (ქართული)" },
  { value: "armenian", label: "🇦🇲 Armenian (Հայերեն)" },
  { value: "albanian", label: "🇦🇱 Albanian (Shqip)" },
  { value: "serbian", label: "🇷🇸 Serbian (Srpski)" },
  { value: "croatian", label: "🇭🇷 Croatian (Hrvatski)" },
  { value: "bosnian", label: "🇧🇦 Bosnian (Bosanski)" },
  { value: "slovenian", label: "🇸🇮 Slovenian (Slovenščina)" },
  { value: "slovak", label: "🇸🇰 Slovak (Slovenčina)" },
  { value: "bulgarian", label: "🇧🇬 Bulgarian (Български)" },
  { value: "macedonian", label: "🇲🇰 Macedonian (Македонски)" },
  { value: "lithuanian", label: "🇱🇹 Lithuanian (Lietuvių)" },
  { value: "latvian", label: "🇱🇻 Latvian (Latviešu)" },
  { value: "estonian", label: "🇪🇪 Estonian (Eesti)" },
  { value: "maltese", label: "🇲🇹 Maltese (Malti)" },
  { value: "icelandic", label: "🇮🇸 Icelandic (Íslenska)" },
  { value: "irish", label: "🇮🇪 Irish (Gaeilge)" },
  { value: "welsh", label: "🏴󠁧󠁢󠁷󠁬󠁳󠁿 Welsh (Cymraeg)" },
  { value: "scots_gaelic", label: "🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scottish Gaelic (Gàidhlig)" },
  { value: "catalan", label: "🇪🇸 Catalan (Català)" },
  { value: "basque", label: "🇪🇸 Basque (Euskara)" },
  { value: "galician", label: "🇪🇸 Galician (Galego)" },
  { value: "afrikaans", label: "🇿🇦 Afrikaans" },
  { value: "zulu", label: "🇿🇦 Zulu (isiZulu)" },
  { value: "xhosa", label: "🇿🇦 Xhosa (isiXhosa)" },
  { value: "sotho", label: "🇿🇦 Sotho (Sesotho)" },
  { value: "tswana", label: "🇧🇼 Tswana (Setswana)" },
  { value: "shona", label: "🇿🇼 Shona (chiShona)" },
  { value: "igbo", label: "🇳🇬 Igbo" },
  { value: "wolof", label: "🇸🇳 Wolof" },
  { value: "fula", label: "🌍 Fula (Fulfulde)" },
  { value: "tigrinya", label: "🇪🇷 Tigrinya (ትግርኛ)" },
  { value: "oromo", label: "🇪🇹 Oromo (Oromoo)" },
  { value: "kinyarwanda", label: "🇷🇼 Kinyarwanda" },
  { value: "kirundi", label: "🇧🇮 Kirundi" },
  { value: "luganda", label: "🇺🇬 Luganda" },
  { value: "lingala", label: "🇨🇩 Lingala" },
  { value: "kikongo", label: "🇨🇬 Kikongo" },
  { value: "bambara", label: "🇲🇱 Bambara (Bamanankan)" },
  { value: "twi", label: "🇬🇭 Twi (Akan)" },
  { value: "ewe", label: "🇹🇬 Ewe (Eʋegbe)" },
  { value: "mooré", label: "🇧🇫 Mooré (Mòoré)" },
  { value: "dinka", label: "🇸🇸 Dinka" },
  { value: "nuer", label: "🇸🇸 Nuer" },
  { value: "gujarati", label: "🇮🇳 Gujarati (ગુજરાતી)" },
  { value: "marathi", label: "🇮🇳 Marathi (मराठी)" },
  { value: "tamil", label: "🇮🇳 Tamil (தமிழ்)" },
  { value: "telugu", label: "🇮🇳 Telugu (తెలుగు)" },
  { value: "kannada", label: "🇮🇳 Kannada (ಕನ್ನಡ)" },
  { value: "malayalam", label: "🇮🇳 Malayalam (മലയാളം)" },
  { value: "odia", label: "🇮🇳 Odia (ଓଡ଼ିଆ)" },
  { value: "assamese", label: "🇮🇳 Assamese (অসমীয়া)" },
  { value: "maithili", label: "🇮🇳 Maithili (मैथिली)" },
  { value: "santali", label: "🇮🇳 Santali" },
  { value: "kashmiri", label: "🇮🇳 Kashmiri (کٲشُر)" },
  { value: "sindhi", label: "🇵🇰 Sindhi (سنڌي)" },
  { value: "pashto", label: "🇦🇫 Pashto (پښتو)" },
  { value: "dari", label: "🇦🇫 Dari (دری)" },
  { value: "balochi", label: "🇵🇰 Balochi (بلوچی)" },
  { value: "tajik", label: "🇹🇯 Tajik (Тоҷикӣ)" },
  { value: "kyrgyz", label: "🇰🇬 Kyrgyz (Кыргызча)" },
  { value: "turkmen", label: "🇹🇲 Turkmen (Türkmen)" },
  { value: "uyghur", label: "🇨🇳 Uyghur (ئۇيغۇرچە)" },
  { value: "tibetan", label: "🇨🇳 Tibetan (བོད་སྐད།)" },
  { value: "dzongkha", label: "🇧🇹 Dzongkha (རྫོང་ཁ)" },
  { value: "sinhalese", label: "🇱🇰 Sinhalese (සිංහල)" },
  { value: "dhivehi", label: "🇲🇻 Dhivehi (ދިވެހި)" },
  { value: "javanese", label: "🇮🇩 Javanese (Basa Jawa)" },
  { value: "sundanese", label: "🇮🇩 Sundanese (Basa Sunda)" },
  { value: "balinese", label: "🇮🇩 Balinese (Basa Bali)" },
  { value: "batak", label: "🇮🇩 Batak" },
  { value: "minangkabau", label: "🇮🇩 Minangkabau (Baso Minang)" },
  { value: "acehnese", label: "🇮🇩 Acehnese (Bahsa Acèh)" },
  { value: "cebuano", label: "🇵🇭 Cebuano" },
  { value: "ilocano", label: "🇵🇭 Ilocano" },
  { value: "hiligaynon", label: "🇵🇭 Hiligaynon" },
  { value: "waray", label: "🇵🇭 Waray" },
  { value: "kapampangan", label: "🇵🇭 Kapampangan" },
  { value: "pangasinan", label: "🇵🇭 Pangasinan" },
  { value: "tetum", label: "🇹🇱 Tetum" },
  { value: "tok_pisin", label: "🇵🇬 Tok Pisin" },
  { value: "fijian", label: "🇫🇯 Fijian (Vosa Vakaviti)" },
  { value: "samoan", label: "🇼🇸 Samoan (Gagana Samoa)" },
  { value: "tongan", label: "🇹🇴 Tongan (Lea Fakatonga)" },
  { value: "hawaiian", label: "🇺🇸 Hawaiian (ʻŌlelo Hawaiʻi)" },
  { value: "maori", label: "🇳🇿 Māori (Te Reo Māori)" },
  { value: "tahitian", label: "🇵🇫 Tahitian (Reo Tahiti)" },
  { value: "chamorro", label: "🇬🇺 Chamorro" },
  { value: "marshallese", label: "🇲🇭 Marshallese (Kajin Majōl)" },
  { value: "palauan", label: "🇵🇼 Palauan" },
  { value: "chuukese", label: "🇫🇲 Chuukese" },
  { value: "nahuatl", label: "🇲🇽 Nahuatl" },
  { value: "quechua", label: "🇵🇪 Quechua" },
  { value: "aymara", label: "🇧🇴 Aymara" },
  { value: "guarani", label: "🇵🇾 Guaraní" },
  { value: "maya_yucatec", label: "🇲🇽 Yucatec Maya" },
  { value: "zapotec", label: "🇲🇽 Zapotec" },
  { value: "mixtec", label: "🇲🇽 Mixtec" },
  { value: "cherokee", label: "🇺🇸 Cherokee (ᏣᎳᎩ)" },
  { value: "navajo", label: "🇺🇸 Navajo (Diné Bizaad)" },
  { value: "inuktitut", label: "🇨🇦 Inuktitut" },
  { value: "cree", label: "🇨🇦 Cree" },
  { value: "ojibwe", label: "🇨🇦 Ojibwe (Anishinaabemowin)" },
  { value: "lakota", label: "🇺🇸 Lakota" },
  { value: "latin", label: "🏛️ Latin (Latina)" },
  { value: "esperanto", label: "🌍 Esperanto" },
  { value: "interlingua", label: "🌍 Interlingua" },
  { value: "ido", label: "🌍 Ido" },
  { value: "afrikaans_2", label: "🇿🇦 Afrikaans (Cape)" },
  { value: "luxembourgish", label: "🇱🇺 Luxembourgish (Lëtzebuergesch)" },
  { value: "frisian", label: "🇳🇱 Frisian (Frysk)" },
  { value: "breton", label: "🇫🇷 Breton (Brezhoneg)" },
  { value: "occitan", label: "🇫🇷 Occitan" },
  { value: "corsican", label: "🇫🇷 Corsican (Corsu)" },
  { value: "sardinian", label: "🇮🇹 Sardinian (Sardu)" },
  { value: "sicilian", label: "🇮🇹 Sicilian (Sicilianu)" },
  { value: "neapolitan", label: "🇮🇹 Neapolitan (Napoletano)" },
  { value: "venetian", label: "🇮🇹 Venetian (Vèneto)" },
  { value: "romansh", label: "🇨🇭 Romansh (Rumantsch)" },
  { value: "faroese", label: "🇫🇴 Faroese (Føroyskt)" },
  { value: "belarusian", label: "🇧🇾 Belarusian (Беларуская)" },
  { value: "moldovan", label: "🇲🇩 Moldovan (Moldovenească)" },
  { value: "gagauz", label: "🇲🇩 Gagauz (Gagauz dili)" },
  { value: "chechen", label: "🇷🇺 Chechen (Нохчийн)" },
  { value: "ingush", label: "🇷🇺 Ingush (ГӀалгӀай)" },
  { value: "ossetian", label: "🇷🇺 Ossetian (Ирон æвзаг)" },
  { value: "abkhazian", label: "🇬🇪 Abkhazian (Аԥсуа)" },
  { value: "abaza", label: "🇷🇺 Abaza (Абаза)" },
  { value: "kabardian", label: "🇷🇺 Kabardian (Адыгэбзэ)" },
  { value: "avar", label: "🇷🇺 Avar (Авар мацӀ)" },
  { value: "lezgian", label: "🇷🇺 Lezgian (Лезги чӏал)" },
  { value: "dargin", label: "🇷🇺 Dargin (Дарган мез)" },
  { value: "lak", label: "🇷🇺 Lak (Лак мазул)" },
  { value: "tabasaran", label: "🇷🇺 Tabasaran (Табасаран чIал)" },
  { value: "kalmyk", label: "🇷🇺 Kalmyk (Хальмг келн)" },
  { value: "bashkir", label: "🇷🇺 Bashkir (Башҡорт теле)" },
  { value: "tatar", label: "🇷🇺 Tatar (Татар теле)" },
  { value: "chuvash", label: "🇷🇺 Chuvash (Чӑваш чӗлхи)" },
  { value: "udmurt", label: "🇷🇺 Udmurt (Удмурт кыл)" },
  { value: "mari", label: "🇷🇺 Mari (Марий йылме)" },
  { value: "komi", label: "🇷🇺 Komi (Коми кыв)" },
  { value: "nenets", label: "🇷🇺 Nenets (Ненэцяʼ вада)" },
  { value: "yakut", label: "🇷🇺 Yakut / Sakha (Саха тыла)" },
  { value: "buryat", label: "🇷🇺 Buryat (Буряад хэлэн)" },
  { value: "tuvan", label: "🇷🇺 Tuvan (Тыва дыл)" },
  { value: "altai", label: "🇷🇺 Altai (Алтай тил)" },
  { value: "hakka", label: "🇨🇳 Hakka (客家話)" },
  { value: "cantonese", label: "🇭🇰 Cantonese (粵語)" },
  { value: "wu_shanghainese", label: "🇨🇳 Wu / Shanghainese (吴语)" },
  { value: "min_nan", label: "🇨🇳 Min Nan / Hokkien (閩南語)" },
  { value: "gan", label: "🇨🇳 Gan Chinese (贛語)" },
  { value: "xiang", label: "🇨🇳 Xiang Chinese (湘语)" },
  { value: "tibetan_amdo", label: "🇨🇳 Amdo Tibetan (ཨམདོ་སྐད།)" },
  { value: "bai", label: "🇨🇳 Bai (白语)" },
  { value: "yi", label: "🇨🇳 Yi (ꆈꌠꉙ)" },
  { value: "zhuang", label: "🇨🇳 Zhuang (Cuengh)" },
  { value: "miao_hmong", label: "🇨🇳 Miao / Hmong (Hmoob)" },
  { value: "dong", label: "🇨🇳 Dong (侗语)" },
  { value: "li", label: "🇨🇳 Li (黎语)" },
  { value: "manchu", label: "🇨🇳 Manchu (ᠮᠠᠨᠵᡠ ᡤᡳᠰᡠᠨ)" },
  { value: "mongolian_inner", label: "🇨🇳 Inner Mongolian (монгол хэл)" },
  { value: "koreanic_jeju", label: "🇰🇷 Jeju (제주어)" },
  { value: "okinawan", label: "🇯🇵 Okinawan (ウチナーグチ)" },
  { value: "ainu", label: "🇯🇵 Ainu (アイヌ語)" },
  { value: "khasi", label: "🇮🇳 Khasi" },
  { value: "mizo", label: "🇮🇳 Mizo (Mizo ṭawng)" },
  { value: "manipuri", label: "🇮🇳 Manipuri / Meitei (মৈতৈলোন্)" },
  { value: "bodo", label: "🇮🇳 Bodo (बड़ो)" },
  { value: "dogri", label: "🇮🇳 Dogri (डोगरी)" },
  { value: "konkani", label: "🇮🇳 Konkani (कोंकणी)" },
  { value: "tulu", label: "🇮🇳 Tulu (ತುಳು)" },
  { value: "kodava", label: "🇮🇳 Kodava (ಕೊಡವ ತಕ್ಕ್)" },
  { value: "kumaoni", label: "🇮🇳 Kumaoni (कुमाऊँनी)" },
  { value: "garhwali", label: "🇮🇳 Garhwali (गढ़वाली)" },
  { value: "bhojpuri", label: "🇮🇳 Bhojpuri (भोजपुरी)" },
  { value: "magahi", label: "🇮🇳 Magahi (मगही)" },
  { value: "angika", label: "🇮🇳 Angika (अंगिका)" },
  { value: "awadhi", label: "🇮🇳 Awadhi (अवधी)" },
  { value: "chhattisgarhi", label: "🇮🇳 Chhattisgarhi (छत्तीसगढ़ी)" },
  { value: "haryanvi", label: "🇮🇳 Haryanvi (हरियाणवी)" },
  { value: "rajasthani", label: "🇮🇳 Rajasthani (राजस्थानी)" },
  { value: "pahari", label: "🇮🇳 Pahari (पहाड़ी)" },
  { value: "kurukh", label: "🇮🇳 Kurukh (कुड़ुख)" },
  { value: "gondi", label: "🇮🇳 Gondi (गोंडी)" },
  { value: "thamil_eelam", label: "🇱🇰 Sri Lankan Tamil (ஈழத் தமிழ்)" },
  { value: "sinhala_upcountry", label: "🇱🇰 Upcountry Sinhala" },
  { value: "arabic_egyptian", label: "🇪🇬 Arabic Egyptian (عامية مصرية)" },
  { value: "arabic_levantine", label: "🇸🇾 Arabic Levantine (شامي)" },
  { value: "arabic_gulf", label: "🇸🇦 Arabic Gulf (خليجي)" },
  { value: "arabic_maghrebi", label: "🇲🇦 Arabic Maghrebi (دارجة)" },
  { value: "arabic_iraqi", label: "🇮🇶 Arabic Iraqi (عراقي)" },
  { value: "arabic_sudanese", label: "🇸🇩 Arabic Sudanese (عربي سوداني)" },
  { value: "arabic_yemeni", label: "🇾🇪 Arabic Yemeni (عربي يمني)" },
  { value: "arabic_libyan", label: "🇱🇾 Arabic Libyan (ليبي)" },
  { value: "arabic_tunisian", label: "🇹🇳 Arabic Tunisian (تونسي)" },
  { value: "arabic_algerian", label: "🇩🇿 Arabic Algerian (دزيري)" },
  { value: "moroccan_arabic", label: "🇲🇦 Moroccan Darija (الدارجة)" },
  { value: "classical_arabic", label: "📖 Classical Arabic (الفصحى)" },
  { value: "maltese_arabic", label: "🇲🇹 Maltese Arabic (Malti)" },
  { value: "kurdish_kurmanji", label: "🇹🇷 Kurdish Kurmanji (Kurmancî)" },
  { value: "kurdish_sorani", label: "🇮🇶 Kurdish Sorani (کوردی)" },
  { value: "zazaki", label: "🇹🇷 Zazaki (Zazaca)" },
  { value: "zazaki_dimli", label: "🇹🇷 Zazaki Dimli" },
  { value: "assyrian", label: "🇮🇶 Assyrian Neo-Aramaic (ܣܘܪܝܬ)" },
  { value: "aramaic", label: "🏛️ Classical Aramaic (ܐܪܡܝܐ)" },
  { value: "syriac", label: "🇸🇾 Syriac (ܣܘܪܝܝܐ)" },
  { value: "coptic", label: "🇪🇬 Coptic (ⲙⲉⲧⲣⲉⲙⲛ̀ⲭⲏⲙⲓ)" },
  { value: "berber_tamazight", label: "🇲🇦 Tamazight (ⵜⴰⵎⴰⵣⵉⵖⵜ)" },
  { value: "berber_kabyle", label: "🇩🇿 Kabyle (Taqbaylit)" },
  { value: "berber_tashelhit", label: "🇲🇦 Tashelhit (Tashlhiyt)" },
  { value: "tigre", label: "🇪🇷 Tigre (ትግረ)" },
  { value: "afar", label: "🇪🇹 Afar (Qafaraf)" },
  { value: "sidamo", label: "🇪🇹 Sidamo (Sidaamu Afoo)" },
  { value: "wolayta", label: "🇪🇹 Wolayta (Wolayttatto)" },
  { value: "hadiyya", label: "🇪🇹 Hadiyya" },
  { value: "gurage", label: "🇪🇹 Gurage (ኩሪናኛ)" },
  { value: "beja", label: "🇸🇩 Beja (Bidhaawyeet)" },
  { value: "nuer_2", label: "🇸🇸 Nuer (Thok Naath)" },
  { value: "acholi", label: "🇺🇬 Acholi (Lwo)" },
  { value: "langi", label: "🇹🇿 Langi (Kilangi)" },
  { value: "chaga", label: "🇹🇿 Chaga (Kichaga)" },
  { value: "sukuma", label: "🇹🇿 Sukuma (Kisukuma)" },
  { value: "nyamwezi", label: "🇹🇿 Nyamwezi (Kinyamwezi)" },
  { value: "makonde", label: "🇹🇿 Makonde (Chimakonde)" },
  { value: "yao", label: "🇲🇿 Yao (Chiyao)" },
  { value: "sena", label: "🇲🇿 Sena (Cisena)" },
  { value: "lomwe", label: "🇲🇿 Lomwe (Elomwe)" },
  { value: "tonga_zambia", label: "🇿🇲 Tonga (Chitonga)" },
  { value: "bemba", label: "🇿🇲 Bemba (Chibemba)" },
  { value: "kaonde", label: "🇿🇲 Kaonde" },
  { value: "luvale", label: "🇿🇲 Luvale (Chiluvale)" },
  { value: "lozi", label: "🇿🇲 Lozi (Silozi)" },
  { value: "ndebele", label: "🇿🇼 Ndebele (isiNdebele)" },
  { value: "venda", label: "🇿🇦 Venda (Tshivenḓa)" },
  { value: "tsonga", label: "🇿🇦 Tsonga (Xitsonga)" },
  { value: "swati", label: "🇸🇿 Swati (siSwati)" },
  { value: "kongo", label: "🇨🇩 Kongo (Kikongo)" },
  { value: "luba_katanga", label: "🇨🇩 Luba-Katanga (Kiluba)" },
  { value: "mongo", label: "🇨🇩 Mongo (Lomongo)" },
  { value: "rwanda_kirundi", label: "🇷🇼 Rwanda-Kirundi" },
  { value: "makua", label: "🇲🇿 Makua (Emakhuwa)" },
  { value: "fang", label: "🇬🇦 Fang (Fang)" },
  { value: "beti", label: "🇨🇲 Beti (Beti)" },
  { value: "duala", label: "🇨🇲 Duala (Duala)" },
  { value: "fulfulde_adamawa", label: "🇨🇲 Fulfulde Adamawa" },
  { value: "kanuri", label: "🇳🇬 Kanuri" },
  { value: "tiv", label: "🇳🇬 Tiv" },
  { value: "efik", label: "🇳🇬 Efik" },
  { value: "idoma", label: "🇳🇬 Idoma" },
  { value: "edo", label: "🇳🇬 Edo (Ẹdo)" },
  { value: "urhobo", label: "🇳🇬 Urhobo" },
  { value: "itsekiri", label: "🇳🇬 Itsekiri" },
  { value: "ijaw", label: "🇳🇬 Ijaw (Izon)" },
  { value: "ogoni", label: "🇳🇬 Ogoni (Khana)" },
  { value: "nupe", label: "🇳🇬 Nupe" },
  { value: "gbari", label: "🇳🇬 Gbari (Gwari)" },
  { value: "birom", label: "🇳🇬 Birom" },
  { value: "jukun", label: "🇳🇬 Jukun" },
  { value: "ibibio", label: "🇳🇬 Ibibio" },
  { value: "fulani_nigeria", label: "🇳🇬 Fulani (Fula Nigeria)" },
  { value: "zarma", label: "🇳🇪 Zarma (Zarma-Songhai)" },
  { value: "tamasheq", label: "🇲🇱 Tamasheq (Tuareg)" },
  { value: "soninke", label: "🇸🇳 Soninke (Soninke)" },
  { value: "mandinka", label: "🇬🇲 Mandinka (Mandinka)" },
  { value: "serer", label: "🇸🇳 Serer (Seereer)" },
  { value: "diola", label: "🇸🇳 Diola (Jola)" },
  { value: "temne", label: "🇸🇱 Temne (Timne)" },
  { value: "mende", label: "🇸🇱 Mende" },
  { value: "krio", label: "🇸🇱 Krio" },
  { value: "vai", label: "🇱🇷 Vai" },
  { value: "grebo", label: "🇱🇷 Grebo" },
  { value: "bassa", label: "🇱🇷 Bassa (Bassa Vah)" },
  { value: "dan", label: "🇨🇮 Dan (Yakuba)" },
  { value: "baoule", label: "🇨🇮 Baoulé" },
  { value: "agni", label: "🇨🇮 Agni" },
  { value: "dioula", label: "🇨🇮 Dioula (Jula)" },
  { value: "mooré_2", label: "🇬🇭 Dagbani" },
  { value: "konkomba", label: "🇬🇭 Konkomba (Bikpakpaam)" },
  { value: "kasem", label: "🇬🇭 Kasem" },
  { value: "nzema", label: "🇬🇭 Nzema" },
  { value: "fante", label: "🇬🇭 Fante (Mfantse)" },
  { value: "ga", label: "🇬🇭 Ga" },
  { value: "dangme", label: "🇬🇭 Dangme (Adangme)" },
  { value: "gen", label: "🇹🇬 Gen (Mina)" },
  { value: "fon", label: "🇧🇯 Fon (Fon gbé)" },
  { value: "bariba", label: "🇧🇯 Bariba (Baatonum)" },
  { value: "dendi", label: "🇧🇯 Dendi" },
  { value: "bissa", label: "🇧🇫 Bissa" },
  { value: "gurene", label: "🇬🇭 Gurene (Frafra)" },
  { value: "nankani", label: "🇬🇭 Nankani" },
  { value: "sandawe", label: "🇹🇿 Sandawe" },
  { value: "hadza", label: "🇹🇿 Hadza" },
  { value: "malagasy", label: "🇲🇬 Malagasy" },
  { value: "comorian", label: "🇰🇲 Comorian (Shikomori)" },
  { value: "seychellois_creole", label: "🇸🇨 Seychellois Creole (Seselwa)" },
  { value: "mauritian_creole", label: "🇲🇺 Mauritian Creole (Kreol Morisien)" },
  { value: "haitian_creole", label: "🇭🇹 Haitian Creole (Kreyòl ayisyen)" },
  { value: "papiamentu", label: "🇨🇼 Papiamentu" },
  { value: "sranan", label: "🇸🇷 Sranan Tongo" },
  { value: "saramaccan", label: "🇸🇷 Saramaccan" },
  { value: "bislama", label: "🇻🇺 Bislama" },
  { value: "pijin", label: "🇸🇧 Pijin" },
  { value: "nauruan", label: "🇳🇷 Nauruan (Dorerin Naoero)" },
  { value: "kiribati", label: "🇰🇮 Kiribati (Te Taetae ni Kiribati)" },
  { value: "tuvaluan", label: "🇹🇻 Tuvaluan" },
];

export default function LanguageSelector({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const selected = languages.find((l) => l.value === value);

  const filtered = search.trim()
    ? languages.filter((l) => l.label.toLowerCase().includes(search.toLowerCase()))
    : languages;

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (lang) => {
    onChange(lang.value);
    setOpen(false);
    setSearch("");
  };

  return (
    <div className="flex items-center gap-3" ref={containerRef}>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium hidden sm:block">Language:</span>
      </div>

      <div className="relative">
        {/* Trigger */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 h-9 px-3 rounded-md border border-input bg-card text-sm hover:bg-muted/50 transition-colors min-w-[140px] max-w-[180px]"
        >
          <span className="flex-1 text-left truncate">
            {selected ? selected.label : "Select language"}
          </span>
          <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute z-50 top-10 left-0 w-72 bg-popover border border-border rounded-xl shadow-xl overflow-hidden">
            {/* Search input */}
            <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
              <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search languages..."
                className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
              />
              {search && (
                <button onClick={() => setSearch("")}>
                  <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-60 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">No languages found</div>
              ) : (
                filtered.map((lang) => (
                  <button
                    key={lang.value}
                    onClick={() => handleSelect(lang)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors truncate
                      ${lang.value === value ? "bg-primary/10 text-primary font-medium" : "text-foreground"}`}
                  >
                    {lang.label}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}