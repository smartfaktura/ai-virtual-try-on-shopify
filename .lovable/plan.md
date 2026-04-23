

## Three real bugs in "Recreate from Explore" → Product Images

### Bug 1: wrong "Frozen Aura" variant picked (watches preview on a Beverages product)

**Cause** — `ProductImages.tsx` lines 103–117: when `selectedProductIds.size > 0` but `analyses` haven't returned yet, `userCats` is an **empty Set**, `candidates.find(... userCats.has ...)` returns `undefined`, and we fall through to `?? candidates[0]` — which is whatever DB sort order returns first (often `frozen-aura-2` = sneakers or `frozen-aura-8` = watches). Result: random non-matching variant gets selected and pre-ticked.

Secondary cause — even when analyses return, if product brand name confuses the analyzer ("Zenith Energy" → `watches`), we still mismatch. We should fall back to the **scene's preview category vs. discover hint**, not just product category.

**Fix** — in the resolver:
1. **Wait** when `selectedProductIds.size > 0` but no analysis has resolved yet for any selected product (don't fall through to `candidates[0]`).
2. Add a third hint source: a new URL param `sceneCategory` (passed by the Discover handlers) that records which `category_collection` the user clicked from in Explore. Use that as the **primary** disambiguator.
3. Match priority becomes: `?sceneId` → `?sceneCategory` → product analysis category → first candidate.

### Bug 2: "From Explore" card appears 3+ seconds late (after the rest of the grid)

**Cause** — `SharedScenePicker.resolvedDiscoverScene` searches `ACTIVE_CATEGORY_COLLECTIONS`, which only contains **priority categories** (the user's product cats) initially. The wallets/watches/etc. variants of "Frozen Aura" live in non-priority collections that load 3s later via the `restScenes` deferred query. Until then `resolvedDiscoverScene` is `null` and the section doesn't render.

**Fix** — when `discoverScene` is set, treat its category as a priority category too. Two options:
- **(chosen, simplest)** In `ProductImages.tsx`, pass the resolved scene's `categoryCollection` into Step 2 as an additional priority category so `useProductImageScenes` fetches it in the first round.
- Pass the scene's full object directly via a new `discoverSceneFull` prop so `SharedScenePicker` can render the From Explore card without waiting on the picker hook at all.

We'll do both: pass `discoverSceneFull` (instant render of From Explore section, no dependency on collections) **and** include its category in priority to make sure the matching collection is expanded in the grid below.

### Bug 3: Add-to-Discover modal shows only 3 of 9 "Frozen" scenes (broken dedupe)

**Cause** — `DiscoverDetailModal.tsx` lines 82–110 has its **own** copy of the picker query that still uses the old broken dedupe (`!items.find(i => i.name === ps.title)`) and doesn't fetch `sub_category`. We already fixed this in `useDiscoverPickerOptions.ts` but this modal never adopted it.

**Fix** — delete the local fetch + dedupe in `DiscoverDetailModal.tsx` and use the shared `useDiscoverPickerOptions(open && isAdmin)` hook instead. This brings composite-key dedupe (`name::category::subCategory`) and the full ~1,500 scene catalog. Show category+sub-category as a small caption under each option to make duplicates legible.

### Files touched

```text
EDIT  src/pages/Discover.tsx
        - handleUseItem (scene type): also pass &sceneCategory=<category_collection>
          when available (custom_scenes.subcategory or mock pose category)

EDIT  src/components/app/DiscoverDetailModal.tsx
        - "Recreate this" CTA (scene branch): pass &sceneCategory=<d.category>
        - Replace local productImageScenes useQuery + allSceneOptions dedupe
          with useDiscoverPickerOptions(open && isAdmin)
        - Render small "category · subCategory" caption under each picker option

EDIT  src/pages/ProductImages.tsx
        - Resolver reads ?sceneCategory first (priority over product cat)
        - When products selected but no analyses ready yet AND no sceneCategory,
          WAIT instead of grabbing candidates[0]
        - Once a discover scene resolves, expose its categoryCollection so
          Step 2 can prioritise that collection
        - Pass full resolved scene (discoverSceneFull) into ProductImagesStep2Scenes

EDIT  src/components/app/product-images/ProductImagesStep2Scenes.tsx
        - Accept discoverSceneFull prop; render "From Explore" using it directly
          (independent of useProductImageScenes load timing)
        - Inject discoverScene.categoryCollection into priorityCategories so
          its category collection arrives in the first fetch round
```

### Validation

1. From Explore → click "Frozen Aura" preview that came from **Beverages** → Recreate this → URL gets `&sceneCategory=beverages`.
2. Land on Step 2 (no products picked yet) → no "From Explore" yet (correct — we still need to know which variant).
3. Pick a beverage product → Continue → Step 2 → **From Explore card renders instantly** (<200 ms), shows the **beverages** Frozen Aura preview (correct variant), pre-ticked.
4. Repeat with a Watches product → From Explore shows the watches variant.
5. If user navigates with `?sceneCategory=watches&scene=Frozen+Aura` and analyses pick fragrance, the URL hint wins → watches variant selected (matches Discover origin).
6. Open Library → admin → "Add to Discover" → Select Scene picker now lists **all 9 Frozen Aura entries**, each with `category · sub_category` caption (Beverages · Creative Shots, Watches · Creative Shots, Fragrance · Editorial, …). Total scene count matches DB (~1,666 active rows after dedupe).
7. No regressions on prompt-only / preset / freestyle Recreate paths.

