## Goal

Refine the `/ai-product-photography/swimwear` page based on the latest feedback.

## Changes

### 1. Reorder swimwear chip pills

`src/data/aiProductPhotographyBuiltForGrids.ts` — reorder the `swimwear` array so the first three chips are the strongest editorial groups:

1. Villa & Resort Mood
2. Mediterranean
3. Maldives & Tropics
4. Resort Editorial
5. Pool & Beach UGC
6. Aesthetic Color
7. Stills & Flat-Lay
8. Essential Shots

No card content changes — order only.

### 2. Hide the last 3 pills on mobile

`src/components/seo/photography/category/CategoryBuiltForEveryCategory.tsx` — in the chip rail map, add a per-chip mobile-hide class so the trailing chips (anything past the first 5) only appear on `sm` and up:

```tsx
idx >= 5 && 'hidden sm:inline-flex'
```

Effect on swimwear: mobile shows Villa & Resort Mood, Mediterranean, Maldives & Tropics, Resort Editorial, Pool & Beach UGC. Aesthetic Color, Stills & Flat-Lay, Essential Shots are hidden on mobile, visible from `sm` up. Other category pages with ≤5 chips are unaffected.

### 3. Add 4 more Scene examples (8 → 12)

`src/data/aiProductPhotographyCategoryPages.ts` — extend the swimwear `sceneExamples` array from 8 to 12 by appending 4 fresh editorial scenes from the new batch, each with `collectionLabel: 'Swimwear'`, matching `subCategory`, and descriptive `alt`:

- Villa Shade Siren (`1779347035251-z5k8cv`) — Villa & Resort Mood
- Poolside Double Take (`1779347015401-sti2jy`) — Pool & Beach UGC
- Maldives Bicycle Girl (`1779343666035-zdhcpb`) — Maldives & Tropics
- Coastal Stillness Swim Frame (`1777996830864-yd13ny`) — Stills & Flat-Lay

The existing grid is `grid-cols-2 md:grid-cols-3 lg:grid-cols-4` so 12 items lay out cleanly (6 rows mobile / 4 rows tablet / 3 rows desktop) — no component changes needed.

## Files touched

- `src/data/aiProductPhotographyBuiltForGrids.ts` (reorder)
- `src/data/aiProductPhotographyCategoryPages.ts` (append 4)
- `src/components/seo/photography/category/CategoryBuiltForEveryCategory.tsx` (1-line mobile-hide class)

No routes, hooks, backend, or other category pages affected.

## Verification

- `bunx tsc --noEmit` passes
- `/ai-product-photography/swimwear` desktop: 8 chips, Villa/Med/Maldives lead; Scene examples shows 12 images
- Mobile (375px): 5 chips, remaining 3 hidden; Scene examples stacks 2-up
