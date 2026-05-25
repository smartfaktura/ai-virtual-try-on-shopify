import { useMemo, useRef, useState } from "react";
import { Sparkles, ChevronDown, ChevronLeft, Loader2, RefreshCw } from "lucide-react";
import { ImageLightbox } from "@/components/app/ImageLightbox";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCredits } from "@/contexts/CreditContext";
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
import { injectReferenceTokens } from "../../prompt/injectReferenceTokens";
import { CAST_PRESETS_WITH_PEOPLE } from "../constants/cast";
import { useStockProductForScene } from "../hooks/useStockProductForScene";
import { UserProductPickerModal, type PickedProduct } from "../components/UserProductPickerModal";
import {
  BRAND_SCENE_GENERATION_COST,
  BRAND_SCENE_NAME_MAX,
  BRAND_SCENE_VARIATIONS_PER_GENERATION,
} from "../../constants";

interface Props {
  answers: BrandSceneAnswers;
  onNegativeNoteChange?: (note: string) => void;
  onNameChange?: (name: string) => void;
  onBack?: () => void;
  cache?: {
    promptHash: string;
    variations: GeneratedVariation[];
    selectedUrl: string | null;
  } | null;
  onCacheChange?: (
    next: { promptHash: string; variations: GeneratedVariation[]; selectedUrl: string | null } | null,
  ) => void;
  promptHash?: string;
}

type Phase = "idle" | "generating" | "picking" | "saving";

