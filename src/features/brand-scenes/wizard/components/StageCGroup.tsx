import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

interface Props {
  label: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

/**
 * Phase 7j — collapsible block grouping related Stage C dials.
 * Pure presentational: just a header row + animated body.
 */
export function StageCGroup({ label, defaultOpen = false, children }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-border/60 bg-muted/[0.02]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors"
      >
        <span>{label}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="px-4 pb-5 pt-1 space-y-7">{children}</div>}
    </div>
  );
}
