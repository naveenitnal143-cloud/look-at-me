import { Button } from "@/components/ui/button";
import { useBackend } from "@/hooks/useBackend";
import { Bell, Gift, Heart, MessageCircle, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";

const DEMO_NOTIFICATIONS = [
  {
    type: "like",
    message: "@priya_sharma liked your video",
    time: "2m ago",
    read: false,
  },
  {
    type: "comment",
    message: "@rahul_dance commented: Amazing moves!",
    time: "15m ago",
    read: false,
  },
  {
    type: "follow",
    message: "@neha_vibes started following you",
    time: "1h ago",
    read: true,
  },
  {
    type: "gift",
    message: "You received 50 coins from @arjun_tech!",
    time: "2h ago",
    read: true,
  },
  {
    type: "like",
    message: "@dance_queen liked your video",
    time: "3h ago",
    read: true,
  },
  {
    type: "comment",
    message: "@bollywood_fan commented: Fire video!",
    time: "5h ago",
    read: true,
  },
];

const icons = {
  like: Heart,
  comment: MessageCircle,
  follow: UserPlus,
  gift: Gift,
};
const iconColors = {
  like: "#FF4D7D",
  comment: "#FF9A3D",
  follow: "#8B5CF6",
  gift: "#FFD700",
};

export default function InboxPage() {
  const { backend } = useBackend();
  const [notifications, setNotifications] = useState(DEMO_NOTIFICATIONS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!backend) return;
    const load = async () => {
      setLoading(true);
      try {
        const notifs = await backend.getNotifications();
        if (notifs.length > 0) {
          setNotifications(
            notifs.map((n) => ({
              type: "like",
              message: n.message,
              time: new Date(
                Number(n.createdAt) / 1_000_000,
              ).toLocaleDateString(),
              read: n.isRead,
            })),
          );
        }
      } catch {
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [backend]);

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-xl mx-auto px-4 py-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <h1 className="text-lg font-bold">Notifications</h1>
          {unread > 0 && (
            <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              {unread}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            setNotifications((n) => n.map((x) => ({ ...x, read: true })))
          }
        >
          Mark all read
        </Button>
      </div>
      {loading ? (
        <p className="text-muted-foreground text-center py-8">Loading...</p>
      ) : (
        <div className="space-y-2">
          {notifications.map((n, i) => {
            const Icon = icons[n.type as keyof typeof icons] || Bell;
            const color =
              iconColors[n.type as keyof typeof iconColors] || "#FF9A3D";
            return (
              <div
                key={i}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                  n.read ? "bg-card border-border" : "bg-card"
                }`}
                style={!n.read ? { borderColor: color } : {}}
              >
                <div
                  className="h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${color}20` }}
                >
                  <Icon className="h-4 w-4" style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{n.message}</p>
                  <p className="text-xs text-muted-foreground">{n.time}</p>
                </div>
                {!n.read && (
                  <div
                    className="h-2 w-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
