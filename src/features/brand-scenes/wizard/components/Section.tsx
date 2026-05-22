import { type ReactNode } from "react";
import { Label } from "@/components/ui/label";

interface SectionProps {
  label: ReactNode;
  required?: boolean;
  /** True when the section is required AND currently empty — surfaces a subtle red ring + scroll target. */
  missing?: boolean;
  hint?: string;
  /**
   * Legacy prop kept for API compatibility. The "+ Show all" toggle was removed
   * in Phase 7r; sections now always render the full list. The render-prop form
   * still works — `children` is called with `expanded = true`.
   */
  expandable?: boolean;
  children: ReactNode | ((expanded: boolean) => ReactNode);
}

/**
 * Standard pill section wrapper.
 * Phase 7r — removed the user-facing "Show all / Tuned only" toggle.
 * Sections now always show the full preset list. The render-prop signature is
 * preserved so existing callers continue to compile.
 */
export function Section({
  label,
  required,
  missing,
  hint,
  children,
}: SectionProps) {
  const body = typeof children === "function" ? children(true) : children;

  return (
    <div
      className={[
        "space-y-2.5 rounded-2xl transition-shadow",
        missing
          ? "ring-1 ring-destructive/60 ring-offset-4 ring-offset-background animate-pulse"
          : "",
      ].join(" ")}
      data-section-label={typeof label === "string" ? label : undefined}
      data-required={required ? "1" : undefined}
      data-missing={missing ? "1" : undefined}
    >
      <div className="flex items-center justify-between gap-3">
        <Label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {label}
          {required && <span className="text-destructive/80 ml-1">*</span>}
        </Label>
      </div>
      {body}
      {hint && <p className="text-[11px] text-muted-foreground/80">{hint}</p>}
    </div>
  );
}
