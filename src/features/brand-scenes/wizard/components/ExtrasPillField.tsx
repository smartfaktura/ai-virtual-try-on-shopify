import { useState, type ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Chip, AddChip } from "./Chip";
import { Section } from "./Section";
import { AutoFillBadge } from "./AutoFillBadge";
import type { ExtrasField } from "../constants/extras";

interface Props {
  field: ExtrasField;
  value: string | undefined;
  onChange: (next: string | undefined) => void;
  /** When true, all presets are shown by default; otherwise the first 8. */
  showAllInitially?: boolean;
  /** This value was set by a cascade rule. */
  autoFilled?: boolean;
  /** Optional dependent UI rendered beneath the chip row (e.g. color pickers). */
  children?: ReactNode;
}

/**
 * Preset chips + a "+ Custom…" affordance. The stored value is a free string
 * — either a preset label or whatever the user typed.
 */
export function ExtrasPillField({
  field,
  value,
  onChange,
  showAllInitially,
  autoFilled,
  children,
}: Props) {
  const isCustom = !!value && !field.presets.includes(value);
  const [customOpen, setCustomOpen] = useState(isCustom);
  const [customDraft, setCustomDraft] = useState(isCustom ? value! : "");

  return (
    <Section
      label={
        autoFilled ? (
          (
            <span className="inline-flex items-center gap-2">
              {field.label}
              <AutoFillBadge onClear={() => onChange(undefined)} />
            </span>
          ) as unknown as string
        ) : (
          field.label
        )
      }
      hint={field.hint}
      expandable={!showAllInitially}
    >
      {(expanded) => {
        const visible = expanded || showAllInitially
          ? field.presets
          : field.presets.slice(0, 8);
        return (
          <div>
            <div className="flex flex-wrap gap-2">
              {visible.map((p) => (
                <Chip
                  key={p}
                  active={value === p}
                  onClick={() => {
                    setCustomOpen(false);
                    setCustomDraft("");
                    onChange(value === p ? undefined : p);
                  }}
                >
                  {p}
                </Chip>
              ))}
              {!customOpen && (
                <AddChip
                  onClick={() => {
                    setCustomOpen(true);
                  }}
                />
              )}
              {customOpen && isCustom && (
                <Chip
                  active
                  onClick={() => {
                    onChange(undefined);
                    setCustomDraft("");
                    setCustomOpen(false);
                  }}
                >
                  {value} ×
                </Chip>
              )}
            </div>
            {customOpen && (
              <div className="mt-2 flex gap-2">
                <Input
                  value={customDraft}
                  maxLength={120}
                  autoFocus
                  onChange={(e) => setCustomDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && customDraft.trim()) {
                      e.preventDefault();
                      onChange(customDraft.trim());
                    }
                  }}
                  onBlur={() => {
                    const v = customDraft.trim();
                    if (v) onChange(v);
                    else setCustomOpen(false);
                  }}
                  placeholder={`Describe your own ${field.label.toLowerCase()}`}
                  className="rounded-xl"
                />
              </div>
            )}
            {children && <div className="mt-3">{children}</div>}
          </div>
        );
      }}
    </Section>
  );
}
