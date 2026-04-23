

## Fix: "Pre-selected from Explore" card visible instantly on Step 2

### Why it still feels slow

After last fix, `discoverScene` + `discoverSceneFull` are ready within ~200 ms, but the card itself still only renders *inside* `ProductImagesStep2Scenes`. When the user clicks **Continue** from Step 1, Step 2 hits two gates before it shows anything:

1. **Lazy chunk load** — `ProductImagesStep2Scenes` is `React.lazy()`, so first navigation shows the generic `<Suspense>` skeleton (`src/pages/ProductImages.tsx` line 1449) for 200–600 ms while the JS chunk downloads.
2. **Product analysis gate** — even after the chunk loads, lines 1451–1497 short-circuit the entire Step 2 render to a "Analyzing your product…" skeleton until `analyses[productId]` is populated. The "Pre-selected from Explore" card lives *inside* the real Step 2 component, so it's hidden behind this skeleton too.

Net effect: the card only paints after the lazy chunk + product analysis both finish, which is exactly the lag the user is reporting.

### Fix — make the From Explore card render-first

Two tiny changes, no logic rewrite.

**1. Lift the "Pre-selected from Explore" card up to the page level (`src/pages/ProductImages.tsx`)**

- Extract the existing JSX block (currently at `ProductImagesStep2Scenes.tsx` lines 498–544) into a small `<DiscoverPreselectedCard />` component that takes `discoverSceneFull`, `selectedSceneIds`, `onSelectionChange` as props.
- In `ProductImages.tsx` Step 2 branch (line 1448–1497), render `<DiscoverPreselectedCard />` **above** both the analysis skeleton and the `<Suspense>` boundary, gated only on `discoverSceneFull` being non-null. So it paints immediately, regardless of analysis state or chunk-load state.
- Remove the duplicate render inside `ProductImagesStep2Scenes` to avoid double-render once the chunk is loaded.
- The auto-add-to-selection effect (Step2 lines 411–422) also moves to the page level so the scene is selected the moment it resolves, not after analysis finishes.

**2. Preload the Step 2 lazy chunk as soon as Discover Recreate is detected**

In `src/pages/ProductImages.tsx`, inside the `sceneRef` resolver effect (line 119+), call `import('@/components/app/product-images/ProductImagesStep2Scenes')` once (fire-and-forget) so the chunk is in cache by the time the user clicks Continue. Eliminates the Suspense fallback flash on first navigation.

### Behaviour after fix

- Land via Explore → Step 1 → click Continue → Step 2 paints with the "Pre-selected from Explore" card already visible at top, scene already in `selectedSceneIds`. The "Analyzing your products…" skeleton only renders *below* the card, where the rest of the scene library will appear.
- No dependency on product analysis completing before the From Explore card appears.
- No Suspense flash because the chunk was preloaded during Step 1.

### Out of scope

- No change to how `sceneRef` is resolved (last fix stands).
- No change to product-analysis flow or the rest-of-library skeleton.
- No styling/copy changes to the card itself.

### File touched

```text
EDIT  src/pages/ProductImages.tsx
        - Add small <DiscoverPreselectedCard /> inline (or import)
        - Render it inside Step 2 branch, ABOVE the analysis skeleton
          and the <Suspense> boundary, gated only on discoverSceneFull
        - Move the auto-add-to-selection effect from Step2 to the page
        - Fire-and-forget preload import() of Step2 chunk in the
          sceneRef resolver

EDIT  src/components/app/product-images/ProductImagesStep2Scenes.tsx
        - Remove the now-duplicate "Pre-selected from Explore" block
          (current lines 498–544) and its auto-add effect (411–422),
          since the page renders them
```

