import { useState, type ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Chip, AddChip } from "./Chip";
import { Section } from "./Section";
import { AutoFillBadge } from "./AutoFillBadge";
import { RecommendationHint } from "./RecommendationHint";
import type { ExtrasField } from "../constants/extras";

interface Props {
  field: ExtrasField;
  value: string | undefined;
  onChange: (next: string | undefined) => void;
  /**
   * Legacy prop — Phase 7r always shows all presets, so this is a no-op.
   * Kept so existing call-sites compile unchanged.
   */
  showAllInitially?: boolean;
  /** This value was set by a cascade rule. */
  autoFilled?: boolean;
  /** Recommended value (shown as ✦ chip when the field is empty). */
  recommended?: string;
  /** Optional dependent UI rendered beneath the chip row (e.g. color pickers). */
  children?: ReactNode;
}

/**
 * Preset chips + a "+ Custom…" affordance. The stored value is a free string
 * — either a preset label or whatever the user typed.
 *
 * Phase 7r: dropped the "+ Show all" toggle; the full preset list is always
 * rendered. Removed `autoFocus` on the custom input so re-entering the step
 * doesn't yank the page.
 */
export function ExtrasPillField({
  field,
  value,
  onChange,
  autoFilled,
  recommended,
  children,
}: Props) {
  const isCustom = !!value && !field.presets.includes(value);
  const [customOpen, setCustomOpen] = useState(isCustom);
  const [customDraft, setCustomDraft] = useState(isCustom ? value! : "");
  const showRecommendation = !value && !!recommended;

  return (
    <Section
      label={
        autoFilled ? (
          <span className="inline-flex items-center gap-2">
            {field.label}
            <AutoFillBadge onClear={() => onChange(undefined)} />
          </span>
        ) : (
          field.label
        )
      }
      hint={field.hint}
    >
      <div>
        <div className="flex flex-wrap gap-2">
          {field.presets.map((p) => (
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
          {!customOpen && <AddChip onClick={() => setCustomOpen(true)} />}
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
        {showRecommendation && (
          <RecommendationHint
            fieldLabel={field.label}
            recommended={recommended!}
            onApply={() => onChange(recommended!)}
          />
        )}
      </div>
    </Section>
  );
}
