## Goal

Polish the free-plan limits in **Step 3 (Refine)** of `/app/generate/product-images` so that:
1. Hitting the model/background cap shows a friendly inline upgrade message instead of silently swapping the selection.
2. The "Free plan: 1 model per batch" / "1 background per batch" hint sits **directly above the VOVV.AI Models / swatch grid**, not between the title and the grid.
3. Clicking **Create Your Brand Model** from inside the wizard opens an upgrade modal (so the user does not lose their wizard progress) instead of navigating to `/app/models`.

All changes are scoped to `src/components/app/product-images/ProductImagesStep3Refine.tsx`. No backend / billing changes — this is purely the in-wizard UX.

---

## Changes

### 1. Inline "limit reached" hint (model + background)

State added at the card level:
- `modelLimitHintAt: number | null`
- `bgLimitHintAt: number | null`

When a free user clicks a **second** model (or a second swatch) we:
- Keep the original selection (do NOT swap).
- Set the hint timestamp → render a small inline banner under the picker:  
  *"Free plan limit — 1 model per generation. **Upgrade** to select more."*
- Auto-dismiss after ~3.5s.

Logic updates:
- `ModelPickerSections` gets two new optional props: `freeLimitReached: boolean`, `onFreeLimitHit?: () => void`. When `freeLimitReached` is true and user clicks an unselected card → call `onFreeLimitHit()` and short-circuit (no toggle, no swap).
- `BackgroundSwatchSelector` gets `maxSelections?: number` and `onLimitReached?: () => void`. Inside `toggleSwatch`, if adding would exceed the cap and the swatch is not already selected → fire `onLimitReached()` and return early (no swap).

Result: free users can deselect freely, but a second pick is rejected with a clear message — no silent swap.

### 2. Reposition the "Free plan" hint

Move the existing free-plan strip from **above the picker** to **immediately above the `VOVV.AI Models` heading inside the picker**, so it sits right where the action happens.

- Remove the `{isFree && (...)}` strip currently rendered between the card header and `<ModelPickerSections />` (lines ~2557–2565).
- Pass `isFree` and `onUpgradeClick` into `ModelPickerSections` and render the strip just above the `VOVV.AI Models` label (line ~186).
- Same treatment for `BackgroundSwatchSelector`: move the strip from after the component (~2501–2509) to the top of the swatch section inside the component, above the swatch grid.

### 3. "Create Your Brand Model" → opens upgrade modal in-wizard

Currently the empty-state CTA inside `ModelPickerSections` calls `navigate('/app/models')`, which is a Growth/Pro-gated upsell page. Free users lose their wizard state.

Change:
- Add `onUpgradeClick?: () => void` to `ModelPickerSections`.
- For free users, the "Create Your Brand Model" button calls `onUpgradeClick()` instead of `navigate(...)` — this triggers the existing `UpgradePlanModal` already mounted at the page level.
- Paid users keep the existing `navigate('/app/models')` behavior (they actually have access).

---

## Technical Notes

Files touched:
- `src/components/app/product-images/ProductImagesStep3Refine.tsx`

New props on `ModelPickerSections`:
- `isFree?: boolean`
- `freeLimitReached?: boolean` — true when `isFree && activeIds.size >= 1`
- `onFreeLimitHit?: () => void`
- `onUpgradeClick?: () => void`

New props on `BackgroundSwatchSelector`:
- `isFree?: boolean`
- `maxSelections?: number` (1 for free)
- `onLimitReached?: () => void`
- `onUpgradeClick?: () => void`

Call sites in the Refine card:
- Pass `isFree`, `onUpgradeClick={onUpgradeClick}` and a callback that sets the local hint timestamp.
- Remove the now-redundant outer "Free plan: X per batch" banners.
- Keep the existing `onSelect` / `onMultiSelect` / `onChange` cap logic as a defensive backstop, but the picker itself will refuse the second click first.

No state shape changes (`selectedModelIds`, `backgroundTone` semantics unchanged), no DB / RLS / edge-function impact, no risk to downstream generation pipeline.

---

## Out of Scope

- Steps 1 & 2 free-user limits (already shipped, untouched).
- Plan/credit logic, pricing copy elsewhere.
- The `/app/models` gated page itself.