import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BRAND_SCENE_GENERATION_COST,
  BRAND_SCENE_VARIATIONS_PER_GENERATION,
} from "../../constants";
import type { BrandSceneAnswers } from "../../types";

interface Props {
  answers: BrandSceneAnswers;
  onNegativeNoteChange: (note: string) => void;
}

export function Step5Review({ answers, onNegativeNoteChange }: Props) {
  const isReference = answers.source === "reference";
  const [showPayload, setShowPayload] = useState(false);

  return (
    <div className="space-y-5">
      {isReference ? <ReferenceSummary answers={answers} /> : <CostNotice />}

      <SummaryCard answers={answers} />

      <div>
        <Label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Avoid in every scene <span className="opacity-60">(optional)</span>
        </Label>
        <Textarea
          value={answers.negative_note ?? ""}
          maxLength={240}
          rows={2}
          onChange={(e) => onNegativeNoteChange(e.target.value)}
          placeholder="e.g. no visible logos, no children, no text overlays"
          className="mt-2 rounded-xl resize-none"
        />
      </div>

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
  const rows: { label: string; value?: string }[] = [
    { label: "Family", value: answers.module },
    { label: "Sub-family", value: answers.sub_family },
    { label: "Scene type", value: answers.base?.aesthetic },
    { label: "Mood", value: answers.base?.mood },
    { label: "Lighting", value: answers.base?.lighting },
    { label: "Time of day", value: answers.base?.time_of_day },
    { label: "Aspect ratio", value: answers.base?.aspect_ratio ?? "4:5" },
    { label: "Cast", value: answers.cast?.preset },
    { label: "Interaction", value: answers.cast?.interaction },
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
