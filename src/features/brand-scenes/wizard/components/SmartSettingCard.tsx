interface Props {
  label: string;
  active?: boolean;
  vibe?: string;
  onClick: () => void;
}

/**
 * Compact card used in Stage B (setting picker). No imagery — pure type
 * and a one-line vibe note. Active style mirrors WizardCard for consistency.
 */
export function SmartSettingCard({ label, vibe, active, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "text-left rounded-2xl border px-4 py-3 transition-colors",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-card hover:border-foreground/40",
      ].join(" ")}
    >
      <div className="text-sm font-medium">{label}</div>
      {vibe && (
        <div
          className={[
            "mt-1 text-[11px] line-clamp-2",
            active ? "text-background/70" : "text-muted-foreground",
          ].join(" ")}
        >
          {vibe}
        </div>
      )}
    </button>
  );
}
