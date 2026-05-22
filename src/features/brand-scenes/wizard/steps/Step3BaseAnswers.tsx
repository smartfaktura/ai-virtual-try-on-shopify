import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Chip, AddChip } from "../components/Chip";
import type { BrandSceneBaseAnswers } from "../../types";
import {
  SCENE_SETTINGS,
  SCENE_WEATHER,
  SCENE_SEASONS,
  SCENE_LENSES,
  SCENE_DEPTH_OF_FIELD,
  SCENE_PALETTES,
  SCENE_FINISHES,
  type SceneWeather,
  type SceneSeason,
  type SceneLens,
  type SceneDepthOfField,
  type ScenePalette,
  type SceneFinish,
} from "../constants/scene";

interface Props {
  value: BrandSceneBaseAnswers;
  onChange: (patch: Partial<BrandSceneBaseAnswers>) => void;
}

const SCENE_TYPES = [
  "Indoor studio",
  "Indoor lifestyle",
  "Outdoor location",
  "Outdoor nature",
  "Lifestyle moment",
  "Architectural",
  "Tabletop / Flat lay",
] as const;

const MOODS = [
  "Calm",
  "Energetic",
  "Quiet",
  "Playful",
  "Confident",
  "Intimate",
  "Cinematic",
] as const;

const LIGHTINGS = [
  "Soft window",
  "Golden hour",
  "Hard noon sun",
  "Studio softbox",
  "Overcast",
  "Candlelit",
  "Neon / mixed",
] as const;

const FRAMINGS = [
  "Wide 3/4",
  "Tight crop",
  "Top-down",
  "Eye-level",
  "Low angle",
  "Over-shoulder",
] as const;

const TIMES_OF_DAY: { value: "morning" | "midday" | "evening" | "night"; label: string }[] = [
  { value: "morning", label: "Morning" },
  { value: "midday", label: "Midday" },
  { value: "evening", label: "Evening" },
  { value: "night", label: "Night" },
];

export function Step3BaseAnswers({ value, onChange }: Props) {
  return (
    <div className="space-y-7">
      <PillField
        label="Scene type"
        required
        presets={SCENE_TYPES as unknown as readonly string[]}
        current={value.aesthetic ?? ""}
        placeholder="Describe your own scene type"
        onChange={(next) => onChange({ aesthetic: next })}
      />

      <PillField
        label="Setting / environment"
        presets={SCENE_SETTINGS as unknown as readonly string[]}
        current={value.setting ?? ""}
        placeholder="Describe the setting"
        onChange={(next) => onChange({ setting: next })}
      />

      <SinglePillBlock
        label="Weather / atmosphere"
        options={SCENE_WEATHER}
        current={value.weather}
        onChange={(v) => onChange({ weather: v as SceneWeather | undefined })}
      />

      <SinglePillBlock
        label="Season"
        options={SCENE_SEASONS}
        current={value.season}
        onChange={(v) => onChange({ season: v as SceneSeason | undefined })}
      />

      <Block label="Time of day">
        <div className="flex flex-wrap gap-2">
          {TIMES_OF_DAY.map((t) => (
            <Chip
              key={t.value}
              active={value.time_of_day === t.value}
              onClick={() =>
                onChange({
                  time_of_day:
                    value.time_of_day === t.value ? undefined : t.value,
                })
              }
            >
              {t.label}
            </Chip>
          ))}
        </div>
      </Block>

      <PillField
        label="Mood"
        presets={MOODS as unknown as readonly string[]}
        current={value.mood ?? ""}
        placeholder="Describe the mood"
        onChange={(next) => onChange({ mood: next })}
      />

      <PillField
        label="Lighting"
        presets={LIGHTINGS as unknown as readonly string[]}
        current={value.lighting ?? ""}
        placeholder="Describe the lighting"
        onChange={(next) => onChange({ lighting: next })}
      />

      <SinglePillBlock
        label="Camera & lens"
        options={SCENE_LENSES}
        current={value.lens}
        onChange={(v) => onChange({ lens: v as SceneLens | undefined })}
      />

      <SinglePillBlock
        label="Depth of field"
        options={SCENE_DEPTH_OF_FIELD}
        current={value.depth_of_field}
        onChange={(v) =>
          onChange({ depth_of_field: v as SceneDepthOfField | undefined })
        }
      />

      <PillField
        label="Framing"
        presets={FRAMINGS as unknown as readonly string[]}
        current={value.framing ?? ""}
        placeholder="Describe the framing"
        onChange={(next) => onChange({ framing: next })}
      />

      <PaletteBlock
        preset={value.palette_preset}
        custom={value.palette_custom}
        onPreset={(p) =>
          onChange({ palette_preset: p, palette_custom: undefined })
        }
        onCustom={(c) =>
          onChange({ palette_custom: c, palette_preset: undefined })
        }
      />

      <SinglePillBlock
        label="Finish / film look"
        options={SCENE_FINISHES}
        current={value.finish}
        onChange={(v) => onChange({ finish: v as SceneFinish | undefined })}
      />

      <Block label="Avoid in this scene">
        <Textarea
          value={value.avoid ?? ""}
          maxLength={240}
          rows={2}
          onChange={(e) => onChange({ avoid: e.target.value })}
          placeholder="e.g. no visible logos, no children, no text overlays"
          className="rounded-xl resize-none"
        />
      </Block>

      <Block label="Notes">
        <Textarea
          value={value.notes ?? ""}
          maxLength={600}
          rows={3}
          onChange={(e) => onChange({ notes: e.target.value })}
          placeholder="Anything else worth anchoring across every scene."
          className="rounded-xl resize-none"
        />
      </Block>

      <p className="text-[11px] text-muted-foreground/80">
        Aspect ratio is locked to 4:5 (portrait) — the standard preview format.
      </p>
    </div>
  );
}

