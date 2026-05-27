In `src/components/app/product-images/ProductImagesStep3Refine.tsx`:

**1. Swap section order** (inline view + modal):
Render the `VOVV.AI Models` block before the `Your Brand Models` block in both:
- Inline preview (lines 166–217) — move "Library Models" above "Your Brand Models"
- Full modal (lines 245–268) — move `modalFilteredGlobal` block above `modalFilteredUser` block

**2. Match label style** for both `Your Brand Models` and `VOVV.AI Models`:
Use the same class on both headings:
`text-xs font-medium text-muted-foreground uppercase tracking-wider`

Keep the Crown icon on "Your Brand Models" but switch its color to `text-muted-foreground` so both labels read as identical typographic siblings (matches the screenshot).

No other behavior or layout changes.