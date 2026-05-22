import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

interface Props {
  label: string;
  defaultOpen?: boolean;
  /** Number of fields inside this group that already have a value — surfaced as "· N set" suffix. */
  count?: number;
  children: ReactNode;
}

/**
 * Phase 7j — collapsible block grouping related Stage C dials.
 * Phase 7q — added optional `count` so users can see filled-field count without expanding.
 */
export function StageCGroup({ label, defaultOpen = false, count = 0, children }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-border/60 bg-muted/[0.02]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
      >
        <span className="flex items-center gap-2">
          <span>{label}</span>
          {count > 0 && (
            <span className="text-foreground/70 normal-case tracking-normal">
              · {count} set
            </span>
          )}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="px-4 pb-5 pt-1 space-y-7">{children}</div>}
    </div>
  );
}
