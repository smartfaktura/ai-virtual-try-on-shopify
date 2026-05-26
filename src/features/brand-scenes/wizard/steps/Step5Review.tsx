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
  const avoidValue = answers.base?.avoid ?? answers.negative_note ?? "";

  return (
    <div className="space-y-5">
      {isReference && <ReferenceSummary answers={answers} />}

      <SummaryCard answers={answers} />

      {avoidValue && (
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Avoid
          </div>
          <p className="mt-1 text-sm text-foreground/80 leading-relaxed">
            {avoidValue}
          </p>
        </div>
      )}
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
    { label: "Realism", value: base.realism_custom ?? metaX(REALISM_LEVELS, base.realism)?.label },
    { label: "Palette", value: palette },
    {
      label: "Color contrast",
      value: base.color_contrast_custom ?? metaX(COLOR_CONTRASTS, base.color_contrast)?.label,
    },
    { label: "Saturation", value: base.saturation_custom ?? metaX(SATURATIONS, base.saturation)?.label },
    {
      label: "Finish",
      value: base.finish_custom ?? (base.finish ? meta(SCENE_FINISHES, base.finish)?.label : undefined),
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
        { label: "Pose", value: cast.action_note ?? lookupLabel(CAST_ACTIONS, cast.action) },
        { label: "Group dynamic", value: cast.group_dynamic && humanize(cast.group_dynamic) },
        { label: "Gaze", value: cast.gaze && humanize(cast.gaze) },
        { label: "Body-part focus", value: cast.body_part_focus && humanize(cast.body_part_focus) },
        { label: "Hands on product", value: cast.hands_on_product && humanize(cast.hands_on_product) },
        { label: "Wardrobe", value: cast.wardrobe_custom ?? cast.wardrobe_color },
        { label: "Ethnicity", value: castExtras.ethnicity },
        ...CAST_EXTRAS_FIELDS.map((f) => ({
          label: f.label,
          value: castExtras[f.key],
        })),
        { label: "Cast note", value: cast.note },
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
    
    {
      label: "Reference intent",
      value: answers.reference_intent && humanize(answers.reference_intent),
    },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
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
      <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70 mb-2">
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
    <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center gap-3">
        {answers.reference_preview_url && (
          <img
            src={answers.reference_preview_url}
            alt={answers.name ?? "Reference"}
            className="w-16 h-20 rounded-md object-cover bg-muted flex-shrink-0"
            loading="lazy"
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Scene name
          </div>
          <div className="mt-0.5 text-sm font-medium text-foreground/90 truncate">
            {answers.name || (
              <span className="text-muted-foreground">(missing)</span>
            )}
          </div>
        </div>
      </div>
      {answers.note && (
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Extra direction
          </div>
          <p className="mt-1 text-sm text-foreground/80 leading-relaxed">
            {answers.note}
          </p>
        </div>
      )}
      {answers.reference_outfit?.description && (
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Outfit direction
            {answers.reference_outfit.edited_by_user ? " · edited" : " · AI"}
          </div>
          <p className="mt-1 text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
            {answers.reference_outfit.description}
          </p>
        </div>
      )}
    </div>
  );
}
