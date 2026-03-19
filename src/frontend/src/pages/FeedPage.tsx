import type { Page } from "@/App";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBackend } from "@/hooks/useBackend";
import { useTheme } from "@/hooks/useTheme";
import {
  Bookmark,
  ChevronDown,
  ChevronUp,
  Heart,
  MessageCircle,
  Music,
  Share2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const DEMO_VIDEOS = [
  {
    id: "demo1",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    creator: "@priya_sharma",
    caption: "ये जिंदगी है यारों ✨ Live your best life every single day!",
    hashtags: ["#Trending", "#IndianCreator", "#Viral", "#Bollywood"],
    music: "Kesariya - Brahmastra",
    likes: 142000,
    comments: 3200,
    shares: 8900,
    saves: 5400,
  },
  {
    id: "demo2",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    creator: "@rahul_dance",
    caption: "Dancing to my favourite beat 💃🏽 Fire moves all day",
    hashtags: ["#DanceIndia", "#Reels", "#BollywoodDance"],
    music: "Naatu Naatu - RRR",
    likes: 98000,
    comments: 1800,
    shares: 4500,
    saves: 3200,
  },
  {
    id: "demo3",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    creator: "@neha_vibes",
    caption: "आज का दिन सुपर है ✨ Sunset vibes from Mumbai",
    hashtags: ["#Mumbai", "#SunsetVibes", "#IndiaTravel"],
    music: "Tum Hi Ho - Aashiqui 2",
    likes: 234000,
    comments: 5600,
    shares: 12000,
    saves: 8900,
  },
  {
    id: "demo4",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    creator: "@arjun_tech",
    caption: "Morning routine that changed my life 💡 #Motivation",
    hashtags: ["#MorningRoutine", "#Motivation", "#IndianYouth"],
    music: "Jai Ho - Slumdog Millionaire",
    likes: 67000,
    comments: 2100,
    shares: 3400,
    saves: 4200,
  },
];

function formatCount(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

type DemoVideo = (typeof DEMO_VIDEOS)[0];

interface VideoCardProps {
  video: DemoVideo;
  isActive: boolean;
}

function VideoCard({ video, isActive }: VideoCardProps) {
  const { backend } = useBackend();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<
    Array<{ author: string; text: string }>
  >([]);
  const [likeCount, setLikeCount] = useState(video.likes);

  useEffect(() => {
    if (isActive && videoRef.current) {
      videoRef.current.play().catch(() => {});
    } else if (!isActive && videoRef.current) {
      videoRef.current.pause();
    }
  }, [isActive]);

  const handleLike = async () => {
    setLiked((l) => !l);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
    try {
      if (backend) await backend.likeVideo(video.id);
    } catch {}
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    setComments((prev) => [...prev, { author: "You", text: commentText }]);
    setCommentText("");
    try {
      if (backend) await backend.addComment(video.id, commentText);
    } catch {}
  };

  const handleShare = () => toast.success("Link copied!");

  return (
    <div
      className="snap-item relative w-full"
      style={{ height: "calc(100vh - 7.5rem)" }}
    >
      <video
        ref={videoRef}
        src={video.url}
        className="w-full h-full object-cover rounded-2xl"
        loop
        muted
        playsInline
        onClick={() =>
          videoRef.current?.paused
            ? videoRef.current.play()
            : videoRef.current?.pause()
        }
      />
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%, transparent 80%, rgba(0,0,0,0.2) 100%)",
        }}
      />
      {/* Bottom info */}
      <div className="absolute bottom-4 left-4 right-16 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Avatar className="h-8 w-8 ring-2 ring-white/30">
            <AvatarFallback className="brand-gradient text-white text-xs">
              {video.creator[1].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="font-semibold text-sm">{video.creator}</span>
          <button
            type="button"
            className="brand-gradient text-white text-xs px-2 py-0.5 rounded-full ml-1"
          >
            Follow
          </button>
        </div>
        <p className="text-sm mb-1 line-clamp-2">{video.caption}</p>
        <div className="flex flex-wrap gap-1">
          {video.hashtags.map((h) => (
            <span
              key={h}
              className="text-xs font-medium"
              style={{ color: "#FF9A3D" }}
            >
              {h}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Music
            className="h-3.5 w-3.5 animate-spin-slow"
            style={{ color: "#FF4D7D" }}
          />
          <span className="text-xs text-white/70">{video.music}</span>
        </div>
      </div>
      {/* Right action rail */}
      <div className="absolute right-3 bottom-4 flex flex-col items-center gap-4">
        <button
          onClick={handleLike}
          className="flex flex-col items-center gap-1"
        >
          <div
            className={`h-10 w-10 rounded-full bg-black/40 backdrop-blur flex items-center justify-center transition-all ${liked ? "scale-110" : ""}`}
          >
            <Heart
              className={`h-5 w-5 ${liked ? "fill-red-500 text-red-500" : "text-white"}`}
            />
          </div>
          <span className="text-white text-xs font-medium">
            {formatCount(likeCount)}
          </span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex flex-col items-center gap-1"
        >
          <div className="h-10 w-10 rounded-full bg-black/40 backdrop-blur flex items-center justify-center">
            <MessageCircle className="h-5 w-5 text-white" />
          </div>
          <span className="text-white text-xs font-medium">
            {formatCount(video.comments + comments.length)}
          </span>
        </button>
        <button
          onClick={handleShare}
          className="flex flex-col items-center gap-1"
        >
          <div className="h-10 w-10 rounded-full bg-black/40 backdrop-blur flex items-center justify-center">
            <Share2 className="h-5 w-5 text-white" />
          </div>
          <span className="text-white text-xs font-medium">
            {formatCount(video.shares)}
          </span>
        </button>
        <button
          onClick={() => setSaved((s) => !s)}
          className="flex flex-col items-center gap-1"
        >
          <div className="h-10 w-10 rounded-full bg-black/40 backdrop-blur flex items-center justify-center">
            <Bookmark
              className={`h-5 w-5 ${saved ? "fill-yellow-400 text-yellow-400" : "text-white"}`}
            />
          </div>
          <span className="text-white text-xs font-medium">
            {formatCount(video.saves + (saved ? 1 : 0))}
          </span>
        </button>
      </div>
      {/* Comments panel */}
      {showComments && (
        <div className="absolute bottom-0 left-0 right-0 bg-card/95 backdrop-blur rounded-t-2xl p-4 max-h-64 flex flex-col border-t border-border">
          <h3 className="font-semibold mb-3 text-sm">Comments</h3>
          <div className="flex-1 overflow-y-auto space-y-2 mb-3 hide-scrollbar">
            <div className="text-sm">
              <span className="font-medium">@priya_fan </span>
              <span className="text-muted-foreground">
                Absolutely love this! ❤️
              </span>
            </div>
            <div className="text-sm">
              <span className="font-medium">@rahul123 </span>
              <span className="text-muted-foreground">So inspiring!</span>
            </div>
            {comments.map((c, i) => (
              <div key={i} className="text-sm">
                <span className="font-medium">@{c.author} </span>
                <span className="text-muted-foreground">{c.text}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 h-9 text-sm bg-muted"
              onKeyDown={(e) => e.key === "Enter" && handleComment()}
            />
            <Button
              size="sm"
              onClick={handleComment}
              className="brand-gradient text-white border-0"
            >
              Post
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

interface Props {
  navigate: (p: Page) => void;
}

export default function FeedPage({ navigate: _navigate }: Props) {
  const { t } = useTheme();
  const [activeTab, setActiveTab] = useState<
    "foryou" | "following" | "explore"
  >("foryou");
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handler = () => {
      const idx = Math.round(container.scrollTop / container.clientHeight);
      setActiveIndex(idx);
    };
    container.addEventListener("scroll", handler);
    return () => container.removeEventListener("scroll", handler);
  }, []);

  const scrollTo = (dir: "up" | "down") => {
    if (!containerRef.current) return;
    const h = containerRef.current.clientHeight;
    containerRef.current.scrollBy({
      top: dir === "down" ? h : -h,
      behavior: "smooth",
    });
  };

  const tabs = [
    { key: "foryou", label: t("forYou") },
    { key: "following", label: t("following") },
    { key: "explore", label: t("explore") },
  ];

  return (
    <div className="flex" style={{ height: "calc(100vh - 7.5rem)" }}>
      <div className="flex-1 relative">
        {/* Tabs */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 bg-black/40 backdrop-blur rounded-full px-1 py-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
                activeTab === tab.key
                  ? "brand-gradient text-white"
                  : "text-white/70 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => scrollTo("up")}
          className="absolute top-16 right-3 z-20 h-8 w-8 rounded-full bg-black/40 backdrop-blur flex items-center justify-center text-white hover:bg-black/60"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
        <button
          onClick={() => scrollTo("down")}
          className="absolute bottom-16 right-3 z-20 h-8 w-8 rounded-full bg-black/40 backdrop-blur flex items-center justify-center text-white hover:bg-black/60"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
        <div
          ref={containerRef}
          className="snap-container w-full h-full px-2 pt-1 hide-scrollbar"
        >
          {activeTab === "following" ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-center p-8">
              <div>
                <p className="text-lg font-medium mb-2">No videos yet</p>
                <p className="text-sm">
                  Follow creators to see their videos here
                </p>
              </div>
            </div>
          ) : (
            DEMO_VIDEOS.map((v, i) => (
              <VideoCard key={v.id} video={v} isActive={i === activeIndex} />
            ))
          )}
        </div>
      </div>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col gap-4 w-72 p-4 overflow-y-auto hide-scrollbar">
        <div className="bg-card rounded-2xl p-4 border border-border">
          <h3 className="font-semibold text-sm mb-3">
            <span className="brand-gradient-text">#</span> {t("trending")}{" "}
            Hashtags
          </h3>
          <div className="flex flex-wrap gap-2">
            {[
              "#BollywoodVibes",
              "#IndianCreator",
              "#Viral2025",
              "#Desi",
              "#Mumbai",
              "#NatuNaatu",
              "#Reels",
              "#India",
            ].map((h) => (
              <span
                key={h}
                className="bg-muted text-xs px-2.5 py-1 rounded-full text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              >
                {h}
              </span>
            ))}
          </div>
        </div>
        <div className="bg-card rounded-2xl p-4 border border-border">
          <h3 className="font-semibold text-sm mb-3">Top Creators</h3>
          <div className="space-y-3">
            {DEMO_VIDEOS.map((v) => (
              <div key={v.id} className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="brand-gradient text-white text-xs">
                    {v.creator[1].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{v.creator}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatCount(v.likes)} likes
                  </p>
                </div>
                <button
                  type="button"
                  className="text-xs px-2 py-1 rounded-full border border-border hover:border-pink-500 transition-colors"
                >
                  Follow
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card rounded-2xl p-4 border border-border">
          <h3 className="font-semibold text-sm mb-3">Quick Create</h3>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {["✨ Sparkle", "🎬 Bollywood", "💄 Glam"].map((f) => (
              <button
                key={f}
                className="bg-muted rounded-xl p-2 text-xs text-center hover:bg-accent transition-colors"
              >
                {f}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="w-full brand-gradient text-white rounded-xl py-2 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            + Create Video
          </button>
        </div>
      </div>
    </div>
  );
}
