import type { Page } from "@/App";
import { useTheme } from "@/hooks/useTheme";
import { Home, Mail, Plus, Search, User } from "lucide-react";

interface Props {
  currentPage: Page;
  navigate: (p: Page) => void;
}

export default function BottomNav({ currentPage, navigate }: Props) {
  const { t } = useTheme();

  const items = [
    { key: "feed", icon: Home, label: t("home") },
    { key: "search", icon: Search, label: t("search") },
    { key: "create", icon: Plus, label: t("create"), special: true },
    { key: "inbox", icon: Mail, label: t("inbox") },
    { key: "profile", icon: User, label: t("profile") },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-card/95 backdrop-blur border-t border-border flex items-center justify-around px-2">
      {items.map(({ key, icon: Icon, label, special }) => (
        <button
          key={key}
          onClick={() => navigate(key as Page)}
          className={`flex flex-col items-center gap-0.5 flex-1 py-2 ${
            special
              ? ""
              : currentPage === key
                ? "text-foreground"
                : "text-muted-foreground"
          }`}
        >
          {special ? (
            <div className="brand-gradient rounded-xl p-2.5 -mt-4 shadow-lg">
              <Icon className="h-5 w-5 text-white" />
            </div>
          ) : (
            <Icon
              className={`h-5 w-5 ${currentPage === key ? "" : "opacity-60"}`}
            />
          )}
          {!special && <span className="text-[10px] font-medium">{label}</span>}
          {!special && currentPage === key && (
            <div className="absolute bottom-1 h-0.5 w-5 brand-gradient rounded-full" />
          )}
        </button>
      ))}
    </nav>
  );
}
