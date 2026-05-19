## Replace camera icon with mini scene thumbnails on the generating screen

### Where

`src/components/app/product-images/ProductImagesStep5Generating.tsx` — the "Generating your visuals" card on `/app/generate/product-images` (Step 5).

### What changes

Today (lines 132–143) the card shows a single static `Camera` / `Sparkles` icon in a 48×48 circle. Replace it with a centred row of the actual scene thumbnails the user selected, so the loader reflects *their* shoot.

**Layout (centred, replaces current icon):**

- Show up to **3** scene thumbnails as 48×48 `rounded-full` circles with `border border-border` and a `gap-2` between them.
- Each circle renders the scene's `previewUrl` via `getOptimizedUrl(url, { quality: 50 })` (quality-only — respects the no-crop rule), `object-cover`.
- Soft `animate-pulse` on the whole row so it still reads as "in progress".
- **If more than 3 scenes are selected**, render 3 thumbnails followed by a 4th 48×48 circle: `bg-muted text-foreground text-xs font-medium` showing `+N` (where N = `selectedScenes.length - 3`). So 5 scenes → 3 thumbs + `+2`.
- If a scene has no `previewUrl` (rare), the circle falls back to `bg-muted` with a tiny `Camera` icon inside — keeps the row visually intact.
- If `selectedScenes` is empty/undefined (defensive), keep the existing single `Camera` icon — no regression.
- When `phase === 'finishing'`, keep the existing `Sparkles` celebration circle unchanged. Distinct "almost done" beat.

### Wiring

1. Add optional prop `scenes?: Array<{ id: string; title: string; previewUrl?: string }>` to `Step5Props`.
2. In `src/pages/ProductImages.tsx` at line 1784, pass `scenes={selectedScenes}` — already available in scope, each entry has `previewUrl` (verified in `types.ts:264`).

No other call sites; this component is only used here.

### Why it's safe

- Pure presentational change in one component plus one new prop on a single call site.
- Prop is optional with a `Camera`-icon fallback → no breakage if scenes ever come through empty.
- Uses existing `getOptimizedUrl` helper and `animate-pulse` already in the file. No new deps.
- `finishing` phase visual preserved exactly.

### Out of scope

- Per-thumbnail completion checkmarks.
- Changing the per-product progress list below.
- Any copy changes.
