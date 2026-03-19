import { ExternalBlob } from "@/backend";
import { useCamera } from "@/camera/useCamera";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useBackend } from "@/hooks/useBackend";
import { Camera, Hash, Music, Upload, Video, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

const MUSIC_OPTIONS = [
  "Kesariya - Brahmastra",
  "Naatu Naatu - RRR",
  "Tum Hi Ho - Aashiqui 2",
  "Jai Ho - AR Rahman",
  "Rang De Basanti",
  "Chaiyya Chaiyya",
  "Custom / Original",
];

const FILTERS = [
  { emoji: "✨", label: "Sparkle" },
  { emoji: "🎬", label: "Bollywood" },
  { emoji: "💄", label: "Glam" },
  { emoji: "🌟", label: "Vintage" },
  { emoji: "🌈", label: "Vivid" },
  { emoji: "❤️", label: "Warm" },
];

// Minimal 1x1 transparent PNG
const THUMB_BYTES = new Uint8Array([
  137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1, 0,
  0, 0, 1, 8, 2, 0, 0, 0, 144, 119, 83, 222, 0, 0, 0, 12, 73, 68, 65, 84, 8,
  215, 99, 248, 207, 192, 0, 0, 0, 2, 0, 1, 227, 0, 0, 0, 0, 73, 69, 78, 68,
  174, 66, 96, 130,
]);

interface Props {
  onDone: () => void;
}

export default function CreatePage({ onDone }: Props) {
  const [step, setStep] = useState<"source" | "details">("source");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [music, setMusic] = useState(MUSIC_OPTIONS[0]);
  const [hashtagInput, setHashtagInput] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [usingCamera, setUsingCamera] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    videoRef: camRef,
    startCamera,
    stopCamera,
    isActive: camActive,
  } = useCamera();
  void camActive;
  const { backend } = useBackend();

  const handleFile = (file: File) => {
    setVideoFile(file);
    setVideoUrl(URL.createObjectURL(file));
    setStep("details");
  };

  const addHashtag = () => {
    const tag = hashtagInput.trim().replace(/^#?/, "#");
    if (tag.length > 1 && !hashtags.includes(tag)) {
      setHashtags((prev) => [...prev, tag]);
    }
    setHashtagInput("");
  };

  const handleUpload = async () => {
    if (!videoFile || !title.trim()) {
      toast.error("Please add a title");
      return;
    }
    setUploading(true);
    setProgress(0);
    try {
      const id = `vid_${Date.now()}`;
      const videoBytes = new Uint8Array(await videoFile.arrayBuffer());
      const blob = ExternalBlob.fromBytes(videoBytes).withUploadProgress(
        (p: number) => setProgress(Math.round(p)),
      );
      const thumbBlob = ExternalBlob.fromBytes(THUMB_BYTES);

      if (!backend) return;
      await backend.uploadVideo(
        id,
        title.trim(),
        description.trim(),
        hashtags,
        blob,
        thumbBlob,
        music,
        BigInt(30),
      );
      toast.success("✨ Video uploaded successfully!");
      onDone();
    } catch {
      toast.error("Upload failed, please try again");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  if (step === "source") {
    return (
      <div className="max-w-lg mx-auto px-4 py-6">
        <h1 className="text-xl font-bold mb-1">Create Video</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Share your moment with India
        </p>

        <div className="mb-6">
          <h2 className="text-sm font-medium mb-3">Choose a filter</h2>
          <div className="grid grid-cols-6 gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.label}
                onClick={() =>
                  setSelectedFilter(selectedFilter === f.label ? null : f.label)
                }
                className={`bg-card rounded-xl p-2 text-center border transition-all ${
                  selectedFilter === f.label
                    ? "border-pink-500 scale-105"
                    : "border-border"
                }`}
              >
                <div className="text-lg">{f.emoji}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {f.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => fileRef.current?.click()}
            className="bg-card border-2 border-dashed border-border rounded-2xl p-8 flex flex-col items-center gap-3 hover:border-pink-500 transition-colors"
          >
            <div className="brand-gradient rounded-2xl p-4">
              <Upload className="h-6 w-6 text-white" />
            </div>
            <div className="text-center">
              <p className="font-medium text-sm">Upload Video</p>
              <p className="text-xs text-muted-foreground mt-1">
                MP4, MOV up to 500MB
              </p>
            </div>
          </button>

          <button
            onClick={() => {
              setUsingCamera(true);
              startCamera();
            }}
            className="bg-card border-2 border-dashed border-border rounded-2xl p-8 flex flex-col items-center gap-3 hover:border-pink-500 transition-colors"
          >
            <div className="brand-gradient rounded-2xl p-4">
              <Camera className="h-6 w-6 text-white" />
            </div>
            <div className="text-center">
              <p className="font-medium text-sm">Use Camera</p>
              <p className="text-xs text-muted-foreground mt-1">
                Record directly
              </p>
            </div>
          </button>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) handleFile(e.target.files[0]);
          }}
        />

        {usingCamera && (
          <div className="mt-4 relative">
            <video ref={camRef} autoPlay muted className="w-full rounded-2xl" />
            <Button
              size="sm"
              variant="outline"
              className="absolute top-2 right-2"
              onClick={() => {
                stopCamera();
                setUsingCamera(false);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setStep("source")}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold">Video Details</h1>
      </div>

      {videoUrl && (
        <div className="mb-4 rounded-2xl overflow-hidden bg-black aspect-video">
          <video
            src={videoUrl}
            className="w-full h-full object-contain"
            controls
          />
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Title *</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give your video a catchy title..."
            className="bg-card"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Description</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell viewers what this is about..."
            className="bg-card resize-none"
            rows={3}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 flex items-center gap-1">
            <Hash className="h-3.5 w-3.5" /> Hashtags
          </label>
          <div className="flex gap-2">
            <Input
              value={hashtagInput}
              onChange={(e) => setHashtagInput(e.target.value)}
              placeholder="#trending"
              className="bg-card flex-1"
              onKeyDown={(e) => e.key === "Enter" && addHashtag()}
            />
            <Button variant="outline" onClick={addHashtag} size="sm">
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {hashtags.map((h) => (
              <span
                key={h}
                className="flex items-center gap-1 bg-muted px-2 py-1 rounded-full text-xs"
              >
                {h}
                <button
                  onClick={() =>
                    setHashtags((prev) => prev.filter((x) => x !== h))
                  }
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 flex items-center gap-1">
            <Music className="h-3.5 w-3.5" /> Music
          </label>
          <div className="grid grid-cols-2 gap-2">
            {MUSIC_OPTIONS.map((m) => (
              <button
                key={m}
                onClick={() => setMusic(m)}
                className={`text-xs text-left px-3 py-2 rounded-xl border transition-all ${
                  music === m
                    ? "border-pink-500 bg-pink-500/10"
                    : "border-border bg-card"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {uploading && (
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Uploading...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={uploading || !title.trim()}
          className="w-full brand-gradient text-white border-0 hover:opacity-90 h-11"
        >
          {uploading ? (
            "Uploading..."
          ) : (
            <span className="flex items-center gap-2">
              <Video className="h-4 w-4" /> Post Video
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
