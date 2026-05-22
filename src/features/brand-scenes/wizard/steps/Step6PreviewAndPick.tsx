import { useMemo, useState } from "react";
import { Sparkles, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsAdminSafe } from "../hooks/useIsAdminSafe";
import { Step5Review } from "./Step5Review";
import type { BrandSceneAnswers } from "../../types";
import { assembleSceneDirective } from "../../prompt/assembleSceneDirective";
import {
  BRAND_SCENE_GENERATION_COST,
  BRAND_SCENE_VARIATIONS_PER_GENERATION,
} from "../../constants";

interface Props {
  answers: BrandSceneAnswers;
  onNegativeNoteChange?: (note: string) => void;
}

export function Step6PreviewAndPick({ answers, onNegativeNoteChange }: Props) {
  const directive = useMemo(() => assembleSceneDirective(answers), [answers]);
  const { isAdmin } = useIsAdminSafe();
  const [showPrompt, setShowPrompt] = useState(false);
  const [showPayload, setShowPayload] = useState(false);

  return (
    <div className="space-y-6">
      {/* Hero — ready to generate */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Ready to generate
        </div>
        <div className="mt-1 text-base font-semibold tracking-tight">
          {BRAND_SCENE_VARIATIONS_PER_GENERATION} variations · 4:5 ·{" "}
          {BRAND_SCENE_GENERATION_COST} credits
        </div>
        <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
          Saving the scene is free. Only generating variations deducts credits.
        </p>

        <div className="mt-5">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span tabIndex={0}>
                  <Button size="pill" disabled className="gap-2">
                    <Sparkles className="w-4 h-4" />
                    Generate {BRAND_SCENE_VARIATIONS_PER_GENERATION} variations
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>Available in a later phase</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Variant placeholders */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {Array.from({ length: BRAND_SCENE_VARIATIONS_PER_GENERATION }).map((_, i) => (
          <div
            key={i}
            className="aspect-[4/5] rounded-2xl border border-dashed border-border bg-muted/30 flex items-center justify-center text-xs text-muted-foreground"
          >
            Variant {i + 1}
          </div>
        ))}
      </div>

      {/* Full structured summary (ported from Step5Review) */}
      <Step5Review answers={answers} onNegativeNoteChange={onNegativeNoteChange} />

      {/* Admin debug — single instance */}
      {isAdmin && (
        <div className="space-y-3 pt-4 border-t border-border/60">
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Admin debug
          </div>

          <AdminPanel
            label="Compiled prompt"
            open={showPrompt}
            onToggle={() => setShowPrompt((v) => !v)}
          >
            <pre className="text-xs leading-relaxed text-foreground/85 whitespace-pre-wrap font-mono">
{directive || "(empty — go back and fill in the scene)"}
            </pre>
          </AdminPanel>

          <AdminPanel
            label="Raw payload"
            open={showPayload}
            onToggle={() => setShowPayload((v) => !v)}
          >
            <pre className="text-xs leading-relaxed text-foreground/85 whitespace-pre-wrap font-mono overflow-auto max-h-[400px]">
{JSON.stringify(answers, null, 2)}
            </pre>
          </AdminPanel>
        </div>
      )}
    </div>
  );
}

function AdminPanel({
  label,
  open,
  onToggle,
  children,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/30">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
      >
        <span>{label}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}
