

## Polish the explainer card

Three small refinements to the "Picked for your product" card in `src/components/app/product-images/ProductImagesStep2Scenes.tsx`:

**1. Bigger, more breathable text**
- Title "Picked for your product": `text-[11px]` → `text-sm font-semibold`
- Subtitle "From your Explore pick": `text-[10px]` → `text-xs text-muted-foreground`
- Add `space-y-1.5` between avatar and text, plus a touch more vertical gap (`gap-3`) so the block breathes.

**2. Swap Sparkles → Info icon**
- Replace the corner `Sparkles` badge with `Info` from `lucide-react` (same `w-4 h-4`, same muted bubble) so it reads as an explainer, not a "magic" tag.
- Update import line accordingly.

**3. Footer text bump**
- "Add more shots below": `text-[11px]` → `text-xs` so it matches the new rhythm.

### File

```text
EDIT  src/components/app/product-images/ProductImagesStep2Scenes.tsx
        - Replace Sparkles import → Info (keep other icon imports intact)
        - Explainer card: bigger text, more spacing, Info icon in corner badge
```

### Out of scope
- No changes to the actual SceneCard, header row, layout grid, or selection logic.

