## Product Swap polish

All changes are in `src/pages/ProductSwap.tsx` only. No backend, no hook, no generation changes.

### 1. Don't pre-open Library in Step 1
- Change initial `sceneSource` state from `'library'` to `null` (type becomes `SceneSource | null`).
- The two source cards (From Library / Upload Image) are always shown when `!sceneUrl`. Neither is highlighted by default.
- Library picker only renders when `sceneSource === 'library'`; upload only when `sceneSource === 'scratch'`. User must click a card to proceed.
- Keep auto-set to `'scratch'` when an `?scene=` URL param is present (existing behavior for deep links).

### 2. Replace "Scene ready" label with actual content
- In the selected scene preview (line 588): show `sceneTitle` as the primary line; secondary line shows source ("From library" or "Uploaded image"). No more generic "Scene ready" string.
- In Review summary (line 828): show `sceneTitle` directly, drop the "Scene ready" fallback (use "Selected scene" only if truly empty).

### 3. Redesign Step 2 "Selected" tray to match floating bar
- Replace the bottom-sticky tray (lines 775–800) with a compact pill bar styled exactly like the floating sticky bar: `rounded-xl border border-border bg-card/95 backdrop-blur-sm shadow-lg`, same paddings.
- Layout: small uppercase "Selected (N)" label on the left, then a horizontal row of square thumbnails (28–32px) with rounded corners and a small ✕ hover-remove.
- Compute how many thumbnails fit visible width (use a fixed cap, e.g. 8 on desktop, 5 on mobile, via responsive classes — no JS measurement needed). Any overflow collapses into a single `+N` chip at the end (same size/shape as a thumb, `bg-muted text-muted-foreground text-xs font-semibold`).
- Position this tray just above the existing floating sticky bar (so they stack as two pills with a small gap), not as a separate full-width bar.

### 4. Remove the "~1 min · Credits refunded if a generation fails" line
- Delete line 910 entirely from the Review step cost panel.

### Out of scope
- Generation pipeline, polling, results view, lightbox, download-all, useProductSwap hook, RLS, edge functions — all untouched.
