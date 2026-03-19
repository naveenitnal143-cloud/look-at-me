import BottomNav from "@/components/BottomNav";
import TopHeader from "@/components/TopHeader";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import AdminPage from "@/pages/AdminPage";
import CreatePage from "@/pages/CreatePage";
import FeedPage from "@/pages/FeedPage";
import InboxPage from "@/pages/InboxPage";
import LandingPage from "@/pages/LandingPage";
import ProfilePage from "@/pages/ProfilePage";
import SearchPage from "@/pages/SearchPage";
import SettingsPage from "@/pages/SettingsPage";
import { useEffect, useState } from "react";

export type Page =
  | "feed"
  | "search"
  | "create"
  | "inbox"
  | "profile"
  | "admin"
  | "settings"
  | "landing";

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [page, setPage] = useState<Page>("landing");
  const [profileId, setProfileId] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && page === "landing") setPage("feed");
  }, [isAuthenticated, page]);

  const navigate = (p: Page, id?: string) => {
    setPage(p);
    if (id) setProfileId(id);
  };

  if (!isAuthenticated) {
    return <LandingPage onLogin={() => setPage("feed")} />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <TopHeader navigate={navigate} currentPage={page} />
      <main className="flex-1 pb-16 pt-14">
        {page === "feed" && <FeedPage navigate={navigate} />}
        {page === "search" && <SearchPage navigate={navigate} />}
        {page === "create" && <CreatePage onDone={() => setPage("feed")} />}
        {page === "inbox" && <InboxPage />}
        {page === "profile" && (
          <ProfilePage userId={profileId} navigate={navigate} />
        )}
        {page === "admin" && <AdminPage />}
        {page === "settings" && <SettingsPage />}
      </main>
      <BottomNav currentPage={page} navigate={navigate} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}
