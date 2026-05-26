## `src/components/app/product-images/ProductImagesStep4Review.tsx`

**1. Side-by-side Format & Images per scene + tighter tiles**
- Wrap both sections in a `<div className="grid grid-cols-1 md:grid-cols-2 gap-6">` inside the existing Card. Remove the `<Separator />` between them.
- Shrink tile padding `px-4 py-2.5` → `px-3 py-2`, font `text-sm` → `text-xs font-medium`, radius `rounded-2xl` → `rounded-xl` (matches other VOVV pill controls).
- Format grid: change `grid-cols-3 sm:grid-cols-6` → `grid-cols-2 sm:grid-cols-3` (5 ratios → 3-col layout fits the now-narrower column).
- Images per scene grid: change `grid-cols-3 sm:grid-cols-6` → `grid-cols-4` (4 options fit in one row inside the column).

**2. Add BETA label to Advanced Scene Controls (line ~273-277)**
- Inline `Badge variant="outline"` reading `BETA` next to the `Advanced Scene Controls` `<h3>`, uppercase, `text-[9px] tracking-wider px-1.5 py-0 h-4 border-primary/40 text-primary bg-primary/5`.

No logic/state changes.