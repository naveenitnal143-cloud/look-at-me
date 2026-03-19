import type { PartialUserProfile } from "@/backend";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBackend } from "@/hooks/useBackend";
import type { Principal } from "@icp-sdk/core/principal";
import {
  Ban,
  Flag,
  Shield,
  Trash2,
  TrendingUp,
  Users,
  Video,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AdminPage() {
  const { backend } = useBackend();
  const [analytics, setAnalytics] = useState({
    totalUsers: 0n,
    totalVideos: 0n,
    totalReports: 0n,
  });
  const [users, setUsers] = useState<Array<[Principal, PartialUserProfile]>>(
    [],
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!backend) return;
    const load = async () => {
      setLoading(true);
      try {
        const [a, u] = await Promise.all([
          backend.getAnalytics(),
          backend.getAllUsers(),
        ]);
        setAnalytics(a);
        setUsers(u);
      } catch {
        toast.error("Failed to load admin data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [backend]);

  const handleBan = async (principal: Principal) => {
    if (!backend) return;
    try {
      await backend.banUser(principal);
      toast.success("User banned");
    } catch {
      toast.error("Failed to ban user");
    }
  };

  const stats = [
    {
      icon: Users,
      label: "Total Users",
      value: String(analytics.totalUsers),
      color: "#FF9A3D",
    },
    {
      icon: Video,
      label: "Total Videos",
      value: String(analytics.totalVideos),
      color: "#FF4D7D",
    },
    {
      icon: Flag,
      label: "Total Reports",
      value: String(analytics.totalReports),
      color: "#8B5CF6",
    },
    { icon: TrendingUp, label: "Active Today", value: "--", color: "#10B981" },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-4">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-5 w-5" style={{ color: "#8B5CF6" }} />
        <h1 className="text-xl font-bold">Admin Panel</h1>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-card rounded-xl p-4 border border-border"
          >
            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center mb-2"
              style={{ backgroundColor: `${s.color}20` }}
            >
              <s.icon className="h-4 w-4" style={{ color: s.color }} />
            </div>
            <p className="text-2xl font-bold">{loading ? "..." : s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
      <Tabs defaultValue="users">
        <TabsList className="w-full bg-card mb-4">
          <TabsTrigger value="users" className="flex-1">
            Users
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex-1">
            Reports
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex-1">
            Analytics
          </TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          {loading ? (
            <p className="text-muted-foreground text-center py-8">
              Loading users...
            </p>
          ) : users.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No users yet
            </p>
          ) : (
            <div className="space-y-2">
              {users.map(([principal, profile]) => (
                <div
                  key={principal.toString()}
                  className="flex items-center gap-3 bg-card rounded-xl p-3 border border-border"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="brand-gradient text-white text-xs">
                      {profile.username[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">@{profile.username}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {principal.toString().slice(0, 20)}...
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleBan(principal)}
                    className="gap-1 text-xs"
                  >
                    <Ban className="h-3 w-3" /> Ban
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="reports">
          <div className="space-y-2">
            {[
              "Spam video from @user123",
              "Inappropriate content",
              "Harassment in comments",
            ].map((r, i) => (
              <div
                key={i}
                className="flex items-center gap-3 bg-card rounded-xl p-3 border border-border"
              >
                <div className="h-8 w-8 rounded-full bg-red-500/20 flex items-center justify-center">
                  <Flag className="h-4 w-4 text-red-500" />
                </div>
                <p className="flex-1 text-sm">{r}</p>
                <Button variant="outline" size="sm" className="gap-1 text-xs">
                  <Trash2 className="h-3 w-3" /> Remove
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="analytics">
          <div className="bg-card rounded-xl p-6 border border-border text-center">
            <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-muted-foreground">
              Detailed analytics coming soon
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Total Users: {String(analytics.totalUsers)} • Total Videos:{" "}
              {String(analytics.totalVideos)}
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
