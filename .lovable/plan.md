

# Refine Social Tag Promo Card — Premium Aesthetic

## Problem
The amber-colored "Tag Us, Win a Free Year" card clashes with the monochromatic luxury aesthetic used throughout the platform. The warm amber tones feel out of place next to the subtle `primary/5` styling of the "Share to Discover" card.

## Change — `src/components/app/LibraryDetailModal.tsx` (lines 287-296)

Replace the amber styling with the same monochromatic palette used by the adjacent "Share to Discover" card, and refine the typography to match the editorial tone:

```tsx
{/* Social tag promo */}
<div className="rounded-xl border border-border/40 bg-muted/30 p-5 space-y-2">
  <div className="flex items-center gap-2.5">
    <AtSign className="w-5 h-5 text-muted-foreground/70" />
    <h3 className="text-base font-semibold text-foreground">Tag Us, Win a Free Year</h3>
  </div>
  <p className="text-sm text-muted-foreground/80 leading-relaxed">
    Post your creation on social media with <span className="font-medium text-foreground">@vovv.ai</span> and <span className="font-medium text-foreground">#vovvai</span> — we pick winners every month for a full year of free access.
  </p>
</div>
```

Key refinements:
- `bg-amber-500/5` → `bg-muted/30` — matches platform's monochromatic palette
- `border-amber-500/20` → `border-border/40` — consistent with "Share to Discover" card
- `text-amber-500` → `text-muted-foreground/70` — subdued icon, no color pop
- `font-semibold` → `font-medium` on inline tags — less aggressive emphasis

Single file, single block replacement.

