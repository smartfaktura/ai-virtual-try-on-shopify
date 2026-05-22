import { useMemo } from "react";
import { Sparkles } from "lucide-react";
import type { BrandSceneAnswers } from "../../types";
import { assembleSceneDirective } from "../../prompt/assembleSceneDirective";

interface Props {
  answers: BrandSceneAnswers;
}

/**
 * Step 6 — Preview & pick.
 *
 * This is the UX scaffold for the 3-variant generation loop. A live
 * generation endpoint for Brand Scenes does not yet exist; this step
 * shows the assembled directive so the user can verify exactly what
 * will be sent, and reserves the grid + "Save" affordance for the
 * follow-up PR that wires `assembleSceneDirective` into an edge
 * function and writes chosen variants back via `setPreviewVariants`.
 */
export function Step6PreviewAndPick({ answers }: Props) {
  const directive = useMemo(() => assembleSceneDirective(answers), [answers]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          <Sparkles className="w-3 h-3" />
          Final scene directive
        </div>
        <pre className="mt-3 text-xs leading-relaxed text-foreground/85 whitespace-pre-wrap font-mono">
{directive || "(empty — go back and fill in the scene)"}
        </pre>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="aspect-[4/5] rounded-2xl border border-dashed border-border bg-muted/30 flex items-center justify-center text-xs text-muted-foreground"
          >
            Variant {i + 1}
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        Generating three variants is the next step. When you pick one it gets
        saved to your Brand Scenes library, the other two are discarded, and the
        full directive above is stored so the scene can be re-rendered later.
      </p>
    </div>
  );
}
