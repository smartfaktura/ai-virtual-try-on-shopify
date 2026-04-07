

# Fix Gradient Tab — Smaller Presets, Bigger Preview, Fit in Popup

## Changes

### File: `src/components/app/product-images/ColorPickerDialog.tsx`

**1. Shrink gradient preset cards**
- Change from `h-14` to `h-8` for the gradient swatch thumbnails
- Use `rounded-lg` instead of `rounded-xl`
- Remove the text label below each preset (saves vertical space) — use `title` attribute instead
- Keep `grid-cols-3` but with `gap-1.5`

**2. Enlarge gradient live preview**
- Change from `h-12` to `h-16` for the live gradient preview bar

**3. Make the entire gradient tab content scrollable and compact**
- Add `overflow-y-auto max-h-[70vh]` to the TabsContent so it fits on small screens
- Reduce `space-y-4` to `space-y-3` throughout the gradient tab
- Reduce padding: `px-4 pb-4 pt-3` instead of `px-5 pb-5 pt-4`

**4. Apply same compact padding to solid tab for consistency**
- Reduce to `px-4 pb-4 pt-3` and `space-y-3`

**5. Mobile fit**
- Add `max-h-[85vh] overflow-y-auto` to the dialog's inner Tabs container so the entire dialog scrolls on mobile
- Reduce `DialogContent` max-width slightly on mobile via existing `max-w-sm`

