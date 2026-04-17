

## Restore workflow card thumbnails/animations + remove duplicate "Choose what to create" heading

### Issue 1: Cards thumbnails wrong + animations broken
My previous change swapped desktop thumbnail aspect from `aspect-[3/4]` → `aspect-[4/5]` in `WorkflowCardCompact.tsx` and `FreestylePromptCard.tsx`. The `WorkflowAnimatedThumbnail` scenes are calibrated for `aspect-[3/4]` — at `aspect-[4/5]` (shorter container), background images crop differently (looks like "wrong images" for Selfie/UGC + Flat Lay) and absolutely-positioned animation elements lose their reference frame (Virtual Try-On overlay broken).

### Issue 2: Extra heading appeared
Screenshot shows two stacked headings on `/app/workflows`:
- "Visual Studio" / "Turn one product photo…" (page header — keep)
- "Choose what to create" / "Pick a Visual Type to start a new set." (duplicate — remove)

The second one is redundant and was likely added recently in `Workflows.tsx`.

### Plan

**File: `src/components/app/WorkflowCardCompact.tsx`** (line ~117)
- Revert desktop aspect: `aspect-[4/5]` → `aspect-[3/4]`. Restores correct thumbnail framing for all scenes (Selfie/UGC, Flat Lay) and fixes animation positioning (Virtual Try-On etc.).

**File: `src/components/app/FreestylePromptCard.tsx`**
- Same revert: `aspect-[4/5]` → `aspect-[3/4]` to keep Freestyle aligned with workflow cards.

**File: `src/pages/Workflows.tsx`**
- Locate and remove the "Choose what to create" / "Pick a Visual Type to start a new set." heading block (the secondary one above the grid). Keep only the main page header.

### Acceptance
- Selfie/UGC + Flat Lay cards show their original correct thumbnails.
- Virtual Try-On and all card animations work as before.
- Only one heading on `/app/workflows` ("Visual Studio" page header). The duplicate "Choose what to create" block is gone.
- Card heights still reasonable (kept `auto-rows-fr` removal from earlier fix).

