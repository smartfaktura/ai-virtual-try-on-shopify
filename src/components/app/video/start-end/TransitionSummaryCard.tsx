interface SummaryRow {
  label: string;
  value: string;
}

interface TransitionSummaryCardProps {
  rows: SummaryRow[];
}

export function TransitionSummaryCard({ rows }: TransitionSummaryCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-gradient-to-b from-muted/40 to-muted/10 p-5 sm:p-6 space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-base font-semibold tracking-tight text-foreground">Transition Summary</h3>
        <p className="text-[11.5px] text-muted-foreground hidden sm:block">
          Review before you generate
        </p>
      </div>
      <div className="divide-y divide-border/40">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between py-2 text-[12.5px]">
            <span className="text-muted-foreground">{r.label}</span>
            <span className="text-foreground font-medium text-right max-w-[60%] truncate">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
