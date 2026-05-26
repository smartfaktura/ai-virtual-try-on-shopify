# Match product + scene cards as thumbnail pills

File: `src/components/app/product-images/ProductImagesStep4Review.tsx` — summary cards row (lines 340–421).

Both cards become wrap-grids of small pill chips with mini thumbnails so the layout reads as one consistent rhythm and fits many items.

## Products card (lines 342–377)

Replace the current "single big tile / multi-grid" branching with a single wrap of pill chips. No more dedicated 16×16 big tile when one product is selected — keep it visually identical to scenes.

```tsx
<div className="flex flex-wrap gap-1.5">
  {selectedProducts.slice(0, 24).map(p => (
    <span key={p.id} className="flex items-center gap-1.5 pl-0.5 pr-2 py-0.5 rounded-full bg-muted border border-border text-[11px] font-medium text-foreground max-w-full">
      <img src={getOptimizedUrl(p.image_url, { quality: 40 })} alt={p.title} className="w-5 h-5 rounded-full object-cover bg-background flex-shrink-0" />
      <span className="truncate max-w-[120px]">{p.title}</span>
    </span>
  ))}
  {selectedProducts.length > 24 && (
    <span className="flex items-center px-2 py-0.5 rounded-full bg-muted text-[11px] font-medium text-muted-foreground">+{selectedProducts.length - 24}</span>
  )}
</div>
```

## Scenes card (lines 379–421)

Swap the `<Badge variant="outline">` chips for the same pill structure as products, using `scene.previewUrl` for the mini thumbnail (fall back to a neutral dot if missing). Keep the per-category grouping when `perCategoryScenes` is active — just replace the inner Badge with the pill.

```tsx
<span className="flex items-center gap-1.5 pl-0.5 pr-2 py-0.5 rounded-full bg-muted border border-border text-[11px] font-medium text-foreground">
  {scene.previewUrl ? (
    <img src={getOptimizedUrl(scene.previewUrl, { quality: 40 })} alt={scene.title} className="w-5 h-5 rounded-full object-cover bg-background flex-shrink-0" />
  ) : (
    <span className="w-5 h-5 rounded-full bg-muted-foreground/15 flex-shrink-0" />
  )}
  <span className="truncate max-w-[140px]">{scene.title}</span>
</span>
```

Apply the same chip in both the per-category branch (line ~402) and the flat branch (line ~411). Keep the existing `+N more` overflow as a chip with the same pill shape but no thumbnail.

## Out of scope
- No data/state changes.
- Credits card and Edit buttons untouched.
- Card padding stays `p-4`.
