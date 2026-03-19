import type { Page } from "@/App";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useBackend } from "@/hooks/useBackend";
import { Edit, Grid, Link as LinkIcon, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Props {
  userId: string | null;
  navigate: (p: Page) => void;
}

const DEMO_THUMBNAILS = [
  { bg: "from-pink-500 to-purple-600", views: "142K" },
  { bg: "from-orange-400 to-pink-500", views: "98K" },
  { bg: "from-purple-600 to-blue-500", views: "234K" },
  { bg: "from-green-400 to-teal-500", views: "67K" },
  { bg: "from-red-500 to-orange-400", views: "89K" },
  { bg: "from-blue-500 to-cyan-400", views: "55K" },
];

export default function ProfilePage({ userId, navigate: _navigate }: Props) {
  const { profile, isAuthenticated, refreshProfile } = useAuth();
  const { backend } = useBackend();
  const isOwn = !userId;
  const [editOpen, setEditOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username);
      setBio(profile.bio);
    }
  }, [profile]);

  const handleSave = async () => {
    if (!backend) return;
    setSaving(true);
    try {
      await backend.saveCallerUserProfile(username, bio, null);
      await refreshProfile();
      setEditOpen(false);
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const displayName = profile?.username ?? "User";
  const displayBio = profile?.bio ?? "Hey! I'm on Look@Me 🎬";

  return (
    <div className="max-w-xl mx-auto">
      <div className="h-28 brand-gradient relative" />
      <div className="px-4 pb-4">
        <div className="flex items-end justify-between -mt-12 mb-3">
          <Avatar className="h-20 w-20 ring-4 ring-background">
            {profile?.avatarBlobKey && (
              <AvatarImage src={profile.avatarBlobKey.getDirectURL()} />
            )}
            <AvatarFallback className="brand-gradient text-white text-2xl font-bold">
              {displayName[0]?.toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex gap-2">
            {isOwn ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditOpen(true)}
                  className="gap-1"
                >
                  <Edit className="h-3.5 w-3.5" /> Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => _navigate("settings")}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  onClick={() => setFollowing((f) => !f)}
                  className={
                    following
                      ? "border border-border"
                      : "brand-gradient text-white border-0"
                  }
                  variant={following ? "outline" : "default"}
                >
                  {following ? "Following" : "Follow"}
                </Button>
                <Button variant="outline" size="sm">
                  Message
                </Button>
              </>
            )}
          </div>
        </div>
        <h1 className="text-xl font-bold">@{displayName}</h1>
        <p className="text-muted-foreground text-sm mt-1">{displayBio}</p>
        <div className="flex items-center gap-1 mt-1">
          <LinkIcon className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">look-at-me.app</span>
        </div>
        <div className="flex gap-6 mt-4">
          {[
            {
              label: "Following",
              val: isAuthenticated ? String(profile?.followingCount ?? 0) : "0",
            },
            {
              label: "Followers",
              val: isAuthenticated ? String(profile?.followerCount ?? 0) : "0",
            },
            { label: "Likes", val: "142K" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-bold text-lg">{s.val}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-6 mb-3">
          <Grid className="h-4 w-4" />
          <span className="text-sm font-medium">Videos</span>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {DEMO_THUMBNAILS.map((t, i) => (
            <div
              key={i}
              className={`aspect-[9/16] rounded-lg bg-gradient-to-br ${t.bg} relative overflow-hidden cursor-pointer hover:opacity-90 transition-opacity`}
            >
              <div className="absolute bottom-1 left-1">
                <span className="text-white text-xs font-medium">
                  {t.views}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Username</label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-muted"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Bio</label>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="bg-muted resize-none"
                rows={3}
              />
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full brand-gradient text-white border-0"
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
