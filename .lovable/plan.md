

## Show Product Thumbnails in Generation Queue Badges

### Change — `src/pages/Generate.tsx` (lines 3059-3069)

Replace the text-only badges with thumbnail chips that show each product's first image alongside its title and status.

**Before:** Plain badges with `"Done"`, `"..."`, `"—"` text prefixes

**After:** Each badge includes a small product thumbnail (20x20px rounded) from `p.images[0]?.url`, with a status indicator:
- Completed products: green checkmark overlay on thumbnail
- Current product: pulsing ring/border highlight
- Pending products: dimmed/opacity-reduced

```tsx
<div className="flex flex-wrap gap-1.5">
  {productQueue.map((p, idx) => {
    const thumb = p.images?.[0]?.url;
    const isDone = idx < currentProductIndex;
    const isCurrent = idx === currentProductIndex;
    return (
      <div
        key={p.id}
        className={`flex items-center gap-1.5 rounded-full border px-2 py-1 text-[10px] transition-all ${
          isDone ? 'border-primary/30 bg-primary/5' :
          isCurrent ? 'border-primary bg-primary/10 ring-1 ring-primary/30' :
          'border-border bg-muted/30 opacity-60'
        }`}
      >
        {thumb ? (
          <img src={thumb} alt="" className="w-5 h-5 rounded-full object-cover flex-shrink-0" />
        ) : (
          <div className="w-5 h-5 rounded-full bg-muted flex-shrink-0" />
        )}
        <span className="truncate max-w-[120px]">{p.title}</span>
        {isDone && <CheckCircle className="w-3 h-3 text-primary flex-shrink-0" />}
      </div>
    );
  })}
</div>
```

`CheckCircle` is already imported in the file.

### Files changed — 1
- `src/pages/Generate.tsx` — Replace text badges with thumbnail chips in multi-product queue

