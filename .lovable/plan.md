

## Safe plan to verify and finish the Recreate-from-Explore fixes

The last edits already shipped the routing + resolver + picker changes. Before declaring it done, I want to verify against the live DB and patch the two gaps most likely to still bite, with zero risk to other flows.

### What I'll verify (read-only, no code changes yet)

1. Query `product_image_scenes` for every "Frozen Aura" row and confirm each has a distinct `category_collection` + `preview_image_url`. This proves the resolver can actually pick the beverages variant when `?sceneCategory=beverages` is passed.
2. Spot-check `Discover.tsx` `handleUseItem` — confirm `sceneCategory` is being set from the scene card's source category (not from a stale field).
3. Spot-check `ProductImagesStep2Scenes.tsx` — confirm `discoverSceneFull` actually renders the "From Explore" card before `useProductImageScenes` resolves, and that the scene's `categoryCollection` is injected into `priorityCategories`.

### Two small, safe patches I expect to ship after verification

**Patch A — guarantee the "From Explore" card renders first, every time**
If `discoverSceneFull` is present, render the "From Explore" section unconditionally at the top of Step 2 using only the prop data (preview image, title). Do **not** gate it on `useProductImageScenes` having loaded the matching collection. The grid below can still hydrate later — but the hero card the user expects is instant.

**Patch B — make the resolver deterministic when `?sceneId` is missing**
Today: `?sceneCategory` hint → product analysis → first candidate.
Add one safety net: if `?sceneCategory` is provided but no candidate matches it (data drift, renamed slug), fall back to `?sceneImage` exact match against `preview_image_url` before resorting to `candidates[0]`. Image URL is unique per row, so this nails the right variant even if the slug map drifts.

### Files that would change (only if verification confirms the gaps)

```text
EDIT  src/components/app/product-images/ProductImagesStep2Scenes.tsx
        - Render "From Explore" hero card from discoverSceneFull immediately
          (no dependency on useProductImageScenes load state)

EDIT  src/pages/ProductImages.tsx
        - Resolver: after sceneCategory miss, try preview_image_url match
          against ?sceneImage before falling back to candidates[0]
```

No DB / RLS / edge function / routing changes. No impact on prompt-only Recreate, Freestyle, presets, or Add-to-Discover modal (that one is already correct).

### Validation after patches

1. Click "Frozen Aura" (beverages preview) in Explore → land on Step 2 → "From Explore" card visible in <200 ms with the **beverages** preview, before the rest of the grid loads.
2. Same scene, watches preview → watches variant card.
3. Manually craft a URL with bad `?sceneCategory=fooBar` but correct `?sceneImage=<beverages-url>` → still picks the beverages row (image fallback wins).
4. No URL params → Step 2 behaves exactly as before (no regression).
5. Add-to-Discover Scene picker still lists all 9 Frozen Aura entries with category · sub-category captions.

If verification (step 1–3 above) shows everything is already wired correctly, I'll skip the patches and just report back — no unnecessary churn.

