import { useMemo, useState } from "react";
import { Plus, Sparkles, UserRound, Users, X } from "lucide-react";
import { ModelCatalogModal } from "@/components/app/freestyle/ModelCatalogModal";
import { getOptimizedUrl } from "@/lib/imageOptimization";
import { mockModels } from "@/data/mockData";
import { useModelSortOrder } from "@/hooks/useModelSortOrder";
import { cn } from "@/lib/utils";
import type { ModelProfile } from "@/types";
import type { BrandSceneCast } from "../../types";

type ModelRef = NonNullable<BrandSceneCast["model_refs"]>[number];

interface Props {
  /** Cast preset — drives number of slots. */
  preset?: BrandSceneCast["preset"];
  refs: ModelRef[]; // normalized array (may be empty)
  onChange: (next: ModelRef[]) => void;
}

/** Curated quick-pick: Freya first, then mixed women + men. */
const QUICK_PICK_IDS = [
  "model_029", // Freya — Suggested (slot 0)
  "model_018", // Anders — Suggested for slot 1 (male)
  "model_031", // Zara
  "model_051", // Jordan
  "model_033", // Sienna
  "model_036", // Marcus
] as const;

const SLOT_SUGGESTED: Record<number, string> = {
  0: "model_029", // Freya
  1: "model_018", // Anders
  2: "model_036", // Marcus
};

function slotsForPreset(preset?: BrandSceneCast["preset"]): number {
  if (preset === "two") return 2;
  if (preset === "group") return 3;
  return 1;
}

function profileToRef(m: ModelProfile): ModelRef {
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

function refToProfile(r: ModelRef): ModelProfile {
  return {
    modelId: r.modelId,
    name: r.name,
    gender: (r.gender as any) || "female",
    bodyType: "average" as any,
    ageRange: (r.ageRange as any) || "adult",
    ethnicity: "",
    previewUrl: r.previewUrl,
    sourceImageUrl: r.sourceImageUrl,
  };
}

export function FeaturedModelPicker({ preset, refs, onChange }: Props) {
  const slotCount = slotsForPreset(preset);
  const [openSlot, setOpenSlot] = useState<number | null>(null);
  const [initialView, setInitialView] = useState<"all" | "brand">("all");
  const { applyOverrides, applyNameOverrides, filterHidden } = useModelSortOrder();

  const pool = useMemo(
    () => filterHidden(applyNameOverrides(applyOverrides(mockModels))),
    [applyOverrides, applyNameOverrides, filterHidden],
  );
  const poolById = useMemo(() => new Map(pool.map((m) => [m.modelId, m])), [pool]);

  // ── Slot mutation helpers ──
  const setSlot = (idx: number, ref: ModelRef | null) => {
    const next = [...refs];
    // Pad with undefined for sparse indexes
    while (next.length <= idx) (next as any[]).push(undefined);
    if (ref) next[idx] = ref;
    else next.splice(idx, 1);
    // Strip undefined holes
    onChange((next as (ModelRef | undefined)[]).filter(Boolean) as ModelRef[]);
  };

  const openCatalog = (slot: number, view: "all" | "brand" = "all") => {
    setInitialView(view);
    setOpenSlot(slot);
  };

  // ── Render ──
  const slots = Array.from({ length: slotCount }, (_, i) => refs[i]);
  const helperLine =
    slotCount === 1
      ? "Optional — lock this face across all 3 variations"
      : `Optional — pick up to ${slotCount} anchor faces, others are auto-cast`;

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-muted-foreground">{helperLine}</p>

      {slots.map((slot, idx) => (
        <SlotBlock
          key={idx}
          slotIndex={idx}
          slot={slot}
          slotCount={slotCount}
          pool={pool}
          poolById={poolById}
          onPick={(ref) => setSlot(idx, ref)}
          onClear={() => setSlot(idx, null)}
          onOpenAll={() => openCatalog(idx, "all")}
          onOpenBrand={() => openCatalog(idx, "brand")}
        />
      ))}

      <ModelCatalogModal
        open={openSlot !== null}
        onOpenChange={(o) => { if (!o) setOpenSlot(null); }}
        selectedModel={
          openSlot !== null && refs[openSlot] ? refToProfile(refs[openSlot]) : null
        }
        initialQuickView={initialView}
        onSelect={(m) => {
          if (openSlot !== null) setSlot(openSlot, m ? profileToRef(m) : null);
          setOpenSlot(null);
        }}
      />
    </div>
  );
}

/* ────────────────────────── Slot block ────────────────────────── */

function SlotBlock({
  slotIndex,
  slot,
  slotCount,
  pool,
  poolById,
  onPick,
  onClear,
  onOpenAll,
  onOpenBrand,
}: {
  slotIndex: number;
  slot: ModelRef | undefined;
  slotCount: number;
  pool: ModelProfile[];
  poolById: Map<string, ModelProfile>;
  onPick: (ref: ModelRef) => void;
  onClear: () => void;
  onOpenAll: () => void;
  onOpenBrand: () => void;
}) {
  // Selected state — compact card
  if (slot) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
        {slotCount > 1 && (
          <span className="shrink-0 text-[10px] uppercase tracking-widest text-muted-foreground">
            #{slotIndex + 1}
          </span>
        )}
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-muted">
          <img
            src={getOptimizedUrl(slot.previewUrl, { quality: 60 })}
            alt={slot.name}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{slot.name}</p>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
            {slot.origin === "brand" ? "Brand model" : "Built-in"} ·{" "}
            {slotCount > 1 ? `anchor ${slotIndex + 1}` : "anchor identity"}
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenAll}
          className="rounded-md px-2.5 py-1.5 text-[11px] font-medium text-foreground hover:bg-muted"
        >
          Change
        </button>
        <button
          type="button"
          onClick={onClear}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Remove featured model"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  // Empty state — quick-pick grid + actions for THIS slot
  // Order quick-picks so suggested for this slot comes first
  const suggestedId = SLOT_SUGGESTED[slotIndex] ?? QUICK_PICK_IDS[0];
  const ordered = [
    suggestedId,
    ...QUICK_PICK_IDS.filter((id) => id !== suggestedId),
  ];
  const quickPicks = ordered
    .map((id) => poolById.get(id))
    .filter((m): m is ModelProfile => !!m)
    .slice(0, 6);

  return (
    <div className="rounded-2xl border border-dashed border-border p-3 space-y-3">
      {slotCount > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Anchor {slotIndex + 1} of {slotCount}
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-muted-foreground/70">
            <Plus className="h-3 w-3" /> Optional
          </span>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {quickPicks.map((m) => {
          const isSuggested = m.modelId === suggestedId;
          return (
            <button
              key={m.modelId}
              type="button"
              onClick={() => onPick(profileToRef(m))}
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
          onClick={onOpenAll}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-[11px] font-medium hover:border-foreground/40 hover:bg-muted"
        >
          <UserRound className="h-3.5 w-3.5" />
          See all models
        </button>
        <button
          type="button"
          onClick={onOpenBrand}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-[11px] font-medium hover:border-foreground/40 hover:bg-muted"
        >
          <Users className="h-3.5 w-3.5" />
          Use a Brand Model
        </button>
      </div>
    </div>
  );
}
