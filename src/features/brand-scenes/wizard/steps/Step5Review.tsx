import {
  BRAND_SCENE_GENERATION_COST,
  BRAND_SCENE_VARIATIONS_PER_GENERATION,
} from "../../constants";
import type { BrandSceneAnswers } from "../../types";

export function Step5Review({ answers }: { answers: BrandSceneAnswers }) {
  const isReference = answers.source === "reference";

  return (
    <div className="space-y-5">
      {isReference ? (
        <ReferenceSummary answers={answers} />
      ) : (
        <CostNotice />
      )}

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

function CostNotice() {
  return (
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
  );
}

function ReferenceSummary({ answers }: { answers: BrandSceneAnswers }) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {answers.reference_preview_url && (
        <div className="aspect-[4/5] bg-muted">
          <img
            src={answers.reference_preview_url}
            alt={answers.name ?? "Reference"}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-5 space-y-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Scene name
          </div>
          <div className="mt-1 text-base font-semibold tracking-tight">
            {answers.name || <span className="text-muted-foreground">(missing)</span>}
          </div>
        </div>
        {answers.placement_hint && (
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Product placement
            </div>
            <p className="mt-1 text-sm text-foreground/80 leading-relaxed">
              {answers.placement_hint}
            </p>
          </div>
        )}
        {answers.note && (
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Extra direction
            </div>
            <p className="mt-1 text-sm text-foreground/80 leading-relaxed">
              {answers.note}
            </p>
          </div>
        )}
        <p className="text-xs text-muted-foreground leading-relaxed pt-2 border-t border-border">
          Saving is free. Your reference image will be sent as a visual
          composition guide during generation — the AI will replicate framing,
          lighting, and environment while swapping in your product.
        </p>
      </div>
    </div>
  );
}
