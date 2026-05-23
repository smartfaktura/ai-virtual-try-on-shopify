import { Label } from "@/components/ui/label";
import type { ReactNode } from "react";

/**
 * Shared layout primitives for module-question forms.
 * Mirrors the Block / SmallField / Chip locals first introduced in
 * EyewearQuestions / FashionQuestions / FootwearQuestions.
 */

export function Block({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-baseline justify-between">
        <Label className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {label}
          {required && <span className="text-foreground/60 ml-1">·</span>}
        </Label>
        {hint && (
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground tabular-nums">
            {hint}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

export function SmallField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        {hint && (
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground tabular-nums">
            {hint}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

export function ModuleChip({
  active,
  onClick,
  children,
  size = "md",
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  size?: "sm" | "md";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-full border transition-colors",
        size === "sm" ? "px-3 py-1 text-xs" : "px-4 py-2 text-sm",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-card text-foreground hover:border-foreground/40",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
