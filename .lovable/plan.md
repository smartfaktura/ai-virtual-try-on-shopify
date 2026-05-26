# Review step polish

Three small presentation-only fixes to the Review screen (`ProductImagesStep4Review.tsx`) and one label fix in constants.

## 1. Move "Advanced Scene Controls" below summary cards

File: `src/components/app/product-images/ProductImagesStep4Review.tsx`

- Current order: Format/Images per scene → **Advanced Scene Controls** → Summary (Products / Scenes / Credits) → Additional note etc.
- New order: Format/Images per scene → Summary (Products / Scenes / Credits) → other sections → **Advanced Scene Controls** as the last section before the sticky footer.
- Implementation: cut the `{onDetailsChange && selectedScenes.length > 0 && (<Card>…Advanced Scene Controls…</Card>)}` block (lines ~264–336) and paste it just above the bottom action bar / end of the scrollable content. No logic changes — same state, same handlers.

## 2. Enlarge "Add Props / Accessories" modal

File: `src/components/app/product-images/ProductImagesStep3Refine.tsx` (`PropPickerModal`, lines ~454–491)

The current modal uses `max-w-lg` with a 3–4 col grid and `max-h-[280px]` scroll area — feels cramped, product titles clip ("Red Cat-Eye Glas…"), layout looks broken at first paint.

Changes:
- `DialogContent`: `max-w-lg` → `max-w-3xl w-[92vw]`, add `max-h-[85vh] flex flex-col` so the modal grows but never overflows the viewport.
- Product grid: `grid-cols-3 sm:grid-cols-4` → `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5`, change `max-h-[280px]` → `flex-1 min-h-[320px] max-h-[60vh]`, increase gap from `gap-2` → `gap-3`.
- Product tile: bump padding from `p-1.5` → `p-2`, switch title from `text-[10px] truncate` → `text-xs line-clamp-2 leading-tight` so two-line titles fit cleanly.
- Search input: bump from `h-8 text-xs` → `h-10 text-sm` to match the larger modal.

Pure CSS / structural — no behavior change.

## 3. Rename "Landscape 16:9" → "Wide 16:9"

File: `src/components/app/product-images/constants.ts` line 14
- `label: 'Landscape 16:9'` → `label: 'Wide 16:9'`
- Fits inside the format pill without truncation.

## Out of scope
No state, data, prompt, or generation logic touched.
