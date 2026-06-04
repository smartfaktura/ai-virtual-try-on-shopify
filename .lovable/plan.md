## Fresh Scenes: remove modal blur + point "View all" to vovv.ai

One file: `src/components/app/DashboardFreshScenes.tsx`. Two presentation-only changes.

### 1. Remove preview-modal image gradient (the "blur")
Delete the 24px `bg-gradient-to-r from-transparent to-background` overlay `<div>` inside the image column of the preview Dialog. It was washing the right edge of the photo to white. Image stays `object-cover` and fills the column edge-to-edge — clean, no blur, no seam.

### 2. "View all" → external vovv.ai
Replace the existing `<Link to="/app/discover">` with a plain anchor:

```tsx
<a
  href="https://vovv.ai/product-visual-library"
  target="_blank"
  rel="noopener noreferrer"
  className="… (same classes)"
>
  View all
  <ArrowRight className="w-3.5 h-3.5" />
</a>
```

Drop the `Link` import if it's no longer used elsewhere in the file.

### Scope
- One file.
- No data, routing, taxonomy, RLS, or DB changes.
- No changes to any other modal or page.

### Risk
None — pure presentation + one href swap.
