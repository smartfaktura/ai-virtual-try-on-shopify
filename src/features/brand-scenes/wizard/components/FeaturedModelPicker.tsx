import { useMemo, useState } from "react";
import { Sparkles, UserRound, Users, X } from "lucide-react";
import { ModelCatalogModal } from "@/components/app/freestyle/ModelCatalogModal";
import { getOptimizedUrl } from "@/lib/imageOptimization";
import { mockModels } from "@/data/mockData";
import { useModelSortOrder } from "@/hooks/useModelSortOrder";
import { cn } from "@/lib/utils";
import type { ModelProfile } from "@/types";
import type { BrandSceneCast } from "../../types";

interface Props {
  value: BrandSceneCast["model_ref"];
  onChange: (next: BrandSceneCast["model_ref"]) => void;
  helper?: string;
}

/** Curated quick-pick: Freya first, then mixed women + men. */
const QUICK_PICK_IDS = [
  "model_029", // Freya — Suggested
  "model_018", // Anders
  "model_031", // Zara
  "model_051", // Jordan
  "model_033", // Sienna
  "model_036", // Marcus
] as const;

const SUGGESTED_ID = "model_029";

function profileToRef(m: ModelProfile): NonNullable<BrandSceneCast["model_ref"]> {
  return {
    modelId: m.modelId,
    name: m.name,
    sourceImageUrl: m.sourceImageUrl || m.previewUrl,
    previewUrl: m.previewUrl,
    gender: m.gender,
    ageRange: m.ageRange,
    origin: m.modelId.startsWith("user-") ? "brand" : "built_in",
  };
}

export function FeaturedModelPicker({ value, onChange, helper }: Props) {
  const [open, setOpen] = useState(false);
  const [initialView, setInitialView] = useState<"all" | "brand">("all");
  const { applyOverrides, applyNameOverrides, filterHidden } = useModelSortOrder();

  const quickPicks = useMemo(() => {
    const pool = filterHidden(applyNameOverrides(applyOverrides(mockModels)));
    const byId = new Map(pool.map((m) => [m.modelId, m]));
    return QUICK_PICK_IDS.map((id) => byId.get(id)).filter(
      (m): m is ModelProfile => !!m,
    );
  }, [applyOverrides, applyNameOverrides, filterHidden]);

  const currentProfile: ModelProfile | null = value
    ? {
        modelId: value.modelId,
        name: value.name,
        gender: (value.gender as any) || "female",
        bodyType: "average" as any,
        ageRange: (value.ageRange as any) || "adult",
        ethnicity: "",
        previewUrl: value.previewUrl,
        sourceImageUrl: value.sourceImageUrl,
      }
    : null;

  const openAll = () => {
    setInitialView("all");
    setOpen(true);
  };
  const openBrand = () => {
    setInitialView("brand");
    setOpen(true);
  };

  // ── Selected state: compact card with Change / Remove ──
  if (value) {
    return (
      <>
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-muted">
            <img
              src={getOptimizedUrl(value.previewUrl, { quality: 60 })}
              alt={value.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{value.name}</p>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
              {value.origin === "brand" ? "Brand model" : "Built-in"} · anchor
              identity
            </p>
          </div>
          <button
            type="button"
            onClick={openAll}
            className="rounded-md px-2.5 py-1.5 text-[11px] font-medium text-foreground hover:bg-muted"
          >
            Change
          </button>
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Remove featured model"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <ModelCatalogModal
          open={open}
          onOpenChange={setOpen}
          selectedModel={currentProfile}
          initialQuickView={initialView}
          onSelect={(m) => {
            onChange(m ? profileToRef(m) : undefined);
            setOpen(false);
          }}
        />
      </>
    );
  }

  // ── Empty state: quick-pick grid + actions ──
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {quickPicks.map((m) => {
          const isSuggested = m.modelId === SUGGESTED_ID;
          return (
            <button
              key={m.modelId}
              type="button"
              onClick={() => onChange(profileToRef(m))}
              className={cn(
                "group relative flex flex-col items-stretch overflow-hidden rounded-xl border bg-background text-left transition-all",
                isSuggested
                  ? "border-foreground/60 ring-1 ring-foreground/20"
                  : "border-border hover:border-foreground/40 hover:-translate-y-0.5 hover:shadow-sm",
              )}
            >
              <div className="relative aspect-square overflow-hidden bg-muted">
                <img
                  src={getOptimizedUrl(m.previewUrl, { quality: 60 })}
                  alt={m.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {isSuggested && (
                  <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-foreground px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-background">
                    <Sparkles className="h-2.5 w-2.5" />
                    Suggested
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between px-2 py-1.5">
                <p className="truncate text-[11px] font-medium">{m.name}</p>
                <span className="text-[9px] uppercase tracking-wider text-muted-foreground">
                  {m.gender === "female" ? "W" : "M"}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={openAll}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-[11px] font-medium hover:border-foreground/40 hover:bg-muted"
        >
          <UserRound className="h-3.5 w-3.5" />
          See all models
        </button>
        <button
          type="button"
          onClick={openBrand}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-[11px] font-medium hover:border-foreground/40 hover:bg-muted"
        >
          <Users className="h-3.5 w-3.5" />
          Use a Brand Model
        </button>
        {helper && (
          <span className="text-[11px] text-muted-foreground">{helper}</span>
        )}
      </div>

      <ModelCatalogModal
        open={open}
        onOpenChange={setOpen}
        selectedModel={currentProfile}
        initialQuickView={initialView}
        onSelect={(m) => {
          onChange(m ? profileToRef(m) : undefined);
          setOpen(false);
        }}
      />
    </div>
  );
}
