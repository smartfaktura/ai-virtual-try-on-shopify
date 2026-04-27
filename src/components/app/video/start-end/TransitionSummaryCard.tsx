interface SummaryRow {
  label: string;
  value: string;
}

interface TransitionSummaryCardProps {
  rows: SummaryRow[];
}

export function TransitionSummaryCard({ rows }: TransitionSummaryCardProps) {
  return (
    <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-2">
      <h3 className="text-sm font-medium text-foreground">Transition Summary</h3>
      <div className="divide-y divide-border/60">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between py-1.5 text-xs">
            <span className="text-muted-foreground">{r.label}</span>
            <span className="text-foreground font-medium text-right max-w-[60%] truncate">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
