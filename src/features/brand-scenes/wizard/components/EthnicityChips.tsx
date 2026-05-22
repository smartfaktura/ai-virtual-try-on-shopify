import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

/**
 * Phase 7i — clearer two-line ethnicity / casting chips.
 * Value is stored as a free string on `cast.extras.ethnicity` so the
 * prompt assembler renders it verbatim.
 */

interface EthnicityOption {
  value: string;
  label: string;
  desc: string;
}

const ETHNICITY_OPTIONS: EthnicityOption[] = [
  { value: "As-cast", label: "Match my model", desc: "Use the brand model's natural look" },
  { value: "Globally diverse", label: "Globally diverse", desc: "Mixed casting across regions" },
  { value: "Mixed-heritage", label: "Mixed heritage", desc: "Multi-ethnic features" },
  { value: "Pan-European", label: "Pan-European", desc: "Northern + Mediterranean European" },
  { value: "East Asian", label: "East Asian", desc: "Chinese / Japanese / Korean" },
  { value: "South Asian", label: "South Asian", desc: "Indian / Pakistani / Sri Lankan" },
  { value: "Black", label: "Black", desc: "African / African-diaspora" },
  { value: "Latine", label: "Latine", desc: "Latin American heritage" },
  { value: "Middle Eastern", label: "Middle Eastern", desc: "MENA region heritage" },
];

interface Props {
  value: string | undefined;
  onChange: (next: string | undefined) => void;
}

export function EthnicityChips({ value, onChange }: Props) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Ethnicity / casting hint
        </span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" aria-label="What is this?">
                <Info className="w-3 h-3 text-muted-foreground/70" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs text-[11px] leading-relaxed">
              A styling hint, not a hard cast. The AI uses it to guide
              features when no brand model is attached.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="flex flex-wrap gap-2">
        {ETHNICITY_OPTIONS.map((o) => {
          const active = value === o.value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(active ? undefined : o.value)}
              className={[
                "text-left rounded-2xl border px-3 py-2 transition-colors",
                "min-w-[140px]",
                active
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-background text-foreground hover:border-foreground/40",
              ].join(" ")}
            >
              <div className="text-[12px] font-medium leading-tight">
                {o.label}
              </div>
              <div
                className={[
                  "text-[10px] leading-tight mt-0.5",
                  active ? "text-background/70" : "text-muted-foreground",
                ].join(" ")}
              >
                {o.desc}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
