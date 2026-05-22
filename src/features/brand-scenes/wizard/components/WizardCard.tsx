import type { ReactNode } from "react";

interface WizardCardProps {
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  icon?: ReactNode;
  title: string;
  body?: string;
  tag?: string;
}

/**
 * Shared selectable card used across the Brand Scenes wizard
 * (source picker, family picker, sub-family picker).
 * Keeps visual language identical between steps.
 */
export function WizardCard({
  active = false,
  disabled = false,
  onClick,
  icon,
  title,
  body,
  tag,
}: WizardCardProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[
        "rounded-2xl border p-5 text-left transition-all w-full h-full flex flex-col",
        disabled
          ? "border-border bg-muted/30 text-muted-foreground cursor-not-allowed"
          : active
            ? "border-foreground bg-foreground text-background"
            : "border-border bg-card hover:border-foreground/40",
      ].join(" ")}
    >
      {icon && (
        <div
          className={[
            "w-10 h-10 rounded-xl flex items-center justify-center mb-3",
            active ? "bg-background/10" : "bg-foreground/5",
          ].join(" ")}
        >
          {icon}
        </div>
      )}
      <div className="text-base font-semibold tracking-tight">{title}</div>
      {body && (
        <p
          className={[
            "text-sm mt-1.5 leading-relaxed",
            active ? "text-background/70" : "text-muted-foreground",
          ].join(" ")}
        >
          {body}
        </p>
      )}
      {tag && (
        <div
          className={[
            "mt-3 inline-flex self-start text-[10px] uppercase tracking-[0.16em] px-2 py-1 rounded-full",
            active
              ? "bg-background/10 text-background/80"
              : "bg-foreground/5 text-muted-foreground",
          ].join(" ")}
        >
          {tag}
        </div>
      )}
    </button>
  );
}
