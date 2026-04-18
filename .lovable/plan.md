

## Goal
Two changes in `src/components/app/LibraryDetailModal.tsx`:

### 1. Action buttons feel more spacious + slightly bigger text
The 5 action buttons (Download, Edit, Enhance, Perspectives, Generate Video) currently use `size="pill"` (h-10, text-sm). Bump them to `size="pill-lg"` (h-11) and add `text-base` for ~1px font increase. Also increase the gap between buttons in the stack from default to `gap-2.5` for a more breathable feel.

Apply same height bump to the destructive Delete and the two CTAs inside the promo cards (Submit for Review, Copy Caption) to keep rhythm consistent.

### 2. De-emphasize the bottom promo cards (Help us improve / Share to Explore / Tag Us)
Currently the "Submit for Review" button is solid primary (looks identical to "Download Image" main CTA → competing for attention). Goal: keep them visible but quiet, "alternative not shouting".

**Approach — soft secondary surface:**
- Wrapper cards: drop the hard `bg-card border border-border/60` → switch to softer `bg-muted/30 border border-border/30` so cards recede visually
- Add a tiny uppercase eyebrow label above each card title (`OPTIONAL`, `BONUS`, `COMMUNITY`) in `text-[10px] tracking-[0.2em] text-muted-foreground/60`
- **Submit for Review button** → change from solid primary to `variant="outline"` + `text-foreground/80`, smaller size (`size="pill-sm"` h-8) so it reads as "if you want" rather than the next step
- **Copy Caption button** → already outline; downsize to `size="pill-sm"` and muted text to match
- **ContextualFeedbackCard** ("Help us improve") — wrap in same soft `bg-muted/30` surface treatment to align visually with the other two quiet cards (currently it has its own styling — leave internal answer chips alone, only the outer container if it has one)

### Visual hierarchy result
```
┌─────────────────────────────┐
│ [Download Image]    ← solid primary, h-11, biggest
│ [Edit Image]        ← outline, h-11
│ [Enhance to 2K/4K]  ← outline, h-11
│ [Generate Perspectives]
│ [Generate Video]
│ ─── Delete (ghost destructive) ───
└─────────────────────────────┘

Soft muted cards below (bg-muted/30):
  Help us improve     · Nailed it / Almost / Not quite
  Share to Explore    · [Submit for Review]   ← outline, h-8, quiet
  Tag Us, Win a Year  · [Copy Caption]        ← outline, h-8, quiet
```

### Files to edit
- `src/components/app/LibraryDetailModal.tsx` — the only file (lines ~300–451)

No new variants needed; reuse existing `pill-lg`, `pill-sm`, `outline`.

