import type { Page } from "@/App";
import type { PartialUserProfile } from "@/backend";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBackend } from "@/hooks/useBackend";
import type { Principal } from "@icp-sdk/core/principal";
import { Search, TrendingUp } from "lucide-react";
import { useState } from "react";

const TRENDING_HASHTAGS = [
  "#BollywoodVibes",
  "#IndianCreator",
  "#Viral2025",
  "#NatuNaatu",
  "#DanceIndia",
  "#Mumbai",
  "#Reels",
  "#Desi",
  "#Trending",
  "#Youth",
  "#Motivation",
  "#Fashion",
  "#Food",
  "#Travel",
  "#Comedy",
];

interface Props {
  navigate: (p: Page, id?: string) => void;
}

export default function SearchPage({ navigate: _navigate }: Props) {
  const { backend } = useBackend();
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<Array<[Principal, PartialUserProfile]>>(
    [],
  );
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (q: string) => {
    setQuery(q);
    if (!q.trim() || !backend) {
      setUsers([]);
      setHashtags([]);
      return;
    }
    setLoading(true);
    try {
      const [u, h] = await Promise.all([
        backend.searchUsers(q),
        backend.searchHashtags(q),
      ]);
      setUsers(u);
      setHashtags(h);
    } catch {
      setUsers([]);
      setHashtags([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search videos, creators, hashtags…"
          className="pl-9 bg-card border-border h-11 text-sm"
        />
      </div>

      {!query ? (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4" style={{ color: "#FF9A3D" }} />
            <h2 className="font-semibold">Trending Hashtags</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {TRENDING_HASHTAGS.map((h) => (
              <button
                key={h}
                onClick={() => handleSearch(h)}
                className="bg-card border border-border px-3 py-1.5 rounded-full text-sm hover:border-pink-500 transition-colors"
              >
                {h}
              </button>
            ))}
          </div>
          <h2 className="font-semibold mt-6 mb-4">Trending Creators</h2>
          <div className="space-y-3">
            {["priya_sharma", "rahul_dance", "neha_vibes", "arjun_tech"].map(
              (u, i) => (
                <div
                  key={u}
                  className="flex items-center gap-3 bg-card rounded-xl p-3 border border-border"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="brand-gradient text-white">
                      {u[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-sm">@{u}</p>
                    <p className="text-xs text-muted-foreground">
                      {["142K", "98K", "234K", "67K"][i]} followers
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-xs px-3 py-1 rounded-full brand-gradient text-white"
                  >
                    Follow
                  </button>
                </div>
              ),
            )}
          </div>
        </div>
      ) : (
        <Tabs defaultValue="users">
          <TabsList className="w-full bg-card mb-4">
            <TabsTrigger value="users" className="flex-1">
              Users ({users.length})
            </TabsTrigger>
            <TabsTrigger value="hashtags" className="flex-1">
              Tags ({hashtags.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="users">
            {loading ? (
              <p className="text-muted-foreground text-center py-8">
                Searching...
              </p>
            ) : users.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No users found for “{query}”
              </p>
            ) : (
              <div className="space-y-3">
                {users.map(([, p]) => (
                  <div
                    key={p.username}
                    className="flex items-center gap-3 bg-card rounded-xl p-3 border border-border"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="brand-gradient text-white">
                        {p.username[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-sm">@{p.username}</p>
                      <p className="text-xs text-muted-foreground">
                        {String(p.followerCount)} followers
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="hashtags">
            <div className="flex flex-wrap gap-2">
              {hashtags.map((h) => (
                <span
                  key={h}
                  className="bg-card border border-border px-3 py-1.5 rounded-full text-sm"
                >
                  {h}
                </span>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
