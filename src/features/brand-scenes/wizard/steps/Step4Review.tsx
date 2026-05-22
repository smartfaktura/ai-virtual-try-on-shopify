import type { BrandSceneAnswers } from "../../types";

export function Step4Review({ answers }: { answers: BrandSceneAnswers }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Read-only summary. Saving and prompt generation arrive in later phases.
      </p>
      <pre className="rounded-2xl border border-border bg-muted/40 p-4 text-xs overflow-auto max-h-[360px] font-mono text-foreground/80">
{JSON.stringify(answers, null, 2)}
      </pre>
    </div>
  );
}
