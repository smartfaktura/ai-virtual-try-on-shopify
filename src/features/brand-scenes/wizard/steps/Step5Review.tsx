import {
  BRAND_SCENE_GENERATION_COST,
  BRAND_SCENE_VARIATIONS_PER_GENERATION,
} from "../../constants";
import type { BrandSceneAnswers } from "../../types";

export function Step5Review({ answers }: { answers: BrandSceneAnswers }) {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Generation cost
        </div>
        <div className="mt-1 text-base font-semibold tracking-tight">
          {BRAND_SCENE_GENERATION_COST} credits →{" "}
          {BRAND_SCENE_VARIATIONS_PER_GENERATION} variations to choose from
        </div>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
          Generating this scene deducts {BRAND_SCENE_GENERATION_COST} credits and
          returns {BRAND_SCENE_VARIATIONS_PER_GENERATION} variations. You pick
          which ones to keep — saving is free, only generation deducts credits.
        </p>
      </div>

      <div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2">
          Payload preview
        </div>
        <pre className="rounded-2xl border border-border bg-muted/40 p-4 text-xs overflow-auto max-h-[320px] font-mono text-foreground/80">
{JSON.stringify(answers, null, 2)}
        </pre>
      </div>
    </div>
  );
}
