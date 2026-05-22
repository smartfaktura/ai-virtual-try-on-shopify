import { useState } from "react";
import {
  BRAND_SCENE_GENERATION_COST,
  BRAND_SCENE_VARIATIONS_PER_GENERATION,
} from "../../constants";
import type { BrandSceneAnswers } from "../../types";
import {
  SCENE_EXTRAS_FIELDS,
  CAST_EXTRAS_FIELDS,
} from "../constants/extras";
import {
  CAST_PRESETS,
  CAST_GENDERS,
  CAST_AGES,
  CAST_VIBES,
  CAST_INTERACTIONS,
  CAST_ACTIONS,
} from "../constants/cast";
import { SCENE_PALETTES, SCENE_FINISHES, meta } from "../constants/scene";
import {
  BRAND_VOICES,
  AESTHETIC_ERAS,
  REALISM_LEVELS,
  PROP_DENSITY_LABELS,
  COLOR_CONTRASTS,
  SATURATIONS,
  metaX,
} from "../constants/sceneExtras";
import { SCENE_TYPES } from "../registry/settingsBySubfamily";

interface Props {
  answers: BrandSceneAnswers;
  onNegativeNoteChange?: (note: string) => void;
}

export function Step5Review({ answers }: Props) {
  const isReference = answers.source === "reference";
  const [showPayload, setShowPayload] = useState(false);
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

type Row = { label: string; value?: string | null };

function truncate(v: string, max = 80): string {
  return v.length > max ? `${v.slice(0, max - 1)}…` : v;
}

function lookupLabel<T extends { value: string; label: string }>(
  options: readonly T[],
  value: string | undefined,
): string | undefined {
  if (!value) return undefined;
  return options.find((o) => o.value === value)?.label ?? value;
}

function humanize(s: string): string {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function joinLabels<T extends { value: string; label: string }>(
  options: readonly T[],
  values: string[] | undefined,
): string | undefined {
  if (!values?.length) return undefined;
  return values
    .map((v) => options.find((o) => o.value === v)?.label ?? v)
    .join(", ");
}

function SummaryCard({ answers }: { answers: BrandSceneAnswers }) {
  const base = answers.base ?? {};
  const cast = answers.cast;
  const sceneExtras = base.extras ?? {};
  const castExtras = cast?.extras ?? {};

  const palette =
    base.palette_custom ??
    (base.palette_preset
      ? meta(SCENE_PALETTES, base.palette_preset)?.label
      : undefined);

  const sceneRows: Row[] = [
    { label: "Family", value: answers.module && humanize(answers.module) },
    { label: "Sub-family", value: answers.sub_family && humanize(answers.sub_family) },
    {
      label: "Scene type",
      value: lookupLabel(SCENE_TYPES, base.scene_type),
    },
    { label: "Setting", value: base.setting },
    { label: "Weather", value: base.weather && humanize(base.weather) },
    {
      label: "Season",
      value:
        base.season && base.season !== "seasonless" ? humanize(base.season) : undefined,
    },
    {
      label: "Prop density",
      value:
        typeof base.prop_density === "number"
          ? PROP_DENSITY_LABELS[base.prop_density]
          : undefined,
    },
  ];

  const lookRows: Row[] = [
    { label: "Brand voice", value: metaX(BRAND_VOICES, base.brand_voice)?.label },
    { label: "Era", value: metaX(AESTHETIC_ERAS, base.aesthetic_era)?.label },
    { label: "Realism", value: metaX(REALISM_LEVELS, base.realism)?.label },
    { label: "Palette", value: palette },
    {
      label: "Color contrast",
      value: metaX(COLOR_CONTRASTS, base.color_contrast)?.label,
    },
    { label: "Saturation", value: metaX(SATURATIONS, base.saturation)?.label },
    {
      label: "Finish",
      value: base.finish ? meta(SCENE_FINISHES, base.finish)?.label : undefined,
    },
    ...SCENE_EXTRAS_FIELDS.map((f) => ({
      label: f.label,
      value: sceneExtras[f.key],
    })),
    { label: "Notes", value: base.notes },
  ];

  const castRows: Row[] = cast
    ? [
        { label: "Cast", value: lookupLabel(CAST_PRESETS, cast.preset) },
        { label: "Gender", value: joinLabels(CAST_GENDERS, cast.gender) },
        { label: "Age", value: joinLabels(CAST_AGES, cast.age) },
        { label: "Vibe", value: lookupLabel(CAST_VIBES, cast.vibe) },
        { label: "Interaction", value: lookupLabel(CAST_INTERACTIONS, cast.interaction) },
        { label: "Action", value: lookupLabel(CAST_ACTIONS, cast.action) },
        { label: "Group dynamic", value: cast.group_dynamic && humanize(cast.group_dynamic) },
        { label: "Gaze", value: cast.gaze && humanize(cast.gaze) },
        { label: "Body-part focus", value: cast.body_part_focus && humanize(cast.body_part_focus) },
        { label: "Hands on product", value: cast.hands_on_product && humanize(cast.hands_on_product) },
        { label: "Wardrobe", value: cast.wardrobe_custom ?? cast.wardrobe_color },
        ...CAST_EXTRAS_FIELDS.map((f) => ({
          label: f.label,
          value: castExtras[f.key],
        })),
      ]
    : [];

  const outputRows: Row[] = [
    { label: "Scale", value: answers.scale?.preset && humanize(answers.scale.preset) },
    {
      label: "Dimensions",
      value: answers.scale?.dimensions
        ? `${answers.scale.dimensions.w} × ${answers.scale.dimensions.h}${
            answers.scale.dimensions.d ? ` × ${answers.scale.dimensions.d}` : ""
          } ${answers.scale.dimensions.units}`
        : undefined,
    },
    { label: "Aspect ratio", value: "4:5 (locked)" },
    {
      label: "Reference intent",
      value: answers.reference_intent && humanize(answers.reference_intent),
    },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        Summary
      </div>
      <Bucket title="Scene" rows={sceneRows} />
      <Bucket title="Look & light" rows={lookRows} />
      <Bucket title="Cast" rows={castRows} />
      <Bucket title="Output" rows={outputRows} />
    </div>
  );
}

function Bucket({ title, rows }: { title: string; rows: Row[] }) {
  const filtered = rows.filter((r) => r.value && String(r.value).trim());
  if (!filtered.length) return null;
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70 mb-2">
        {title}
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
        {filtered.map((r) => (
          <div key={r.label} className="contents">
            <dt className="text-muted-foreground">{r.label}</dt>
            <dd className="font-medium text-foreground/90">
              {truncate(String(r.value))}
            </dd>
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
