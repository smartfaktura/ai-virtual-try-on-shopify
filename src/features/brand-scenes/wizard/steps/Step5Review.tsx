import { useState } from "react";
import {
  BRAND_SCENE_GENERATION_COST,
  BRAND_SCENE_VARIATIONS_PER_GENERATION,
} from "../../constants";
import type { BrandSceneAnswers } from "../../types";

interface Props {
  answers: BrandSceneAnswers;
  // Kept for prop compatibility; Step 3 owns the "Avoid" field now.
  onNegativeNoteChange?: (note: string) => void;
}

export function Step5Review({ answers }: Props) {
  const isReference = answers.source === "reference";
  const [showPayload, setShowPayload] = useState(false);

  // Mirror the Step 3 "Avoid in this scene" value into negative_note so the
  // existing save pipeline keeps working. Step 3 is the single source of truth.
  const avoidValue = answers.base?.avoid ?? answers.negative_note ?? "";

  return (
    <div className="space-y-5">
      {isReference ? <ReferenceSummary answers={answers} /> : <CostNotice />}

      <SummaryCard answers={answers} />

      {avoidValue && (
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Avoid
          </div>
          <p className="mt-1 text-sm text-foreground/80 leading-relaxed">
            {avoidValue}
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowPayload((v) => !v)}
        className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
      >
        {showPayload ? "− Hide payload" : "+ Show payload"}
      </button>
      {showPayload && (
        <pre className="rounded-2xl border border-border bg-muted/40 p-4 text-xs overflow-auto max-h-[320px] font-mono text-foreground/80">
{JSON.stringify(answers, null, 2)}
        </pre>
      )}
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
        returns {BRAND_SCENE_VARIATIONS_PER_GENERATION} variations. Saving is
        free; only generation deducts credits.
      </p>
    </div>
  );
}

function SummaryCard({ answers }: { answers: BrandSceneAnswers }) {
  const palette =
    answers.base?.palette_custom ?? answers.base?.palette_preset;
  const rows: { label: string; value?: string }[] = [
    { label: "Family", value: answers.module },
    { label: "Sub-family", value: answers.sub_family },
    { label: "Scene type", value: answers.base?.aesthetic },
    { label: "Setting", value: answers.base?.setting },
    { label: "Weather", value: answers.base?.weather },
    { label: "Season", value: answers.base?.season },
    { label: "Time of day", value: answers.base?.time_of_day },
    { label: "Mood", value: answers.base?.mood },
    { label: "Lighting", value: answers.base?.lighting },
    { label: "Lens", value: answers.base?.lens },
    { label: "Depth of field", value: answers.base?.depth_of_field },
    { label: "Framing", value: answers.base?.framing },
    { label: "Palette", value: palette },
    { label: "Finish", value: answers.base?.finish },
    { label: "Aspect ratio", value: "4:5 (locked)" },
    { label: "Cast", value: answers.cast?.preset },
    { label: "Interaction", value: answers.cast?.interaction },
    { label: "Wardrobe", value: answers.cast?.wardrobe_color },
    { label: "Scale", value: answers.scale?.preset },
    {
      label: "Reference intent",
      value: answers.reference_intent,
    },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-3">
        Summary
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        {rows
          .filter((r) => r.value)
          .map((r) => (
            <div key={r.label} className="contents">
              <dt className="text-muted-foreground">{r.label}</dt>
              <dd className="font-medium text-foreground/90">{r.value}</dd>
            </div>
          ))}
      </dl>
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
      <div className="p-5 space-y-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Scene name
          </div>
          <div className="mt-1 text-base font-semibold tracking-tight">
            {answers.name || (
              <span className="text-muted-foreground">(missing)</span>
            )}
          </div>
        </div>
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
      </div>
    </div>
  );
}
