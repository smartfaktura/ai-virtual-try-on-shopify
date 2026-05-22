import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Chip } from "./Chip";

/** Curated 24-swatch palette — broad, neutral-leaning, brand-safe. */
const SWATCHES: { label: string; hex: string }[] = [
  { label: "Warm white", hex: "#F6F1E8" },
  { label: "Cool white", hex: "#F2F4F7" },
  { label: "Ivory", hex: "#F1EAD8" },
  { label: "Putty", hex: "#D9D2C2" },
  { label: "Bone", hex: "#E8DFD0" },
  { label: "Sand", hex: "#D7C3A3" },
  { label: "Taupe", hex: "#9F8E78" },
  { label: "Sage", hex: "#A7B49A" },
  { label: "Olive", hex: "#6B6A3A" },
  { label: "Terracotta", hex: "#C57A55" },
  { label: "Clay", hex: "#A0593D" },
  { label: "Rust", hex: "#8C3E25" },
  { label: "Cobalt", hex: "#1F44A1" },
  { label: "Navy", hex: "#1B2A4E" },
  { label: "Slate", hex: "#4A5563" },
  { label: "Charcoal", hex: "#2B2B2B" },
  { label: "Black", hex: "#0A0A0A" },
  { label: "Oxblood", hex: "#5B1A1A" },
  { label: "Plum", hex: "#5E2A4E" },
  { label: "Soft blush", hex: "#F3D6D0" },
  { label: "Butter yellow", hex: "#F2E08A" },
  { label: "Mint", hex: "#C3E4D0" },
  { label: "Storm grey", hex: "#7B8088" },
  { label: "Forest", hex: "#234534" },
];

const isHex = (s: string) => /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(s.trim());

interface Props {
  value: string | undefined;
  onChange: (next: string | undefined) => void;
  /** Optional brand colors prepended to the curated swatches. */
  brandColors?: { label: string; hex: string }[];
}

/**
 * Backdrop color picker — curated swatches + brand colors + custom hex input.
 * Stores the label (or raw hex) as a free string on the field.
 */
export function BackdropColorField({ value, onChange, brandColors = [] }: Props) {
  const [customOpen, setCustomOpen] = useState(
    !!value && !SWATCHES.some((s) => s.label === value) && !brandColors.some((b) => b.label === value),
  );
  const [draft, setDraft] = useState(value && isHex(value) ? value : "");

  const all = [...brandColors, ...SWATCHES];

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {all.map((s) => {
          const active = value === s.label || value === s.hex;
          return (
            <button
              key={`${s.label}-${s.hex}`}
              type="button"
              onClick={() => onChange(active ? undefined : s.label)}
              title={`${s.label} (${s.hex})`}
              className={[
                "h-7 w-7 rounded-full border transition-all",
                active ? "ring-2 ring-foreground ring-offset-2 ring-offset-background border-transparent" : "border-border hover:scale-110",
              ].join(" ")}
              style={{ backgroundColor: s.hex }}
              aria-label={s.label}
            />
          );
        })}
        <Chip active={customOpen} onClick={() => setCustomOpen((v) => !v)}>
          {customOpen ? "− Custom" : "+ Custom hex"}
        </Chip>
      </div>
      {customOpen && (
        <div className="flex items-center gap-2">
          <Input
            value={draft}
            onChange={(e) => {
              const v = e.target.value;
              setDraft(v);
              if (isHex(v)) onChange(v.trim());
            }}
            placeholder="#A0593D or 'dusty rose'"
            maxLength={32}
            className="rounded-xl max-w-[220px]"
          />
          {draft && isHex(draft) && (
            <span
              className="h-7 w-7 rounded-full border border-border"
              style={{ backgroundColor: draft.trim() }}
            />
          )}
        </div>
      )}
    </div>
  );
}