function Block({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2.5">
      <Label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
        {required && <span className="text-foreground/60 ml-1">·</span>}
      </Label>
      {children}
    </div>
  );
}

function SinglePillBlock<T extends string>({
  label,
  options,
  current,
  onChange,
}: {
  label: string;
  options: readonly { value: T; label: string }[];
  current: T | undefined;
  onChange: (v: T | undefined) => void;
}) {
  return (
    <Block label={label}>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <Chip
            key={o.value}
            active={current === o.value}
            onClick={() => onChange(current === o.value ? undefined : o.value)}
          >
            {o.label}
          </Chip>
        ))}
      </div>
    </Block>
  );
}

function PaletteBlock({
  preset,
  custom,
  onPreset,
  onCustom,
}: {
  preset?: ScenePalette;
  custom?: string;
  onPreset: (p: ScenePalette | undefined) => void;
  onCustom: (c: string) => void;
}) {
  const [showCustom, setShowCustom] = useState(!!custom);
  return (
    <Block label="Color palette anchor">
      <div className="flex flex-wrap gap-2">
        {SCENE_PALETTES.map((p) => (
          <Chip
            key={p.value}
            active={preset === p.value && !custom}
            onClick={() => {
              setShowCustom(false);
              onPreset(preset === p.value ? undefined : p.value);
            }}
          >
            {p.label}
          </Chip>
        ))}
        {!showCustom && <AddChip onClick={() => setShowCustom(true)} />}
      </div>
      {showCustom && (
        <Input
          value={custom ?? ""}
          maxLength={120}
          onChange={(e) => onCustom(e.target.value)}
          placeholder="Describe your own palette (e.g. dusty rose + cocoa)"
          className="rounded-xl mt-2"
          autoFocus
        />
      )}
    </Block>
  );
}

function PillField({
  label,
  required,
  presets,
  current,
  placeholder,
  onChange,
}: {
  label: string;
  required?: boolean;
  presets: readonly string[];
  current: string;
  placeholder: string;
  onChange: (next: string) => void;
}) {
  const isPreset = presets.includes(current);
  const [showCustom, setShowCustom] = useState(current.length > 0 && !isPreset);

  const select = (preset: string) => {
    setShowCustom(false);
    onChange(preset);
  };

  const openCustom = () => {
    setShowCustom(true);
    if (isPreset) onChange("");
  };

  return (
    <div className="space-y-2.5">
      <Label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
        {required && <span className="text-foreground/60 ml-1">·</span>}
      </Label>
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <Chip
            key={preset}
            active={current === preset}
            onClick={() => select(preset)}
          >
            {preset}
          </Chip>
        ))}
        {!showCustom && <AddChip onClick={openCustom} />}
      </div>
      {showCustom && (
        <Input
          value={isPreset ? "" : current}
          maxLength={160}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="rounded-xl"
          autoFocus
        />
      )}
    </div>
  );
}
