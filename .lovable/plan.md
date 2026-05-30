## Fix floating action bar — pill sizing and style match

Both `/app/video/animate` and `/app/video/start-end` show a sticky floating action bar with a `CreditEstimateBox` ("Cost: N credits") and a "Not enough credits" pill next to it. The two pills currently render at different sizes/typography, which is why the warning looks ~2× smaller.

### Current

```text
CreditEstimateBox:        px-3.5 py-2  text-sm  rounded-full  bg-muted/50  border-border
"Not enough credits":     px-3   py-1.5 text-xs  rounded-full  bg-destructive/10  border-destructive/30
```

The destructive pill is visibly smaller, sits lower on the baseline, and looks like a tag instead of a sibling chip.

### Plan

**1. Match the "Not enough credits" pill to the cost chip** in both files:
- `src/pages/video/AnimateVideo.tsx` line 1332–1336
- `src/pages/video/StartEndVideo.tsx` line 405–409

Replace the span with the same geometry as `CreditEstimateBox` plus an `AlertCircle` glyph for parity with the "Cost:" label, using destructive tokens:

```tsx
<span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-destructive/30 bg-destructive/10 text-sm font-medium text-destructive">
  <AlertCircle className="h-3.5 w-3.5" />
  Not enough credits
</span>
```

Import `AlertCircle` from `lucide-react` in both files (StartEndVideo doesn't have it yet; AnimateVideo also needs it added to its existing import).

**2. Tighten the "× N videos = N credits" inline text** in `AnimateVideo.tsx` (line 1327–1331) so it sits inside a matching ghost chip instead of bare muted text — keeps the row visually coherent on mobile when wrapping:

```tsx
<span className="inline-flex items-center px-3 py-1.5 rounded-full bg-muted/30 text-xs font-medium text-muted-foreground">
  × {totalVideos} = {totalCredits} credits
</span>
```

**3. Get credits CTA** — already uses `openBuyModal(...)` in both files and `rounded-full` size lg. Confirm no change needed (the earlier "pricing link" issue was the previous turn's fix). No edits here.

### Out of scope
- Global "You're out of credits" banner
- CreditEstimateBox internals (shared component)
- Generate button behavior

### Files
- `src/pages/video/AnimateVideo.tsx`
- `src/pages/video/StartEndVideo.tsx`