export function Step6PreviewAndPick({
  answers,
  onNegativeNoteChange,
  onNameChange,
  onBack,
  cache,
  onCacheChange,
  promptHash,
}: Props) {
  const directive = useMemo(() => assembleSceneDirective(answers), [answers]);
  const { isAdmin } = useIsAdminSafe();
  const { refreshBalance } = useCredits();
  const navigate = useNavigate();
  const [showPrompt, setShowPrompt] = useState(false);
  const [showPayload, setShowPayload] = useState(false);

  // Restore cached variations if returning to step 6 with same prompt.
  const initialFromCache = cache && cache.promptHash === promptHash ? cache : null;
  const [phase, setPhase] = useState<Phase>(initialFromCache ? "picking" : "idle");
  const [variations, setVariations] = useState<GeneratedVariation[]>(
    initialFromCache?.variations ?? [],
  );
  const [selectedUrl, setSelectedUrl] = useState<string | null>(
    initialFromCache?.selectedUrl ?? null,
  );
  const [confirmRegenOpen, setConfirmRegenOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  // Idempotency lock — prevents double-deduct on fast double-click before
  // React commits the phase state change.
  const inFlightRef = useRef(false);
  // Mirror of the ref so the button visibly disables before phase flips.
  const [submitting, setSubmitting] = useState(false);


  const trimmedName = answers.name?.trim() ?? "";
  const nameValid = trimmedName.length >= 2;
  const sceneName = trimmedName || "Untitled scene";
  const isReferenceFlow = answers.source === "reference";

  const hasModelRef = !!answers.cast?.model_ref;
  const hasPeople =
    hasModelRef ||
    !!(answers.cast && CAST_PRESETS_WITH_PEOPLE.includes(answers.cast.preset as any));

  const referenceImageUrl =
    answers.source === "reference" ? answers.reference_preview_url : undefined;
  const modelImageUrl = answers.cast?.model_ref?.sourceImageUrl;
  const { data: stockProduct } = useStockProductForScene(
    answers.module,
    answers.sub_family,
    answers.cast?.gender?.[0],
  );
  const [customProduct, setCustomProduct] = useState<PickedProduct | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const previewProduct: { url: string; label: string } | null =
    customProduct ?? (stockProduct ? { url: stockProduct.url, label: stockProduct.label } : null);

  const referenceIntentLabel = (() => {
    switch (answers.reference_intent) {
      case "replicate": return "Replicate exactly";
      case "location": return "Location only";
      case "composition": return "Composition";
      case "vibe": return "Vibe / mood board";
      default: return null;
    }
  })();

  const ReferenceThumb = () =>
    isReferenceFlow && referenceImageUrl ? (
      <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 p-2.5">
        <img
          src={referenceImageUrl}
          alt="Your reference"
          className="w-14 h-[70px] rounded-md object-cover bg-background flex-shrink-0"
          loading="lazy"
        />
        <div className="min-w-0">
          <div className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
            Reference
          </div>
          <div className="text-[11px] text-foreground/85 truncate">
            {referenceIntentLabel ?? "Your uploaded inspiration"}
          </div>
        </div>
      </div>
    ) : null;

  const handleGenerate = async () => {
    if (!directive.trim()) {
      toast.error("Add at least one detail before generating");
      return;
    }
    if (!nameValid) {
      toast.error("Name this scene before generating");
      return;
    }
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setSubmitting(true);
    setPhase("generating");
    setVariations([]);
    setSelectedUrl(null);
    onCacheChange?.(null);
    try {
      const res = await generateBrandScene({
        compiledPrompt: directive,
        referenceImageUrl,
        modelImageUrl,
        productImageUrl: previewProduct?.url,
        name: trimmedName,
      });
      setVariations(res.variations);
      const firstUrl = res.variations[0]?.url ?? null;
      if (firstUrl) setSelectedUrl(firstUrl);
      setPhase("picking");
      // Persist into wizard-level cache so back-navigation doesn't discard it.
      if (promptHash && res.variations.length > 0) {
        onCacheChange?.({
          promptHash,
          variations: res.variations,
          selectedUrl: firstUrl,
        });
      }
      const charged = typeof res.credits_charged === "number" ? res.credits_charged : BRAND_SCENE_GENERATION_COST;
      if (typeof res.new_balance === "number") {
        toast.success(`−${charged} credits · balance ${res.new_balance}`);
      }
      // Sync sidebar credit chip with the server-side balance.
      refreshBalance().catch(() => {});
      if (res.partial) {
        const refunded = res.credits_refunded ?? 0;
        toast.warning(
          refunded > 0
            ? `Generated ${res.variations.length} of 3 — refunded ${refunded} credits`
            : `Generated ${res.variations.length} of 3`,
        );
      }
    } catch (e) {
      setPhase("idle");
      if (e instanceof BrandSceneApiError) {
        if (e.code === "RATE_LIMIT") toast.error("Too many requests, try again shortly");
        else if (e.code === "INSUFFICIENT_CREDITS") {
          toast.error(`You need ${BRAND_SCENE_GENERATION_COST} credits to generate brand scene variations`);
          refreshBalance().catch(() => {});
        }
        else if (e.code === "GENERATION_FAILED") toast.error("Generation failed. Please try again.");
        else toast.error(e.message);
      } else {
        toast.error("Generation failed. Please try again.");
      }
    } finally {
      inFlightRef.current = false;
      setSubmitting(false);
    }
  };

  const handleRegenerate = () => {
    if (!nameValid) {
      toast.error("Name this scene before generating");
      return;
    }
    setConfirmRegenOpen(true);
  };

  const handleRegenerateConfirmed = () => {
    setConfirmRegenOpen(false);
    handleGenerate();
  };

  const handleSave = async () => {
    if (!selectedUrl) return;
    if (!nameValid) {
      toast.error("Name this scene before saving");
      return;
    }
    setPhase("saving");
    try {
      // Inject [PRODUCT IMAGE] / [MODEL IMAGE] tokens into the stored prompt
      // template so downstream `generate-workflow` substitutes the user's real
      // product and model references at generation time.
      const persistedPrompt = injectReferenceTokens(directive, { hasPeople });
      await saveBrandScene({
        answers,
        name: trimmedName,
        pickedVariationUrl: selectedUrl,
        compiledPrompt: persistedPrompt,
      });
      onCacheChange?.(null);
      toast.success("Saved to your library");
      navigate("/app/brand-scenes");
    } catch (e) {
      setPhase("picking");
      toast.error(e instanceof Error ? e.message : "Could not save scene");
    }
  };


  return (
    <div className="space-y-6">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Back
        </button>
      )}
      {/* Scene name — mandatory in wizard flow. Reference flow already collected
          it in Step 3 but we let the user edit it here too. */}
      {!isReferenceFlow && (
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
          <Label htmlFor="brand-scene-name" className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Scene name
          </Label>
          <Input
            id="brand-scene-name"
            value={answers.name ?? ""}
            onChange={(e) => onNameChange?.(e.target.value.slice(0, BRAND_SCENE_NAME_MAX))}
            placeholder="e.g. Lingerie morning bedroom"
            maxLength={BRAND_SCENE_NAME_MAX}
            className="mt-2"
          />
          <p className="mt-2 text-[11px] text-muted-foreground leading-relaxed">
            Required — this is how the scene appears in your library.
          </p>
        </div>
      )}

      {/* Hero — generate / pick / save */}
      {phase === "idle" && (
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Ready to generate
          </div>
          <div className="mt-1 text-base font-semibold tracking-tight">
            {BRAND_SCENE_VARIATIONS_PER_GENERATION} variations · {BRAND_SCENE_GENERATION_COST} credits
          </div>
          <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
            Each generation costs {BRAND_SCENE_GENERATION_COST} credits. Saving the variation you like is free.
          </p>
          {isReferenceFlow && referenceImageUrl && (
            <div className="mt-3">
              <ReferenceThumb />
            </div>
          )}
          {previewProduct && (
            <div className="mt-3 rounded-xl border border-border/60 bg-muted/30 p-3">
              <div className="flex items-start gap-3">
                <img
                  src={previewProduct.url}
                  alt={previewProduct.label}
                  className="w-14 h-14 rounded-md object-cover bg-background flex-shrink-0"
                  loading="lazy"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {customProduct ? "Your product · preview stand-in" : "Preview stand-in"}
                  </div>
                  <div className="text-[12px] font-medium text-foreground/90 truncate mt-0.5">
                    {customProduct ? previewProduct.label : `Sample ${previewProduct.label}`}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">
                    Used only to preview scale and placement. Your saved scene works with any of your products — they replace this when you apply the scene later.
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3 pl-[68px] text-[11px]">
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="text-primary hover:underline font-medium"
                >
                  {customProduct ? "Choose a different product" : "Use my product instead"}
                </button>
                {customProduct && (
                  <button
                    type="button"
                    onClick={() => setCustomProduct(null)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Reset to sample
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="mt-5">
            <Button
              size="pill"
              onClick={handleGenerate}
              disabled={!nameValid || submitting}
              className="gap-2 w-full sm:w-auto whitespace-normal text-center"
            >
              <Sparkles className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">
                Generate {BRAND_SCENE_VARIATIONS_PER_GENERATION} variations · {BRAND_SCENE_GENERATION_COST} credits
              </span>
              <span className="sm:hidden">
                Generate · {BRAND_SCENE_GENERATION_COST} credits
              </span>
            </Button>
            {!nameValid && (
              <p className="mt-2 text-[11px] text-muted-foreground">
                Name this scene to enable generation.
              </p>
            )}
          </div>
        </div>
      )}


      {phase === "generating" && <BrandSceneGenerateLoading />}

      {phase === "picking" && variations.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-6 text-center space-y-3">
          <p className="text-sm text-foreground/80">
            No variations to show — they may have been cleared after an edit
          </p>
          <Button
            size="pill"
            onClick={handleGenerate}
            disabled={!nameValid || submitting}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Regenerate · {BRAND_SCENE_GENERATION_COST} credits
          </Button>
        </div>
      )}


      {(phase === "picking" || phase === "saving") && variations.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 space-y-5">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Pick your favorite
            </div>
            <div className="mt-1 text-base font-semibold tracking-tight">
              {sceneName}
            </div>
            <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
              Select the variation that best matches what you want. Tap the expand icon to preview full-size.
            </p>
            {isReferenceFlow && referenceImageUrl && (
              <div className="mt-3">
                <ReferenceThumb />
              </div>
            )}
          </div>

          <BrandSceneVariationGrid
            variations={variations}
            selectedUrl={selectedUrl}
            onSelect={(url) => {
              if (phase !== "picking") return;
              setSelectedUrl(url);
              if (promptHash) {
                onCacheChange?.({ promptHash, variations, selectedUrl: url });
              }
            }}
            onPreview={(idx) => setPreviewIndex(idx)}
          />

          <div className="flex flex-col items-stretch gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handleRegenerate}
              disabled={phase === "saving"}
              className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center justify-center gap-1.5 disabled:opacity-40"
            >
              <RefreshCw className="w-3 h-3" />
              Regenerate · {BRAND_SCENE_GENERATION_COST} credits
            </button>
            <Button
              size="pill"
              onClick={handleSave}
              disabled={!selectedUrl || phase === "saving"}
              className="gap-2 w-full sm:w-auto"
            >
              {phase === "saving" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Save to Brand Scenes
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

      <AlertDialog open={confirmRegenOpen} onOpenChange={setConfirmRegenOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Generate {BRAND_SCENE_VARIATIONS_PER_GENERATION} new variations?</AlertDialogTitle>
            <AlertDialogDescription>
              This will cost {BRAND_SCENE_GENERATION_COST} credits. Your current variations will be replaced.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRegenerateConfirmed}>
              Generate · {BRAND_SCENE_GENERATION_COST} credits
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {variations.length > 0 && (
        <ImageLightbox
          images={variations.map((v) => v.url)}
          currentIndex={previewIndex ?? 0}
          open={previewIndex !== null}
          onClose={() => setPreviewIndex(null)}
          onNavigate={(idx) => setPreviewIndex(idx)}
          onSelect={
            phase === "picking"
              ? (idx) => {
                  const url = variations[idx]?.url;
                  if (!url) return;
                  setSelectedUrl(url);
                  if (promptHash) {
                    onCacheChange?.({ promptHash, variations, selectedUrl: url });
                  }
                }
              : undefined
          }
          selectedIndices={
            new Set(
              variations
                .map((v, i) => (v.url === selectedUrl ? i : -1))
                .filter((i) => i >= 0),
            )
          }
          productName={sceneName}
        />
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
