# Polish Product Details + Props modal

## 1. Neutralize "Product Details" yellow accents

File: `src/components/app/product-images/ProductSpecsCard.tsx`

Match the white/neutral aesthetic used by other Step 3 sections:

- Line 129 — `Card className="border-amber-500/20 bg-amber-500/[0.03]"` → `Card className="border-border/60 bg-card"` (default white card).
- Line 140 — `bg-amber-500/10` icon chip → `bg-muted` (neutral).
- Line 141 — `text-amber-500` ruler icon → `text-muted-foreground`.
- Line 155 — `text-amber-500/80` OPTIONAL label → `text-muted-foreground/70`.
- Lines 324 & 335 — active cm/in toggle `bg-amber-500/15 text-amber-600` → `bg-foreground/10 text-foreground`.

Pure color swap — no layout, no logic.

## 2. Rebuild "Add Props / Accessories" modal to match Step 1 product picker

File: `src/components/app/product-images/ProductImagesStep3Refine.tsx` — `PropPickerModal` (lines ~463–491).

Adopt the same tile grammar as Step 1 (`ProductImagesStep1Products.tsx` lines 117–166):

- Grid: `grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3`.
- Tile: `relative rounded-xl border-2 overflow-hidden transition-all text-left cursor-pointer` with the same selected/unselected states:
  - selected → `border-foreground ring-2 ring-foreground/15 shadow-md`
  - unselected → `border-transparent hover:border-foreground/20`
- Image container: `aspect-square bg-muted overflow-hidden flex items-center justify-center p-2` with `<ShimmerImage … className="max-w-full max-h-full object-contain" />`.
- Caption block: `h-[52px] flex flex-col justify-center px-2.5` with title (`text-xs font-medium truncate leading-tight`) + subtitle `product_type` (`text-[10px] text-muted-foreground truncate mt-0.5`).
- Selected indicator: top-right `CheckCircle` (import from `lucide-react`) matching Step 1 (`w-5 h-5 text-primary fill-primary/20`).
- Keep modal shell `max-w-3xl w-[92vw] max-h-[85vh] flex flex-col`, search input, "X selected" footer, Cancel/Confirm.
- Grid scroll container: `flex-1 min-h-[320px] max-h-[60vh] overflow-y-auto p-1`.

No behavior change — same toggle/confirm logic, same product source.

## Out of scope
No state, prompt, or data changes.
