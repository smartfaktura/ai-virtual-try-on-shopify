

# Revamp Dashboard Metrics: Value-Driven 5-Column Cards with Tooltips

## Changes

### 1. Remove "credits available" line from header (`src/pages/Dashboard.tsx`, lines 425-429)
Delete the `<div className="flex items-center gap-2 text-sm">` block showing "882 credits available" under the subtitle.

### 2. Replace MetricCard component (`src/components/app/MetricCard.tsx`)
Redesign to support two card variants:
- **Stat card**: compact card with icon, title, value, suffix, and an info tooltip
- **Action card**: compact card with icon, title, description, and a CTA button

New props:
```tsx
interface MetricCardProps {
  title: string;
  value?: string | number;
  suffix?: string;
  icon?: LucideIcon;
  tooltip?: string;        // info tooltip explainer
  loading?: boolean;
  onClick?: () => void;
  progress?: number;
  progressColor?: string;
  action?: { label: string; onClick: () => void };  // CTA button
  description?: string;    // for action cards (replaces value)
}
```

Design: smaller padding (`p-4 sm:p-5`), smaller value (`text-2xl`), tooltip icon (Info circle) next to title that shows explainer on hover via Radix Tooltip.

### 3. Replace metrics grid in Dashboard (`src/pages/Dashboard.tsx`, lines 456-489)

Change from 4-column to 5-column: `grid-cols-2 md:grid-cols-3 lg:grid-cols-5`

**5 new cards:**

1. **Cost Saved** — `€{generatedCount * 30}` / "vs traditional photoshoots" / tooltip: "Based on €30 average cost per professional product photo"
2. **Time Saved** — `{Math.round(generatedCount * 20 / 60)}h` / "no shooting or editing needed" / tooltip: "Estimated 20 min saved per image vs traditional workflow"
3. **Credits Remaining** — `{balance}` / "available" / onClick → openBuyModal / progress bar / tooltip: "Credits refresh monthly based on your plan"
4. **Continue Last** — action card showing last workflow name / "Continue" button → navigate to last workflow
5. **Top Style** — action card showing most-used workflow/category / "Recreate" button → navigate

For cards 4 and 5, add a query to fetch the last completed job's workflow name and the most-used workflow:

```tsx
const { data: lastJob } = useQuery({
  queryKey: ['dashboard-last-job', user?.id],
  queryFn: async () => {
    const { data } = await supabase
      .from('generation_jobs')
      .select('workflows(name, slug)')
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    return data;
  },
  enabled: !!user,
  staleTime: 5 * 60 * 1000,
});

const { data: topWorkflow } = useQuery({
  queryKey: ['dashboard-top-workflow', user?.id],
  queryFn: async () => {
    const { data } = await supabase
      .from('generation_jobs')
      .select('workflow_id, workflows(name, slug)')
      .eq('status', 'completed');
    // Count occurrences client-side, return most frequent
    const counts: Record<string, { count: number; name: string; slug: string }> = {};
    (data || []).forEach(j => {
      const wf = j.workflows as any;
      if (wf?.name) {
        const key = wf.name;
        if (!counts[key]) counts[key] = { count: 0, name: wf.name, slug: wf.slug };
        counts[key].count++;
      }
    });
    const sorted = Object.values(counts).sort((a, b) => b.count - a.count);
    return sorted[0] || null;
  },
  enabled: !!user,
  staleTime: 10 * 60 * 1000,
});
```

### Files
- `src/components/app/MetricCard.tsx` — redesign with tooltip support and action variant
- `src/pages/Dashboard.tsx` — remove credits line, add 5 new metric cards with queries

