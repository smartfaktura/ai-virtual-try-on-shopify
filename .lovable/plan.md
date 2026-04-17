

## Polish: Freestyle corners, prompt size, names, mobile, tighter dashboard-style spacing

### 1. Freestyle card — match other cards exactly
**File:** `src/components/app/FreestylePromptCard.tsx`
- Line 128-130: Card has `rounded-2xl` only on non-mobile. Other cards (`WorkflowCardCompact`) always use `rounded-2xl`. Make Freestyle always use `rounded-2xl` too (drop the conditional). Screenshot 1 shows Catalog has rounded corners on mobile but Freestyle doesn't visually — actually both rounded, but the Freestyle prompt-bar rounded-xl looks identical. Confirm `rounded-2xl` on root for both variants.
- Line 154: Increase typing text size: `mobileCompact ? 'text-xs' : 'text-sm'` → `mobileCompact ? 'text-sm' : 'text-base'`
- Line 149: Bump min-height to fit larger text: `min-h-[76px]` → `min-h-[84px]`, mobile `min-h-[60px]` → `min-h-[68px]`

### 2. Drop "Set" suffix from workflow card display names
Update DB via SQL migration (`workflows.name`):
- `Virtual Try-On Set` → `Virtual Try-On`
- `Product Listing Set` → `Product Listing`
- `Selfie / UGC Set` → `Selfie / UGC`
- `Flat Lay Set` → `Flat Lay`
- `Mirror Selfie Set` → `Mirror Selfie`

Leave `Product Visuals`, `Interior / Exterior Staging`, `Picture Perspectives`, `Image Upscaling`, `Catalog Studio` as-is.

### 3. Mobile: shorten "Interior / Exterior Staging" → "Interior Staging"
**File:** `src/components/app/WorkflowCardCompact.tsx` — in the title render, when `mobileCompact` is true and the workflow name is `Interior / Exterior Staging`, display `Interior Staging`. Done via small inline check (no DB change so desktop keeps full name).

### 4. Tighter spacing — match dashboard rhythm (`space-y-4` between heading & content)
Dashboard uses `space-y-4` (16px) between section heading and its content. Workflows currently uses `space-y-6` (24px) — that's the source of the "still too big" gap.

**File:** `src/pages/Workflows.tsx`
- Line 506: `<section className="space-y-6">` → `<section className="space-y-4">`
- Line 583: `<section className="space-y-6">` → `<section className="space-y-4">`

### 5. Fix uneven card heights / empty gap above button (screenshot 4)
Cards with no subtitle line (or a 1-line one) leave a big empty band before the Start button because content uses `mt-auto` on the button wrapper. The Mirror Selfie card has its title wrap to 2 lines but no description rendered (current DB description is empty for some, OR description is hidden due to `mobileCompact`/condition).

**File:** `src/components/app/WorkflowCardCompact.tsx` 
- Reduce content padding from `p-5` to `p-4` for default (desktop), keeping vertical compactness.
- Reduce `pt-2` above button to `pt-3` only when description is present; otherwise tighten by removing `mt-auto` push when no description — instead use `gap-2` on the content flex container and let it sit naturally. Simplest: change `pt-2 mt-auto` → `pt-3` and remove `mt-auto` so cards size to content; rely on grid `auto-rows-fr` or accept slight height difference. To keep heights even AND tight, add `auto-rows-fr` to the grid containers (lines 532, 543, 561 of Workflows.tsx have `grid` without `auto-rows-fr`).
- Add `auto-rows-fr` to the two grid wrappers in `Workflows.tsx` (line 532, 561).

### Acceptance
- Freestyle card has same rounded-2xl corners on all viewports; typing prompt text is one step larger and easy to read.
- All workflow card titles drop "Set" suffix.
- Mobile shows "Interior Staging" instead of wrapping "Interior / Exterior Staging".
- Gap between section heading ("Choose what to create" / "Recent Creations") and content matches dashboard's "Steal the Look" rhythm (16px).
- Grid cards same height, no big empty band above Start button.

