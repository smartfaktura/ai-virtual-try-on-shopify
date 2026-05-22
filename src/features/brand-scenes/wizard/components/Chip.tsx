import { Plus } from "lucide-react";
import type { ReactNode } from "react";

interface ChipProps {
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
}

/**
 * Single shared pill used everywhere in the Brand Scenes wizard.
 * One size, one shape — no variants, no surprises.
 */
export function Chip({ active = false, disabled = false, onClick, children }: ChipProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[
        "rounded-full border px-4 py-2 text-sm transition-colors whitespace-nowrap",
        disabled
          ? "border-border bg-muted/30 text-muted-foreground cursor-not-allowed"
          : active
            ? "border-foreground bg-foreground text-background"
            : "border-border bg-card text-foreground hover:border-foreground/40",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

interface AddChipProps {
  onClick: () => void;
  label?: string;
}

/** Dashed "+ Add custom" sibling to Chip. */
export function AddChip({ onClick, label = "Custom" }: AddChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-dashed border-border bg-transparent px-4 py-2 text-sm text-muted-foreground hover:border-foreground/40 hover:text-foreground transition-colors inline-flex items-center gap-1.5"
    >
      <Plus className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}
