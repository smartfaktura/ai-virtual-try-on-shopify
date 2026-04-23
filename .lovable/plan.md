

## Fix: "Pre-selected from Explore" not visible on Step 1 + duplicate-title clarity

The Recreate flow IS firing correctly — the scene auto-adds to `selectedSceneIds` the moment the URL is consumed. But the user sees nothing on Step 1 (Products), so they conclude it's broken. The "subcategory mapping" complaint is also visual — multiple scenes share the title "Worn Portrait" across different sub-families (eyewear, hats, watches), so identical tiles appear under different chips.

### Fix 1 — Show preselected scene on Step 1 (Products)

**File:** `src/pages/ProductImages.tsx`

Lift the `DiscoverPreselectedCard` out of the `step === 2` block and render it on **Step 1 too** so users immediately see "Pre-selected from Explore: <Scene Title> + thumbnail" the moment they land on the wizard. Keep it on Step 2 as well.

Change the gate at line 1484 from:
```tsx
{step === 2 && discoverSceneFull && ( <DiscoverPreselectedCard ... /> )}
```
to render the card at the top of Step 1's product picker AND on Step 2:
- Add a Step-1-specific render right before the products grid (~line 1257) with a tightened compact variant
- Keep the Step 2 render as-is

The card already paints instantly because `discoverSceneFull` resolves from `injectedScene` (the DB row we fetched) — no extra fetches needed.

### Fix 2 — Reassuring sub-text + product CTA on the Step 1 banner

The Step 1 variant of `DiscoverPreselectedCard` adds a single line:
> "Add a product below to continue with this scene."

So the user understands the scene is locked in and just needs a product. No new components — pass an `onStep` prop to the existing `DiscoverPreselectedCard` to switch the helper text.

### Fix 3 — Disambiguate duplicate-title tiles in Explore

Scenes like "Worn Portrait" exist for hats, eyewear, and watches with identical titles. After dedupe by `scene_id`, all three tiles publish, all titled "Worn Portrait". Under the **All** chip they look like duplicates.

**File:** `src/hooks/useRecommendedDiscoverItems.ts`

When the title is shared across collections, append a sub-family suffix in parentheses to the *display name only* (DB and `scene_ref` untouched):
- `"Worn Portrait"` (eyewear) → `"Worn Portrait — Eyewear"`
- `"Worn Portrait"` (hats-small) → `"Worn Portrait — Hats"`
- `"Worn Portrait"` (watches) → `"Worn Portrait — Watches"`

Implementation: after building all poses, group by lowercase `name`. For any group with ≥2 distinct `subcategory` values, append ` — ${getSubFamilyLabel(subcategory)}` to each tile in that group. Single-occurrence titles stay unchanged.

### What stays untouched

- `scene_ref` — still the canonical `scene_id`. Recreate keeps preselecting the exact right scene.
- `useProductImageScenes.fetchSceneById` — already querying by `scene_id` (last fix). No changes.
- Family/sub-chip filtering — already correct (verified all 35 active collections in the recommended set map cleanly through `CATEGORY_FAMILY_MAP`).
- Public RPC and authenticated hook — no changes.

### Files to edit

```text
src/pages/ProductImages.tsx
  - Render DiscoverPreselectedCard on Step 1 (above product picker), keep on Step 2
  - Pass step prop so card renders the right helper sub-text

src/components/app/product-images/DiscoverPreselectedCard.tsx
  - Accept optional `step` prop (default 2) to switch helper text on Step 1

src/hooks/useRecommendedDiscoverItems.ts
  - After building poses, append " — {SubFamilyLabel}" to display names
    that collide across multiple subcategories
```

### Verification after fix

- Click Recreate on any recommended Explore tile (in-category or out-of-category) → wizard opens at Step 1 with the "Pre-selected from Explore" card visible at the top. ✓
- Add a product → Continue → Step 2 still shows the same card with the scene already checked. ✓
- "Worn Portrait" tiles under All chip now read "Worn Portrait — Eyewear", "Worn Portrait — Hats", "Worn Portrait — Watches" — clearly distinguishable. ✓
- Single-occurrence titles ("Greenhouse Elegance" etc.) stay unchanged. ✓

