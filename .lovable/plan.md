

The screenshot shows three sections in the Library/Freestyle modal sidebar with inconsistent visual treatment:

1. **"Help us improve"** — white card, `border-primary/20`, padded
2. **"Share to Explore"** — gray muted background card, different padding
3. **"Tag Us, Win a Free Year"** — light bordered card, different again

Goal: unify into a consistent **stacked card system** with matching surface, padding, border, and rhythm.

### Investigation needed
- Find the parent container that renders these three blocks (likely `LibraryDetailModal.tsx` for the latter two, plus the `ContextualFeedbackCard` for the first).
- Check `FreestyleDetailModal` (or equivalent) to see the same trio.

### Fix

**Unified card style** for all three blocks:
- Surface: `bg-card border border-border/60 rounded-xl`
- Padding: `p-4`
- Header: icon (16px, `text-primary` for first, `text-muted-foreground` for others) + title (`text-sm font-semibold text-foreground`)
- Subtitle / body: `text-xs text-muted-foreground` with `mt-1` then `mt-3` before action
- CTA: full-width `<Button size="pill">` (primary filled for "Submit for Review", `variant="outline"` for "Copy Caption")
- Vertical gap between cards: `space-y-3`

**Files to update:**

1. **`src/components/app/ContextualFeedbackCard.tsx`** — change `bannerClass` from `bg-card border border-primary/20 rounded-xl px-4 py-3` → `bg-card border border-border/60 rounded-xl p-4`. Drop the `border-primary/20` accent so it matches siblings.

2. **`src/components/app/LibraryDetailModal.tsx`** (Share to Explore + Tag Us blocks, ~lines 395–450) — replace the muted `bg-muted/40` / different border treatments with the unified `bg-card border border-border/60 rounded-xl p-4`. Standardize header (icon + title), body copy spacing, and CTA placement.

3. **Freestyle equivalent** — locate via grep (`Share to Explore` / `Tag Us`) and apply same wrapper if duplicated, or confirm it reuses `LibraryDetailModal`.

### Acceptance
- All three blocks share identical surface (`bg-card`), border (`border-border/60`), radius (`rounded-xl`), and padding (`p-4`)
- Consistent header rhythm: icon + bold title, muted subtitle below, CTA at bottom
- Vertical spacing between blocks = `space-y-3`
- "Submit for Review" remains a filled pill; "Copy Caption" is outline default

