import type { Page } from "@/App";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { Bell, Moon, Search, Settings, Shield, Sun } from "lucide-react";
import { useState } from "react";

interface Props {
  navigate: (p: Page) => void;
  currentPage: Page;
}

export default function TopHeader({ navigate, currentPage }: Props) {
  const { theme, toggleTheme, language, toggleLanguage, t } = useTheme();
  const { profile, isAdmin } = useAuth();
  const [searchQ, setSearchQ] = useState("");

  const tabs = [
    { key: "feed", label: t("forYou") },
    { key: "search", label: t("explore") },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQ.trim()) navigate("search");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-card/95 backdrop-blur border-b border-border flex items-center px-4 gap-3">
      {/* Logo */}
      <button
        type="button"
        onClick={() => navigate("feed")}
        className="flex-shrink-0"
      >
        <span className="brand-gradient-text font-bold text-xl tracking-tight">
          Look@Me
        </span>
      </button>

      {/* Nav tabs */}
      <nav className="hidden md:flex items-center gap-1 ml-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => navigate(tab.key as Page)}
            className={`px-3 py-1 text-sm font-medium rounded-full transition-all ${
              currentPage === tab.key
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            {currentPage === tab.key && (
              <div className="h-0.5 mt-0.5 brand-gradient rounded-full" />
            )}
          </button>
        ))}
      </nav>

      {/* Search */}
      <form
        onSubmit={handleSearch}
        className="flex-1 max-w-md ml-auto hidden sm:flex"
      >
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Search videos, creators, hashtags…"
            className="pl-9 bg-muted border-border text-sm h-8"
          />
        </div>
      </form>

      {/* Right icons */}
      <div className="flex items-center gap-1 ml-auto sm:ml-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleLanguage}
          className="h-8 w-8 text-xs font-bold"
        >
          {language === "en" ? "हि" : "EN"}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-8 w-8"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("inbox")}
          className="h-8 w-8 relative"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
        </Button>
        {isAdmin && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("admin")}
            className="h-8 w-8"
          >
            <Shield className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("settings")}
          className="h-8 w-8"
        >
          <Settings className="h-4 w-4" />
        </Button>
        <button type="button" onClick={() => navigate("profile")}>
          <Avatar className="h-7 w-7">
            {profile?.avatarBlobKey && (
              <AvatarImage src={profile.avatarBlobKey.getDirectURL()} />
            )}
            <AvatarFallback className="brand-gradient text-white text-xs">
              {profile?.username?.[0]?.toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
        </button>
      </div>
    </header>
  );
}
