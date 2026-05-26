## Goal

Make /app/models cards visually match /app/brand-scenes — larger cards via the same grid breakpoints — and shorten the card CTA.

## Changes

### `src/pages/BrandModels.tsx`

1. **Grid (line 1388)** — replace the dense 6-up grid with the brand-scenes breakpoints:
   ```diff
   - <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
   + <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
   ```

2. **CTA copy (ModelCard)** — shorten the primary action label:
   ```diff
   - Use in Visual Studio
   + Use model
   ```
   (Mirrors brand-scenes' `Use scene` voice.)

## Out of scope

- Card internals/aesthetic — already matched in previous turn.
- Other dense grids inside the wizard (line 1339 model picker grid) — unrelated, stays.
