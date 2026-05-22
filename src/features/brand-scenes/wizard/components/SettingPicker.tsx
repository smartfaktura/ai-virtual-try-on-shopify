import { useState } from "react";
import { Input } from "@/components/ui/input";
import { SmartSettingCard } from "./SmartSettingCard";
import { Plus } from "lucide-react";

interface Props {
  options: string[];
  value: string | undefined;
  onChange: (next: string | undefined) => void;
  emptyHint?: string;
}

/**
 * Stage B — setting picker. Compact 2-col card grid + "Add your own" inline input.
 * Freedom-first: any custom string is accepted.
 */
export function SettingPicker({ options, value, onChange, emptyHint }: Props) {
  const [customOpen, setCustomOpen] = useState(
    !!value && !options.includes(value),
  );
  const [draft, setDraft] = useState(value && !options.includes(value) ? value : "");
  const isCustom = !!value && !options.includes(value);

  if (!options.length && !value) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-4 text-sm text-muted-foreground">
        {emptyHint ?? "Pick a scene type first to see tailored settings."}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {options.map((opt) => (
          <SmartSettingCard
            key={opt}
            label={opt}
            active={value === opt}
            onClick={() => onChange(value === opt ? undefined : opt)}
          />
        ))}
        {isCustom && (
          <SmartSettingCard
            label={value!}
            vibe="custom"
            active
            onClick={() => onChange(undefined)}
          />
        )}
        <button
          type="button"
          onClick={() => setCustomOpen((v) => !v)}
          className="rounded-2xl border border-dashed border-border bg-transparent px-4 py-3 text-left text-sm text-muted-foreground hover:border-foreground/40 hover:text-foreground transition-colors inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add your own
        </button>
      </div>
      {customOpen && (
        <div className="flex gap-2">
          <Input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && draft.trim()) {
                e.preventDefault();
                onChange(draft.trim());
                setCustomOpen(false);
              }
            }}
            onBlur={() => {
              const v = draft.trim();
              if (v) {
                onChange(v);
                setCustomOpen(false);
              }
            }}
            maxLength={120}
            placeholder="Describe your own setting (e.g. moss-covered ruin)"
            className="rounded-xl"
          />
        </div>
      )}
    </div>
  );
}
