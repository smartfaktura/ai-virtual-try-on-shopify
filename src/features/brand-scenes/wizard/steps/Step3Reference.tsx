import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Chip } from "../components/Chip";
import {
  BRAND_SCENE_NAME_MAX,
  BRAND_SCENE_NOTE_MAX,
  BRAND_SCENE_REFERENCE_BUCKET,
  BRAND_SCENE_REFERENCE_MAX_BYTES,
} from "../../constants";
import type { ReferenceIntent } from "../../prompt/buildReferenceDirective";

const REFERENCE_INTENTS: { value: ReferenceIntent; label: string; hint: string }[] = [
  {
    value: "replicate",
    label: "Replicate exactly",
    hint: "Keep subject, pose, framing and lighting locked",
  },
  {
    value: "location",
    label: "Location only",
    hint: "Keep the place, replace people and product",
  },
  {
    value: "composition",
    label: "Composition",
    hint: "Keep framing and lighting, swap subject",
  },
  { value: "vibe", label: "Vibe / mood board", hint: "Loose inspiration only" },
];

interface Props {
  imagePath?: string;
  previewUrl?: string;
  name?: string;
  intent?: ReferenceIntent;
  note?: string;
  onImageChange: (path: string | null, previewUrl: string | null) => void;
  onNameChange: (name: string) => void;
  onIntentChange: (intent: ReferenceIntent) => void;
  onNoteChange: (note: string) => void;
}

const ACCEPTED_MIME = ["image/jpeg", "image/png", "image/webp"];
const MAX_MB = Math.round(BRAND_SCENE_REFERENCE_MAX_BYTES / 1024 / 1024);

export function Step3Reference({
  imagePath,
  previewUrl,
  name = "",
  placementHint = "",
  note = "",
  onImageChange,
  onNameChange,
  onPlacementChange,
  onNoteChange,
}: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;

    if (!ACCEPTED_MIME.includes(file.type)) {
      toast({
        title: "Unsupported file",
        description: "Use JPG, PNG or WEBP",
        variant: "destructive",
      });
      return;
    }
    if (file.size > BRAND_SCENE_REFERENCE_MAX_BYTES) {
      toast({
        title: "File too large",
        description: `Max ${MAX_MB}MB per image`,
        variant: "destructive",
      });
      return;
    }
    if (!user?.id) {
      toast({
        title: "Sign in required",
        description: "Please sign in to upload references",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from(BRAND_SCENE_REFERENCE_BUCKET)
        .upload(path, file, { contentType: file.type, upsert: false });
      if (error) throw error;
      const { data } = supabase.storage
        .from(BRAND_SCENE_REFERENCE_BUCKET)
        .getPublicUrl(path);
      onImageChange(path, data.publicUrl);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      toast({ title: "Upload failed", description: message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (imagePath) {
      await supabase.storage.from(BRAND_SCENE_REFERENCE_BUCKET).remove([imagePath]);
    }
    onImageChange(null, null);
    if (inputRef.current) inputRef.current.value = "";
  };

  // Paste-from-clipboard support (only when no image yet)
  useEffect(() => {
    if (imagePath) return;
    const onPaste = (e: ClipboardEvent) => {
      const files = e.clipboardData?.files;
      if (files && files.length > 0) {
        e.preventDefault();
        handleFiles(files);
      }
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imagePath, user?.id]);

  return (
    <div className="space-y-6">
      {/* Upload */}
      <div>
        <Label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Reference image
        </Label>
        {previewUrl ? (
          <div className="mt-2 rounded-2xl border border-border bg-card overflow-hidden">
            <div className="aspect-[4/5] bg-muted relative">
              <img
                src={previewUrl}
                alt="Scene reference"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex items-center justify-between p-3 gap-2">
              <span className="text-xs text-muted-foreground truncate">
                Uploaded — used as the scene preview and generation guide
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="rounded-full gap-1.5 shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Replace
              </Button>
            </div>
          </div>
        ) : (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              handleFiles(e.dataTransfer.files);
            }}
            className={[
              "mt-2 w-full rounded-2xl border border-dashed p-6 sm:p-8 text-center transition-colors min-h-[220px] flex flex-col items-center justify-center",
              isDragging
                ? "border-foreground bg-foreground/[0.03]"
                : "border-border bg-card/50",
              uploading && "opacity-60",
            ].join(" ")}
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
              {uploading ? (
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
              ) : (
                <ImagePlus className="w-4 h-4 text-primary" />
              )}
            </div>
            <p className="text-sm font-medium text-foreground">
              {uploading ? "Uploading…" : "Add your reference image"}
            </p>
            <p className="text-xs text-muted-foreground mt-1.5">
              JPG, PNG or WEBP · up to {MAX_MB}MB
            </p>

            <Button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="rounded-full font-semibold gap-2 mt-4 w-full sm:w-auto"
            >
              <UploadCloud className="w-4 h-4" />
              Choose image
            </Button>
            <p className="text-[11px] text-muted-foreground mt-2.5">
              or drag &amp; drop · paste from clipboard
            </p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_MIME.join(",")}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Name */}
      <div>
        <Label
          htmlFor="bs-name"
          className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
        >
          Scene name
        </Label>
        <Input
          id="bs-name"
          value={name}
          onChange={(e) => onNameChange(e.target.value.slice(0, BRAND_SCENE_NAME_MAX))}
          placeholder="e.g. Linen morning kitchen"
          maxLength={BRAND_SCENE_NAME_MAX}
          className="mt-2 rounded-xl"
        />
        <p className="text-[11px] text-muted-foreground mt-1.5">
          Shown in your brand scenes list ({name.length}/{BRAND_SCENE_NAME_MAX})
        </p>
      </div>

      {/* Placement */}
      <div>
        <Label
          htmlFor="bs-placement"
          className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
        >
          Product placement <span className="opacity-60">(optional)</span>
        </Label>
        <Input
          id="bs-placement"
          value={placementHint}
          onChange={(e) =>
            onPlacementChange(e.target.value.slice(0, BRAND_SCENE_PLACEMENT_MAX))
          }
          placeholder="e.g. held in the model's hand, label facing camera"
          maxLength={BRAND_SCENE_PLACEMENT_MAX}
          className="mt-2 rounded-xl"
        />
        <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
          Where the product should sit in the scene. Leave blank to let the AI
          choose based on the reference composition.
        </p>
      </div>

      {/* Extra direction */}
      <div>
        <Label
          htmlFor="bs-note"
          className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
        >
          Extra direction <span className="opacity-60">(optional)</span>
        </Label>
        <Textarea
          id="bs-note"
          value={note}
          onChange={(e) => onNoteChange(e.target.value.slice(0, BRAND_SCENE_NOTE_MAX))}
          placeholder="e.g. keep mood quieter than reference, product label fully visible"
          maxLength={BRAND_SCENE_NOTE_MAX}
          rows={3}
          className="mt-2 rounded-xl resize-none"
        />
        <p className="text-[11px] text-muted-foreground mt-1.5">
          {note.length}/{BRAND_SCENE_NOTE_MAX}
        </p>
      </div>
    </div>
  );
}
