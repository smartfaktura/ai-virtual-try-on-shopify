## Fix Step 6 results layout

In `src/features/brand-scenes/wizard/steps/Step6PreviewAndPick.tsx` (lines 416-477), the picking/saving phase uses a 3-col grid: variations occupy `lg:col-span-2` and the summary (`Step5Review`) sits in the side column.

### Change
- Drop the `grid grid-cols-1 lg:grid-cols-3` wrapper.
- Render "Pick your favorite" card at full width as one row.
- Render the summary (reference thumb if reference flow + `Step5Review`) as its own full-width row below.
- Remove `lg:col-span-2` / `lg:col-span-1` constraints.

No logic, prop, or component changes — purely layout.
