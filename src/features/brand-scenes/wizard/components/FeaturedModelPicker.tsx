import { useState } from "react";
import { UserRound, X } from "lucide-react";
import { ModelCatalogModal } from "@/components/app/freestyle/ModelCatalogModal";
import { getOptimizedUrl } from "@/lib/imageOptimization";
import type { ModelProfile } from "@/types";
import type { BrandSceneCast } from "../../types";

interface Props {
  value: BrandSceneCast["model_ref"];
  onChange: (next: BrandSceneCast["model_ref"]) => void;
  helper?: string;
}

/**
 * Optional anchor model picker for Brand Scenes. Reuses the standard
 * ModelCatalogModal so brand and built-in models both appear with the same
 * filtering & sorting users see elsewhere in the app.
 */
export function FeaturedModelPicker({ value, onChange, helper }: Props) {
  const [open, setOpen] = useState(false);

  const handleSelect = (m: ModelProfile | null) => {
    if (!m) {
      onChange(undefined);
      return;
    }
    onChange({
      modelId: m.modelId,
      name: m.name,
      sourceImageUrl: m.sourceImageUrl || m.previewUrl,
      previewUrl: m.previewUrl,
      gender: m.gender,
      ageRange: m.ageRange,
      origin: m.modelId.startsWith("user-") ? "brand" : "built_in",
    });
  };

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

  return (
    <>
      {value ? (
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
            onClick={() => setOpen(true)}
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
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-border bg-transparent p-3 text-left hover:border-foreground/40 hover:bg-muted/40"
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <UserRound className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Choose featured model</p>
            <p className="text-[11px] text-muted-foreground">
              {helper ??
                "Optional — lock the same face across all 3 variations"}
            </p>
          </div>
        </button>
      )}

      <ModelCatalogModal
        open={open}
        onOpenChange={setOpen}
        selectedModel={currentProfile}
        onSelect={(m) => {
          handleSelect(m);
          setOpen(false);
        }}
      />
    </>
  );
}
