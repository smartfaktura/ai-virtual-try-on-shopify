import { type ReactNode } from "react";
import { HelpCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SectionProps {
  label: ReactNode;
  required?: boolean;
  /** True when the section is required AND currently empty — surfaces a subtle red ring + scroll target. */
  missing?: boolean;
  hint?: string;
  /** Optional plain-language helper rendered under the label. */
  helper?: ReactNode;
  /** Optional short hint rendered as an info-icon tooltip next to the label. */
  tooltip?: string;
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
  tooltip,
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
        <div className="flex items-center gap-2">
          <Label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {label}
          </Label>
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="text-muted-foreground/60 hover:text-foreground transition-colors"
                    aria-label="More info"
                  >
                    <HelpCircle className="w-3 h-3" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs text-xs">
                  {tooltip}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {required && (
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60">
              Required
            </span>
          )}
        </div>
        {helper && (
          <p className="text-[11px] text-muted-foreground/80 leading-relaxed">
            {helper}
          </p>
        )}
      </div>
      <div
        className={
          missing
            ? "rounded-xl ring-1 ring-destructive/30 bg-muted/20 p-3 -mx-1 transition-colors"
            : undefined
        }
      >
        {body}
      </div>

      {missing && (
        <p className="text-[11px] text-destructive/80 leading-relaxed">
          This section is required to continue
        </p>
      )}
      {hint && <p className="text-[11px] text-muted-foreground/80">{hint}</p>}
    </div>
  );
}

