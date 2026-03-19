import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

type Theme = "dark" | "light";
type Language = "en" | "hi";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Language, string>> = {
  hello: { en: "Hello", hi: "नमस्ते" },
  home: { en: "Home", hi: "होम" },
  search: { en: "Search", hi: "खोज" },
  create: { en: "Create", hi: "बनाएं" },
  inbox: { en: "Inbox", hi: "इनबॉक्स" },
  profile: { en: "Profile", hi: "प्रोफाइल" },
  trending: { en: "Trending", hi: "ट्रेंडिंग" },
  forYou: { en: "For You", hi: "आपके लिए" },
  following: { en: "Following", hi: "फॉलोइंग" },
  explore: { en: "Explore", hi: "एक्सप्लोर" },
  like: { en: "Like", hi: "लाइक" },
  comment: { en: "Comment", hi: "कमेंट" },
  share: { en: "Share", hi: "शेयर" },
  save: { en: "Save", hi: "सेव" },
  follow: { en: "Follow", hi: "फॉलो" },
  unfollow: { en: "Unfollow", hi: "अनफॉलो" },
  upload: { en: "Upload Video", hi: "वीडियो अपलोड" },
  notifications: { en: "Notifications", hi: "सूचनाएं" },
  settings: { en: "Settings", hi: "सेटिंग्स" },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  const toggleLanguage = () => setLanguage((l) => (l === "en" ? "hi" : "en"));
  const t = (key: string) => translations[key]?.[language] ?? key;

  return (
    <ThemeContext.Provider
      value={{ theme, toggleTheme, language, toggleLanguage, t }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
