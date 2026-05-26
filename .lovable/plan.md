# Product Swap wizard — match Product Images aesthetic

All changes in `src/pages/ProductSwap.tsx`. No backend, hook, or generation-pipeline changes.

## 1. Shared stepper (visual parity with /app/generate/product-images)

- Import and use `CatalogStepper` from `@/components/app/catalog/CatalogStepper` with three steps:
  - `Scene` (Image icon)
  - `Products` (Package icon)
  - `Review` (Sparkles icon)
- Remove the bespoke stepper markup (custom circles, connectors, `stepDefs`).
- Header keeps the small "← Visual Studio" back link and title block.

## 2. Floating sticky bar (replaces edge-to-edge fixed footer)

- Drop the current `fixed bottom-0 inset-x-0 border-t bg-background/95` footer.
- Add a local `ProductSwapStickyBar` component (same file, no new file) that mirrors `ProductImagesStickyBar` 1:1:
  - `sticky bottom-4` rounded-xl card, backdrop-blur, shadow-lg
  - Left: 3 dots + current step label + counts (`N products · M images`)
  - Middle: credit chip (`Coins` icon, total cost, "Not enough" hint when balance is short)
  - Right: Back + Continue / Generate pill buttons
  - Responsive: stacked layout on mobile, single row on `sm+`
- Centered inside `max-w-4xl mx-auto`, not full-width.

## 3. Remove aspect-ratio selector

- Delete the "Aspect ratios" block in Step 1 and the `ASPECT_RATIOS` toggle UI.
- Replace `selectedRatios: Set<string>` with `detectedRatio: RatioOption` (single value).
- Keep the auto-detect `useEffect`: load the scene image, compute natural aspect, snap to closest of `1:1 / 3:4 / 4:5 / 9:16`, store in `detectedRatio`.
- Pass `ratios: [detectedRatio]` to `generate(...)`.
- Show the detected ratio as a small read-only badge on the scene preview card (Step 1) and on the Review summary card.
- Update guards: `canAdvanceFrom1 = !!sceneUrl` (no ratio check).
- Cost summary: drop the "Ratios" row; `totalImages = selectedProductIds.size`.
- SessionStorage: drop the `selectedRatios` field (old shape ignored safely).

## 4. Raise product cap 10 → 50

- `toggleProduct`: `next.size < MAX_PRODUCTS` (50).
- Update copy: `Max 10` → `Max 50`; `N / 10 selected` → `N / 50 selected`.
- Bump `productVisibleCount` default 12 → 24 and "Load more" step 12 → 24.
- "Select visible" caps at 50.

## 5. Aesthetic polish

- Match Product Images header pattern: compact icon next to title, identical typography weights.
- Keep all existing fade-in animations and rounded-2xl card tokens.

## Out of scope

- `useProductSwap` hook, generation polling, generating view, results grid, download-all, lightbox — all untouched.
- No DB / RLS / edge function changes.

## Files touched

- `src/pages/ProductSwap.tsx` (only)
