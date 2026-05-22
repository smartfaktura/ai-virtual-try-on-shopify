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

const AESTHETIC_FLAVORS = [
  "Quiet luxury",
  "Raw editorial",
  "Warm artisanal",
  "Clean minimal",
  "Sun-bleached",
  "Bold graphic",
  "Vintage film",
  "Soft natural",
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
        label="Aesthetic flavor"
        presets={AESTHETIC_FLAVORS as unknown as readonly string[]}
        current={value.mood && AESTHETIC_FLAVORS.includes(value.mood as never) ? "" : ""}
        placeholder="Describe your own aesthetic"
        onChange={() => {
          /* handled below — overridden by inline implementation */
        }}
      />

      {/* Mood */}
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
