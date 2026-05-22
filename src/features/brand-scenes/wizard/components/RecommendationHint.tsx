import { Sparkles } from "lucide-react";

interface Props {
  fieldLabel: string;
  recommended: string;
  onApply: () => void;
}

/**
 * Shown when a cascade-recommended value has been cleared by the user.
 * One click re-applies it.
 */
export function RecommendationHint({ fieldLabel, recommended, onApply }: Props) {
  return (
    <button
      type="button"
      onClick={onApply}
      className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-dashed border-border bg-transparent px-2.5 py-1 text-[11px] text-muted-foreground hover:border-foreground/40 hover:text-foreground transition-colors"
      title={`Re-apply recommended ${fieldLabel.toLowerCase()}`}
    >
      <Sparkles className="w-3 h-3" />
      Recommended: {recommended}
    </button>
  );
}
