## Fix lowercase "trousers" label on Shots step

**Cause:** `CATEGORY_LABELS` in `src/components/app/product-images/ProductImagesStep2Scenes.tsx` (line ~33) is missing a `trousers` entry, so the accordion falls back to the raw category id.

**Change:** Add `trousers: 'Trousers'` next to the existing `jeans: 'Jeans'` entry.

That's the only edit — one line, frontend only. No DB or prompt changes.