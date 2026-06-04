## Fix Fresh Scenes preview modal — black bars on desktop

Single file: `src/components/app/DashboardFreshScenes.tsx`. No data, query, routing, or shared-component changes.

### Root cause
On desktop the left modal pane is `bg-black` with `object-contain` and the column is `1.4fr` — wider than the image's 4:5 portrait aspect, so the image letterboxes with black bars on both sides. Mobile/tablet stack the image full-width, so the image's own ratio matches the column → no bars.

### Changes

1. **Background token, not black** — `bg-black` → `bg-muted` on the left pane. Uses the design system; eliminates harsh black if any minor letterboxing ever appears.

2. **Auto-sized image column** — grid: `md:grid-cols-[1.4fr_1fr]` → `md:grid-cols-[auto_minmax(0,1fr)]`. The image column hugs the natural image width, text panel takes the rest. No empty rails.

3. **Desktop image fills its column** — wrap the desktop `<img>` in a fixed-aspect block `aspect-[4/5] h-[80vh] w-auto` with `<img className="w-full h-full object-cover">`. Edge-to-edge fill, no bars.

4. **Mobile/tablet unchanged** — at `<md`, keep stacked layout, full-width image, `object-contain`, capped at `55vh`.

### Out of scope
- Pills, scene grid, query, RLS, Dashboard, other components.
- Optimization is already correct (`getOptimizedUrl(..., { quality: 85 })`) — left as-is.

### Risk
Minimal — pure CSS/markup change inside the existing modal; mobile/tablet path identical.
