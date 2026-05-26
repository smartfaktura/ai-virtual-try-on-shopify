## Edits to `src/components/app/product-images/ProductImagesStep2Scenes.tsx`

**1. Remove empty "double line / white space" on cards without background/accent (lines 269-298)**
The footer currently renders a fixed `min-h-[44px]` wrapper with an always-present `h-4` inner row, even when neither `hasBackground` nor `hasAestheticColor` is true → produces an empty band beneath the title.
Fix: only render the chips row when `hasBackground || hasAestheticColor`. Drop `min-h-[44px]` and the always-on `h-4` div; let the footer shrink to just the title when there's nothing else.

**2. Rename "Background" → "Custom Background", remove the Paintbrush icon (lines 272-280)**
- Remove the `<Paintbrush ... />` icon before the label.
- Change text from `Background` to `Custom Background`.
- On mobile show only 1 swatch (the white one); hide the other 3 with `hidden sm:block` so the row fits in narrow cards.

**3. Rename "Accent Color Selected" → "Accent Color"; mobile shows 1 swatch only (lines 282-296)**
- Change label to `Accent Color`.
- Row already uses `justify-center` so it stays centered on mobile.
- On mobile, show only the first suggested color (or first fallback swatch). Use `slice(0, isMobile ? 1 : 3)` via a `hidden sm:block` pattern on the 2nd & 3rd swatches so SSR/responsive stays CSS-driven.

**4. Update legend copy + remove icon (lines 930-935)**
- Remove the `<Paintbrush ... />` icon.
- Change text from `Backgrounds shown are editable in the next step` to `Dynamic backgrounds — fully editable in the next step`.
- Tighten styling: keep `text-[11px] text-muted-foreground/80 mb-2` (no flex needed without the icon).

No logic changes. Pure presentation.