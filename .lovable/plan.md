

## Fix "Recreate this" not preselecting the scene in Product Images Step 2

### Two real bugs

**Bug A — Scene-type Discover items always route to Freestyle, never to Product Images.**
`DiscoverDetailModal.tsx` (line 836–854) and `Discover.tsx` `handleUseItem` (line 460–490): when `item.type === 'scene'` (which is what "Frozen Aura" is — a `product_image_scenes` row surfaced as a Discover scene card), there's no `workflow_slug`, so the code falls into the `/app/freestyle?…` branch. Freestyle has no Step 2 / "From Explore" highlight UI, so the user lands somewhere with no preselection at all.

**Bug B — "Frozen Aura" (and ~hundreds of other titles) is a duplicated title across 9 categories.**
DB confirms 9 rows titled "Frozen Aura" (`fragrance`, `food`, `beverages`, `sneakers`, `watches`, `supplements-wellness`, `hats-small`, `makeup-lipsticks`, `beauty-skincare`). `ProductImages.tsx` resolves the URL `?scene=` param via `allScenes.find(s => s.title === sceneTitle)` — first match wins, which is essentially random vs the user's actual product category. When the matched scene's `category_collection` doesn't intersect the user's product categories, the "From Explore" section never renders in `SharedScenePicker` because `resolvedDiscoverScene` is in a collection not relevant to the active product.

### Fixes

#### 1. Route scene-type Discover items to Product Images, not Freestyle

Update both Recreate handlers (`Discover.tsx` `handleUseItem` and `DiscoverDetailModal.tsx`) so that when `item.type === 'scene'`:

- Navigate to `/app/generate/product-images?scene=<title>&sceneId=<uuid>&sceneImage=<url>&fromDiscover=1`.
- Drop the freestyle branch for scene items entirely. (Freestyle stays for prompt-only presets without a `workflow_slug`.)

For `preset` items already pointing at `workflow_slug='product-images'`, additionally pass `sceneId` (when the preset row has a `scene_id` column; if not, just pass `scene`).

#### 2. Match by stable scene id first, fall back to title

Change `ProductImages.tsx` lines 67–89 to prefer `?sceneId=` (UUID, unique) over `?scene=` (title, ambiguous):

```ts
const sceneIdParam = searchParams.get('sceneId');
const sceneTitle = searchParams.get('scene');

// 1. Try UUID match (unique, deterministic)
let match = sceneIdParam
  ? allScenes.find(s => s.id === sceneIdParam)
  : null;

// 2. Title fallback — pick the variant whose category overlaps the user's products.
//    If no products selected yet, take the first match (current behavior).
if (!match && sceneTitle) {
  const target = sceneTitle.trim().toLowerCase();
  const candidates = allScenes.filter(s => s.title.trim().toLowerCase() === target);

  if (selectedProductIds.size > 0) {
    const userCats = new Set(
      Array.from(selectedProductIds)
        .map(pid => analyses[pid]?.category_collection)
        .filter(Boolean)
    );
    match = candidates.find(c => userCats.has(c.category_collection)) ?? candidates[0] ?? null;
  } else {
    match = candidates[0] ?? null;
  }
}

if (match) setDiscoverScene({ sceneId: match.id, title: match.title });
```

Trigger this effect on `[allScenes, selectedProductIds, analyses, searchParams]` so it re-resolves once the user picks their product (Step 1 → Step 2 transition). Keep `discoverSceneConsumedRef` so it sets state at most once per navigation.

#### 3. Make sure the "From Explore" section actually surfaces

`SharedScenePicker` already renders a "From Explore" block when `resolvedDiscoverScene` is found anywhere in `ACTIVE_CATEGORY_COLLECTIONS`. Once Bug B is fixed, the resolved scene's collection will always overlap the user's active category, so the section renders correctly above the recommended grid.

Also: persist `discoverScene` across category-tab switches in the multi-category branch (already works — prop is threaded into `SharedScenePicker` for every tab), and surface a small "From Explore" pill on the category tab itself when that tab contains the discover scene. Skip if it adds complexity — current rendering is enough.

### Files touched

```text
EDIT  src/pages/Discover.tsx
        - handleUseItem: scene items route to /app/generate/product-images
          with ?scene, ?sceneId, ?sceneImage, ?fromDiscover

EDIT  src/components/app/DiscoverDetailModal.tsx
        - Recreate button: scene items route to /app/generate/product-images
          (same param shape). Preset items unchanged except gain ?sceneId
          when available.

EDIT  src/pages/ProductImages.tsx
        - Read ?sceneId first, then ?scene
        - Title fallback chooses the variant whose category_collection
          matches the user's product (via analyses)
        - Re-run resolver when products/analyses change (covers
          land-at-step-1-then-pick-product flow)
```

No DB / RLS / edge function changes. No type changes beyond URL params.

### Validation

1. Open `/app/discover`, click "Frozen Aura" (scene card, beverages preview) → Recreate this → lands on `/app/generate/product-images` (not Freestyle).
2. Pick a beverage product → Continue to Step 2 → "From Explore" section renders at the top with the **beverages variant** of Frozen Aura preselected and ticked.
3. Pick a fragrance product first instead → Step 2 surfaces the **fragrance variant** of Frozen Aura.
4. Click Recreate on a preset whose `workflow_slug='product-images'` and `scene_name='Sunlit Glow'` → same flow, Step 2 highlights the right Sunlit Glow.
5. Direct deep link `/app/generate/product-images?sceneId=<uuid>` always resolves that exact scene, regardless of products.
6. Existing prompt-only preset Recreate (no `workflow_slug`, no scene) still routes to Freestyle as before.

