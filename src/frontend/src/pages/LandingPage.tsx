import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useBackend } from "@/hooks/useBackend";
import { Music, Play, Sparkles, TrendingUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  onLogin: () => void;
}

export default function LandingPage({ onLogin }: Props) {
  const { login, isAuthenticated, refreshProfile } = useAuth();
  const { backend } = useBackend();
  const [showRegister, setShowRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await login();
      setShowRegister(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!username.trim()) {
      toast.error("Username required");
      return;
    }
    if (!backend) {
      toast.error("Not connected yet");
      return;
    }
    setLoading(true);
    try {
      await backend.register(username.trim(), bio.trim(), null);
      await refreshProfile();
      onLogin();
    } catch {
      toast.error("Registration failed, please try again");
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated && showRegister) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-card rounded-2xl p-6 border border-border">
          <h2 className="brand-gradient-text text-2xl font-bold text-center mb-2">
            Look@Me
          </h2>
          <p className="text-muted-foreground text-center text-sm mb-6">
            Complete your profile
          </p>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">
                Username *
              </label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="@yourname"
                className="bg-muted"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Bio</label>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell the world about yourself..."
                className="bg-muted resize-none"
                rows={3}
              />
            </div>
            <Button
              onClick={handleRegister}
              disabled={loading}
              className="w-full brand-gradient text-white border-0 hover:opacity-90"
            >
              {loading ? "Creating profile..." : "Join Look@Me"}
            </Button>
            <Button variant="ghost" className="w-full" onClick={onLogin}>
              Skip for now
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background:
              "radial-gradient(ellipse at top, #FF4D7D 0%, transparent 70%)",
          }}
        />
        <div className="relative max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 bg-card border border-border rounded-full px-4 py-1.5 text-sm text-muted-foreground mb-6">
            <Sparkles className="h-3.5 w-3.5" style={{ color: "#FF9A3D" }} />
            India’s #1 Short Video Platform
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-4">
            <span className="brand-gradient-text">Look@Me</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-xl mx-auto">
            Share your story. Express yourself. Go viral in India and beyond.
          </p>
          <Button
            onClick={handleLogin}
            disabled={loading}
            size="lg"
            className="brand-gradient text-white border-0 hover:opacity-90 text-lg px-8 py-6 rounded-2xl shadow-xl"
          >
            {loading ? "Connecting..." : "शुरू करें — Get Started"}
          </Button>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-6 pb-20 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            icon: Play,
            title: "Viral Videos",
            desc: "Short videos that get millions of views",
          },
          {
            icon: Music,
            title: "Bollywood Beats",
            desc: "Sync your videos with trending Indian music",
          },
          {
            icon: TrendingUp,
            title: "Creator Fund",
            desc: "Earn coins, gifts and real money",
          },
        ].map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="bg-card border border-border rounded-2xl p-6"
          >
            <div className="brand-gradient rounded-xl p-3 w-12 h-12 flex items-center justify-center mb-4">
              <Icon className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-semibold text-lg mb-1">{title}</h3>
            <p className="text-muted-foreground text-sm">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
