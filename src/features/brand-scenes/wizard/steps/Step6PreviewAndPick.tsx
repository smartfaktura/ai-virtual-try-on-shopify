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
          {BRAND_SCENE_VARIATIONS_PER_GENERATION} variations ·{" "}
          {BRAND_SCENE_GENERATION_COST} credits
        </div>
        <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
          We'll generate {BRAND_SCENE_VARIATIONS_PER_GENERATION} preview variations. After they're ready, you can save the one you like best to your library.
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

      {/* Full structured summary (ported from Step5Review) */}
      <Step5Review answers={answers} onNegativeNoteChange={onNegativeNoteChange} />


      {/* Admin debug — single instance */}
      {isAdmin && (
        <div className="space-y-3 pt-4 border-t border-border/60">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
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
    <div className="rounded-2xl border border-border bg-muted/30">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground"
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
