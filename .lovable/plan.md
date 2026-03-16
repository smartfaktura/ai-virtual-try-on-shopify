

## Fix: Global Generation Bar should distinguish Freestyle vs Workflow jobs

### Problem
The expanded detail panel and the bottom CTA button always show "Generation" as the label and "View in Workflows" as the navigation target — even for freestyle jobs. The code at line 184 falls back to `group.workflow_name ?? 'Generation'` (freestyle jobs have no workflow_name), and lines 250-252 hardcode the navigation to `/app/workflows` for all non-upscale jobs.

### Fix — `src/components/app/GlobalGenerationBar.tsx`

**1. Detail row label (line 184):** Use `job_type` to show "Freestyle" when `job_type === 'freestyle'`:
```
isUpscale ? `${luna?.name ?? 'Luna'} is upscaling...`
  : group.job_type === 'freestyle' ? 'Freestyle'
  : (group.workflow_name ?? 'Generation')
```

**2. Bottom CTA button (lines 243-253):** Route based on `job_type`:
- `upscale` → `/app/library` / "View in Library"
- `freestyle` → `/app/freestyle` / "View in Freestyle"  
- default → `/app/workflows` / "View in Workflows"

**3. Completed group label (line 219):** Show "Freestyle complete" vs generic "Complete" based on `job_type`.

Single file change: `src/components/app/GlobalGenerationBar.tsx`

