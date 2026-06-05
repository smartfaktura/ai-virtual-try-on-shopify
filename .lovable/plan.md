Replace the small top-right "Preview" pill on Fresh Scenes cards with the centered "View" hover pill used by Recent Creations.

## Change — `src/components/app/DashboardFreshScenes.tsx`

1. Import `Eye` from `lucide-react` (alongside the existing icons).
2. In the scene card (currently around lines 190–193), remove the `<span>...Preview</span>` element in the top-right corner.
3. Add a Recent Creations-style centered overlay inside the same card, after the gradient/title overlay:

```tsx
<div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
  <span className="inline-flex items-center gap-1.5 bg-white/90 text-foreground text-xs font-semibold px-4 py-2 rounded-full shadow-lg backdrop-blur-sm">
    <Eye className="w-3.5 h-3.5" /> View
  </span>
</div>
```

Keep the existing bottom gradient + title overlay (Fresh Scenes still shows the scene title at the bottom). The overlay must sit above the gradient so the pill remains centered and crisp.

No other changes — modal, data, and grid sizing untouched.
