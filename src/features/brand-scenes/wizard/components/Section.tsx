import { type ReactNode } from "react";
import { Label } from "@/components/ui/label";

interface SectionProps {
  label: ReactNode;
  required?: boolean;
  /** True when the section is required AND currently empty — surfaces a subtle red ring + scroll target. */
  missing?: boolean;
  hint?: string;
  /** Optional plain-language helper rendered under the label. */
  helper?: ReactNode;
  /**
   * Legacy prop kept for API compatibility. The "+ Show all" toggle was removed
   * in Phase 7r; sections now always render the full list. The render-prop form
   * still works — `children` is called with `expanded = true`.
   */
  expandable?: boolean;
  children: ReactNode | ((expanded: boolean) => ReactNode);
}

export function Section({
  label,
  required,
  missing,
  hint,
  helper,
  children,
}: SectionProps) {
  const body = typeof children === "function" ? children(true) : children;

  return (
    <div
      className="space-y-2.5 rounded-2xl"
      data-section-label={typeof label === "string" ? label : undefined}
      data-required={required ? "1" : undefined}
      data-missing={missing ? "1" : undefined}
    >
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-3">
          <Label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            {label}
            {required && <span className="text-destructive/80 ml-1">*</span>}
          </Label>
        </div>
        {helper && (
          <p className="text-[11px] text-muted-foreground/80 leading-relaxed">
            {helper}
          </p>
        )}
      </div>
      {body}
      {hint && <p className="text-[11px] text-muted-foreground/80">{hint}</p>}
    </div>
  );
}
