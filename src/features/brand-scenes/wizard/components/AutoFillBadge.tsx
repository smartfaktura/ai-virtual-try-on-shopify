import { Sparkles } from "lucide-react";

interface Props {
  onClear?: () => void;
}

/**
 * Tiny ✦-style badge that marks a field as auto-cascaded.
 * Clicking it clears the auto value so the user can pick their own.
 */
export function AutoFillBadge({ onClear }: Props) {
  return (
    <button
      type="button"
      onClick={onClear}
      title="Auto-filled — click to clear"
      className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground hover:border-foreground/40 hover:text-foreground transition-colors"
    >
      <Sparkles className="w-3 h-3" />
      Auto
    </button>
  );
}
