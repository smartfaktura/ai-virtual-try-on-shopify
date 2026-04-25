## Two fixes

### 1. Remove hairline before the eyebrow
**File**: `src/components/seo/photography/category/CategoryHero.tsx` (line 38)

Drop the `before:` pseudo-element. Eyebrow becomes a clean uppercase tracked label:

```tsx
<p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground mb-4">
  {page.heroEyebrow}
</p>
```

### 2. Restore the staggered collage (without the clipping bug)
**File**: `src/components/seo/photography/category/CategoryHero.tsx` (lines 72–78)

Bring back the editorial offset so the right column sits lower than the left, but with two safeguards so the "cropped boots" issue doesn't return:

- **Smaller stagger**: `lg:translate-y-8` (32px) instead of the previous `translate-y-6` per side (which doubled to 48px of total drift). One-sided offset only.
- **Apply to right column only**: left stays anchored, right column drops down by 32px on `lg+`. No upward shift on the left.
- **Section padding**: confirm the section's `pb-14 lg:pb-24` is enough to absorb the 32px drop (it is — 96px of bottom padding > 32px offset).

```tsx
<div className="grid grid-cols-2 gap-3 lg:gap-4">
  {/* Left column — anchored */}
  <div className="flex flex-col gap-3 lg:gap-4">
    <HeroTile tile={collage![0]} priority />
    <HeroTile tile={collage![2]} />
  </div>
  {/* Right column — offset down on desktop only */}
  <div className="flex flex-col gap-3 lg:gap-4 lg:translate-y-8">
    <HeroTile tile={collage![1]} priority />
    <HeroTile tile={collage![3]} />
  </div>
</div>
```

Result: editorial rhythm is back, no clipping, mobile stays a clean 2×2.
