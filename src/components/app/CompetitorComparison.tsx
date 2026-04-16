export function CompetitorComparison() {
  const comparisons = [
    { name: 'VOVV.AI', price: '$0.04', width: '28%', highlight: true },
    { name: 'Traditional AI Tools', price: '$0.10', width: '62%', highlight: false },
    { name: 'Photo Studios', price: '$0.15+', width: '92%', highlight: false },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h2 className="text-lg font-semibold tracking-tight">
          Save 60–80% compared to alternatives
        </h2>
        <p className="text-sm text-muted-foreground">
          Professional AI product visuals at a fraction of the cost
        </p>
      </div>

      <div className="space-y-3 max-w-2xl mx-auto">
        {comparisons.map((comp) => (
          <div key={comp.name} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className={comp.highlight ? 'font-semibold text-foreground' : 'text-muted-foreground'}>
                {comp.name}
              </span>
              <span className={`font-semibold tabular-nums ${comp.highlight ? 'text-primary' : 'text-muted-foreground'}`}>
                {comp.price}
                <span className="text-[11px] font-normal ml-0.5">/ credit</span>
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-muted/60 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  comp.highlight
                    ? 'bg-primary'
                    : 'bg-muted-foreground/25'
                }`}
                style={{ width: comp.width }}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-muted-foreground/60 text-center">
        Based on average cost across platforms for AI-generated product visuals. VOVV pricing varies by plan ($0.04–$0.08 per credit).
      </p>
    </div>
  );
}
