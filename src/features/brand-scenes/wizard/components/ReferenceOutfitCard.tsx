import { useEffect, useRef, useState } from "react";
import { ChevronDown, Loader2, Sparkles, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { ReferenceOutfit } from "../../types";

const MAX = 1200;

interface Props {
  imagePath?: string;
  previewUrl?: string;
  outfit?: ReferenceOutfit;
  onChange: (outfit: ReferenceOutfit) => void;
  onClear: () => void;
}

export function ReferenceOutfitCard({
  imagePath,
  previewUrl,
  outfit,
  onChange,
  onClear,
}: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openDetails, setOpenDetails] = useState(false);
  const autoRanFor = useRef<string | null>(null);

  const run = async (isRetry = false) => {
    if (!imagePath) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnErr } = await supabase.functions.invoke(
        "analyze-reference-outfit",
        { body: { imagePath, imageUrl: previewUrl } },
      );
      if (fnErr) throw fnErr;
      if (data?.error) throw new Error(data.error);
      if (!data?.people_present) {
        setError("No people detected in this reference — skip outfit direction.");
        if (isRetry) onClear();
        return;
      }
      onChange({
        description: data.outfit_description ?? "",
        breakdown: data.breakdown ?? undefined,
        source_image_path: imagePath,
        generated_at: new Date().toISOString(),
        edited_by_user: false,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Analysis failed";
      setError(msg);
      toast({ title: "Outfit analysis failed", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Auto-run once per image
  useEffect(() => {
    if (!imagePath) return;
    if (outfit?.source_image_path === imagePath) return;
    if (autoRanFor.current === imagePath) return;
    autoRanFor.current = imagePath;
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imagePath]);

  if (!imagePath) return null;

  return (
    <div className="rounded-2xl border border-border bg-card/50 p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
          </div>
          <div>
            <Label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              AI outfit direction
            </Label>
            <p className="text-[11px] text-muted-foreground">
              Auto-analyzed from your reference — edit anything
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => run(true)}
          disabled={loading}
          className="rounded-full gap-1.5 text-xs"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5" />
          )}
          {outfit ? "Re-analyze" : "Analyze"}
        </Button>
      </div>

      {loading && !outfit && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground py-4">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Reading the outfit details…
        </div>
      )}

      {error && !loading && (
        <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/40 rounded-lg p-2.5">
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {outfit && (
        <>
          <Textarea
            value={outfit.description}
            onChange={(e) =>
              onChange({
                ...outfit,
                description: e.target.value.slice(0, MAX),
                edited_by_user: true,
              })
            }
            rows={6}
            maxLength={MAX}
            className="rounded-xl text-sm resize-none"
            placeholder="Describe the outfit in detail…"
          />
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>
              {outfit.edited_by_user ? "Edited" : "AI-generated"} · used as
              styling direction during generation
            </span>
            <span>
              {outfit.description.length}/{MAX}
            </span>
          </div>

          {outfit.breakdown && (
            <button
              type="button"
              onClick={() => setOpenDetails((v) => !v)}
              className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronDown
                className={`w-3 h-3 transition-transform ${openDetails ? "rotate-180" : ""}`}
              />
              {openDetails ? "Hide" : "Show"} breakdown
            </button>
          )}

          {openDetails && outfit.breakdown && (
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs pt-1">
              {Object.entries(outfit.breakdown).map(([k, v]) => {
                if (!v || (Array.isArray(v) && v.length === 0)) return null;
                return (
                  <div key={k} className="contents">
                    <dt className="text-muted-foreground capitalize">
                      {k.replace(/_/g, " ")}
                    </dt>
                    <dd className="text-foreground/85">
                      {Array.isArray(v) ? v.join(", ") : v}
                    </dd>
                  </div>
                );
              })}
            </dl>
          )}
        </>
      )}
    </div>
  );
}
