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
        "inline-flex items-center justify-center min-h-[36px] rounded-full border px-4 py-2 text-[13.5px] leading-none transition-colors whitespace-nowrap",
        disabled
          ? "border-border bg-muted/30 text-muted-foreground cursor-not-allowed"
          : active
            ? "border-foreground bg-foreground text-background font-medium"
            : "border-border bg-card text-foreground hover:border-foreground/40 hover:bg-muted/30",
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
      className="inline-flex items-center justify-center min-h-[36px] gap-1.5 rounded-full border border-dashed border-border bg-transparent px-4 py-2 text-[13.5px] leading-none text-muted-foreground hover:border-foreground/40 hover:text-foreground transition-colors"
    >
      <Plus className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}
