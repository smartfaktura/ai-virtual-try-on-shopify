import { useMemo, useState } from "react";
import { Sparkles, ChevronDown, Loader2, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useIsAdminSafe } from "../hooks/useIsAdminSafe";
import { Step5Review } from "./Step5Review";
import { BrandSceneGenerateLoading } from "../components/BrandSceneGenerateLoading";
import { BrandSceneVariationGrid } from "../components/BrandSceneVariationGrid";
import {
  generateBrandScene,
  saveBrandScene,
  BrandSceneApiError,
  type GeneratedVariation,
} from "../../api/brandSceneApi";
import type { BrandSceneAnswers } from "../../types";
import { assembleSceneDirective } from "../../prompt/assembleSceneDirective";
import {
  BRAND_SCENE_GENERATION_COST,
  BRAND_SCENE_VARIATIONS_PER_GENERATION,
} from "../../constants";

interface Props {
  answers: BrandSceneAnswers;
  onNegativeNoteChange?: (note: string) => void;
}

type Phase = "idle" | "generating" | "picking" | "saving";

export function Step6PreviewAndPick({ answers, onNegativeNoteChange }: Props) {
  const directive = useMemo(() => assembleSceneDirective(answers), [answers]);
  const { isAdmin } = useIsAdminSafe();
  const navigate = useNavigate();
  const [showPrompt, setShowPrompt] = useState(false);
  const [showPayload, setShowPayload] = useState(false);

  const [phase, setPhase] = useState<Phase>("idle");
  const [variations, setVariations] = useState<GeneratedVariation[]>([]);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);

  const sceneName = answers.name?.trim() || "Untitled scene";

  const referenceImageUrl =
    answers.source === "reference" ? answers.reference_preview_url : undefined;

  const handleGenerate = async () => {
    if (!directive.trim()) {
      toast.error("Add at least one detail before generating");
      return;
    }
    setPhase("generating");
    setVariations([]);
    setSelectedUrl(null);
    try {
      const res = await generateBrandScene({
        compiledPrompt: directive,
        referenceImageUrl,
      });
      setVariations(res.variations);
      if (res.variations.length > 0) {
        setSelectedUrl(res.variations[0].url);
      }
      setPhase("picking");
      if (res.partial) {
        toast.warning(`Generated ${res.variations.length} of 3 — try again if you want more options`);
      }
    } catch (e) {
      setPhase("idle");
      if (e instanceof BrandSceneApiError) {
        if (e.code === "RATE_LIMIT") toast.error("Too many requests, try again shortly");
        else if (e.code === "INSUFFICIENT_CREDITS") toast.error("AI credits exhausted, try again later");
        else if (e.code === "GENERATION_FAILED") toast.error("Generation failed. Please try again.");
        else toast.error(e.message);
      } else {
        toast.error("Generation failed. Please try again.");
      }
    }
  };

  const handleRegenerate = () => {
    if (!confirm("Generate 3 new variations? (Free — credits are only spent when you save.)")) return;
    handleGenerate();
  };

  const handleSave = async () => {
    if (!selectedUrl) return;
    setPhase("saving");
    try {
      await saveBrandScene({
        answers,
        name: sceneName,
        pickedVariationUrl: selectedUrl,
        compiledPrompt: directive,
      });
      toast.success("Saved to your library");
      navigate("/app/brand-scenes");
    } catch (e) {
      setPhase("picking");
      if (e instanceof BrandSceneApiError && e.code === "INSUFFICIENT_CREDITS") {
        toast.error(`You need ${BRAND_SCENE_GENERATION_COST} credits to save a brand scene`);
      } else {
        toast.error(e instanceof Error ? e.message : "Could not save scene");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero — generate / pick / save */}
      {phase === "idle" && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Ready to generate
          </div>
          <div className="mt-1 text-base font-semibold tracking-tight">
            {BRAND_SCENE_VARIATIONS_PER_GENERATION} variations — free preview
          </div>
          <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
            Previewing is free. You'll only spend {BRAND_SCENE_GENERATION_COST} credits when you save the variation you like to your library.
          </p>

          <div className="mt-5">
            <Button size="pill" onClick={handleGenerate} className="gap-2">
              <Sparkles className="w-4 h-4" />
              Generate {BRAND_SCENE_VARIATIONS_PER_GENERATION} variations
            </Button>
          </div>
        </div>
      )}

      {phase === "generating" && <BrandSceneGenerateLoading />}

      {(phase === "picking" || phase === "saving") && variations.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Pick your favorite
            </div>
            <div className="mt-1 text-base font-semibold tracking-tight">
              {sceneName}
            </div>
            <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
              Select the variation that best matches what you want. Saving costs {BRAND_SCENE_GENERATION_COST} credits and adds it to your scene library.
            </p>
          </div>

          <BrandSceneVariationGrid
            variations={variations}
            selectedUrl={selectedUrl}
            onSelect={(url) => phase === "picking" && setSelectedUrl(url)}
          />

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleRegenerate}
              disabled={phase === "saving"}
              className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 disabled:opacity-40"
            >
              <RefreshCw className="w-3 h-3" />
              Regenerate (free)
            </button>
            <Button
              size="pill"
              onClick={handleSave}
              disabled={!selectedUrl || phase === "saving"}
              className="gap-2"
            >
              {phase === "saving" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Save to library · {BRAND_SCENE_GENERATION_COST} credits
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Full structured summary (ported from Step5Review) */}
      <Step5Review answers={answers} onNegativeNoteChange={onNegativeNoteChange} />

      {/* Admin debug — single instance */}
      {isAdmin && (
        <div className="space-y-3 pt-4 border-t border-border/60">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Admin debug
          </div>

          <AdminPanel
            label="Compiled prompt"
            open={showPrompt}
            onToggle={() => setShowPrompt((v) => !v)}
          >
            <pre className="text-xs leading-relaxed text-foreground/85 whitespace-pre-wrap font-mono">
{directive || "(empty — go back and fill in the scene)"}
            </pre>
          </AdminPanel>

          <AdminPanel
            label="Raw payload"
            open={showPayload}
            onToggle={() => setShowPayload((v) => !v)}
          >
            <pre className="text-xs leading-relaxed text-foreground/85 whitespace-pre-wrap font-mono overflow-auto max-h-[400px]">
{JSON.stringify(answers, null, 2)}
            </pre>
          </AdminPanel>
        </div>
      )}
    </div>
  );
}

function AdminPanel({
  label,
  open,
  onToggle,
  children,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-muted/30">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground"
      >
        <span>{label}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}
