import { useState, type ReactNode } from "react";
import { Label } from "@/components/ui/label";

interface SectionProps {
  label: string;
  required?: boolean;
  hint?: string;
  /** When true, renders the "Show all options" toggle and exposes its state via render-prop. */
  expandable?: boolean;
  children: ReactNode | ((expanded: boolean) => ReactNode);
}

/**
 * Standard pill section wrapper with the optional "Show all options" link.
 * Defaults closed (category-tuned subset). Click expands to the full menu.
 */
export function Section({
  label,
  required,
  hint,
  expandable,
  children,
}: SectionProps) {
  const [expanded, setExpanded] = useState(false);
  const body =
    typeof children === "function" ? children(expanded) : children;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-3">
        <Label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {label}
          {required && <span className="text-foreground/60 ml-1">·</span>}
        </Label>
        {expandable && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
          >
            {expanded ? "− Tuned only" : "+ Show all"}
          </button>
        )}
      </div>
      {body}
      {hint && <p className="text-[11px] text-muted-foreground/80">{hint}</p>}
    </div>
  );
}
