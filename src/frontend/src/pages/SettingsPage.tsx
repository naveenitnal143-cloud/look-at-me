import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import {
  Bell,
  ChevronRight,
  Globe,
  Lock,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";

export default function SettingsPage() {
  const { theme, toggleTheme, language, toggleLanguage, t } = useTheme();
  const { profile, logout } = useAuth();

  const sections = [
    {
      title: "Appearance",
      items: [
        {
          icon: theme === "dark" ? Moon : Sun,
          label: "Dark Mode",
          right: (
            <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
          ),
        },
        {
          icon: Globe,
          label: `Language: ${language === "en" ? "English" : "हिन्दी"}`,
          right: (
            <button
              onClick={toggleLanguage}
              className="text-xs brand-gradient-text font-semibold"
            >
              {language === "en" ? "हिन्दी में बदलें" : "Switch to English"}
            </button>
          ),
        },
      ],
    },
    {
      title: "Notifications",
      items: [
        {
          icon: Bell,
          label: "Push Notifications",
          right: <Switch defaultChecked />,
        },
        { icon: Bell, label: "Email Alerts", right: <Switch /> },
      ],
    },
    {
      title: "Privacy & Security",
      items: [
        { icon: Lock, label: "Private Account", right: <Switch /> },
        {
          icon: Lock,
          label: "Two-Factor Auth",
          right: <ChevronRight className="h-4 w-4 text-muted-foreground" />,
        },
      ],
    },
  ];

  return (
    <div className="max-w-xl mx-auto px-4 py-4">
      <h1 className="text-xl font-bold mb-1">{t("settings")}</h1>
      {profile && (
        <p className="text-muted-foreground text-sm mb-6">
          {language === "hi"
            ? `नमस्ते, @${profile.username}!`
            : `Hello, @${profile.username}!`}
        </p>
      )}

      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.title}>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              {section.title}
            </h2>
            <div className="bg-card rounded-xl border border-border divide-y divide-border">
              {section.items.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between p-4"
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{item.label}</span>
                  </div>
                  {item.right}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Account
          </h2>
          <div className="bg-card rounded-xl border border-border">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl"
              onClick={logout}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Look@Me v1.0 • Made with ❤️ in India
        </p>
      </div>
    </div>
  );
}
