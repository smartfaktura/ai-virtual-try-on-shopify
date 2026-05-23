import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Chip, AddChip } from "../components/Chip";
import type { ScenePalette } from "../constants/scene";

export function ChipRow<T extends string>({
  options,
  current,
  onPick,
}: {
  options: readonly { value: T; label: string }[];
  current: T | undefined;
  onPick: (v: T | undefined) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <Chip
          key={o.value}
          active={current === o.value}
          onClick={() => onPick(current === o.value ? undefined : o.value)}
        >
          {o.label}
        </Chip>
      ))}
    </div>
  );
}

export function ChipRowWithOther<T extends string>({
  options,
  current,
  custom,
  onPick,
  onCustom,
  placeholder = "Describe your own",
}: {
  options: readonly { value: T; label: string }[];
  current: T | undefined;
  custom: string | undefined;
  onPick: (v: T | undefined) => void;
  onCustom: (c: string | undefined) => void;
  placeholder?: string;
}) {
  const [showCustom, setShowCustom] = useState(!!custom);
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <Chip
            key={o.value}
            active={current === o.value && !custom}
            onClick={() => {
              setShowCustom(false);
              if (custom) onCustom(undefined);
              onPick(current === o.value ? undefined : o.value);
            }}
          >
            {o.label}
          </Chip>
        ))}
        {!showCustom && (
          <AddChip
            onClick={() => {
              setShowCustom(true);
              if (current) onPick(undefined);
            }}
            label="Other"
          />
        )}
      </div>
      {showCustom && (
        <Input
          value={custom ?? ""}
          maxLength={120}
          autoFocus
          onChange={(e) => {
            const v = e.target.value;
            onCustom(v.trim() ? v : undefined);
          }}
          onBlur={() => {
            if (!custom) setShowCustom(false);
          }}
          placeholder={placeholder}
          className="rounded-xl mt-2"
        />
      )}
    </div>
  );
}

export function PaletteBlock({
  presets,
  preset,
  custom,
  onPreset,
  onCustom,
}: {
  presets: readonly { value: ScenePalette; label: string }[];
  preset?: ScenePalette;
  custom?: string;
  onPreset: (p: ScenePalette | undefined) => void;
  onCustom: (c: string) => void;
}) {
  const [showCustom, setShowCustom] = useState(!!custom);
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {presets.map((p) => (
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
        />
      )}
    </div>
  );
}
