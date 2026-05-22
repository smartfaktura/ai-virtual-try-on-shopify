import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Chip, AddChip } from "../components/Chip";
import type { BrandSceneBaseAnswers } from "../../types";

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

const ASPECT_RATIOS: { value: "4:5" | "1:1" | "3:4" | "16:9"; label: string }[] = [
  { value: "4:5", label: "4:5 — portrait" },
  { value: "1:1", label: "1:1 — square" },
  { value: "3:4", label: "3:4 — classic" },
  { value: "16:9", label: "16:9 — landscape" },
];

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

      <PillField
        label="Framing"
        presets={FRAMINGS as unknown as readonly string[]}
        current={value.framing ?? ""}
        placeholder="Describe the framing"
        onChange={(next) => onChange({ framing: next })}
      />

      <div className="space-y-2.5">
        <Label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Aspect ratio
        </Label>
        <div className="flex flex-wrap gap-2">
          {ASPECT_RATIOS.map((r) => (
            <Chip
              key={r.value}
              active={(value.aspect_ratio ?? "4:5") === r.value}
              onClick={() => onChange({ aspect_ratio: r.value })}
            >
              {r.label}
            </Chip>
          ))}
        </div>
      </div>

      <div className="space-y-2.5">
        <Label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Time of day
        </Label>
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
      </div>

      <div className="space-y-1.5">
        <Label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Notes
        </Label>
        <Textarea
          value={value.notes ?? ""}
          maxLength={600}
          rows={3}
          onChange={(e) => onChange({ notes: e.target.value })}
          placeholder="Anything else worth anchoring across every scene."
          className="rounded-xl resize-none"
        />
      </div>
    </div>
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
