
## Fix Edit Product page: nesting, gaps, image whitespace, label colors

Five concrete issues to fix on `/app/products/:id/edit` (and same flow for Add Product → Upload tab).

### 1. Triple-nested cards → single card
Today in editing mode:
- `AddProduct.tsx` wraps `<ManualProductTab>` in `rounded-2xl border bg-card p-4 sm:p-6` (outer card)
- Inside `ManualProductTab`, the image section is wrapped in another `rounded-2xl border bg-card p-3 sm:p-4` (middle card)
- Inside that, the filled-image state wraps everything again in `rounded-xl border border-border/50 bg-muted/10 p-3` (inner card)

Result: three borders stacked. Fix:
- **Remove the outer card from `AddProduct.tsx`** in the editing branch (lines 83–92). Render `<ManualProductTab>` directly so its own section cards (Image / Product Details / More details) become the single card layer — same pattern as the rest of the app.
- **Remove the inner `rounded-xl border border-border/50 bg-muted/10 p-3` wrapper** in `ManualProductTab.tsx` line 863. Just use a simple `space-y-3` div — the outer image-section card already provides the border + padding.
- Keep the Tabs / Add Product branch outer card so each import method still has a consistent container.

### 2. Huge gap below Sophia tip
`PageHeader.tsx` uses `space-y-8 sm:space-y-10` between children. That puts ~40–80px between the Sophia tip and the form card. Fix:
- Tighten to `space-y-4 sm:space-y-6` (matches Products page rhythm). This is a single-line change in `src/components/app/PageHeader.tsx`.

### 3. Image whitespace (image hugging left, blank space on right)
The main image is locked to `max-w-[280px]` while sitting in a full-width card → the right ~70% of the card is empty (visible in screenshot).

Fix in `ManualProductTab.tsx` filled-image block:
- Change layout to **side-by-side on desktop**: image on the left (`max-w-[280px]`), reference angles strip on the right of it (or below on mobile). Use `flex flex-col sm:flex-row gap-4` with the angles section taking the remaining space.
- This naturally fills the card and eliminates the dead space.

### 4. Grey border / box around the product image
The image container uses `bg-muted/20` and `rounded-2xl overflow-hidden` — for transparent PNGs this paints a grey rectangle behind the product.

Fix:
- Change `bg-muted/20` → `bg-transparent` (or remove the background entirely) on the image wrapper at line 865.
- Keep `object-contain` so non-square photos still display fully without crop.

### 5. Product Details labels look "off / different from rest of platform"
The `<Label>` elements use `text-xs font-medium` without an explicit text color, so they inherit `text-card-foreground`, while the section header uses `text-muted-foreground`. Visually the labels look slightly muted/grey and inconsistent with the rest of the app where field labels are crisper.

Fix:
- Add `text-foreground` to the four `<Label>` elements (Product Name, Product Type, Description, Dimensions) in the Product Details card so they match the rest of the app's form labels.
- No changes to placeholders (those already use the standard `placeholder:text-muted-foreground` from the Input component).

### Files touched
- `src/pages/AddProduct.tsx` (~3 lines — drop outer card in editing branch)
- `src/components/app/PageHeader.tsx` (~1 line — tighten spacing)
- `src/components/app/ManualProductTab.tsx` (~10 lines — remove inner wrapper, side-by-side layout, transparent image bg, label color)

### Out of scope
- No backend, mutation, AI-analysis, or field changes
- No tab restructuring on Add Product
- No changes to the empty-state dropzone (only the filled image state)

### Acceptance
- Edit Product shows one consistent card per section — no triple borders
- Compact gap between Sophia tip and the form
- Product image fills its area sensibly with reference angles next to it on desktop, stacked on mobile
- Transparent product images render without a grey box behind them
- Form labels match the rest of the platform (same crisp foreground color)
- Save / Cancel and AI analysis flow unchanged
