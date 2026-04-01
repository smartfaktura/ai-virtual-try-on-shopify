

# Fix Image Display on SEO Landing Page

## Problem
Images show as narrow vertical strips because `object-contain` + forced `aspectRatio` containers create empty space. The screenshot shows the exact issue.

## Solution
Use the **exact same pattern** as `DiscoverCard` default rendering: no `aspectRatio` wrapper, just `w-full h-auto object-cover` letting images render at natural dimensions.

## Changes — `src/pages/seo/AIProductPhotographyEcommerce.tsx`

### Hero Grid (~lines 156-165)
Remove `aspectRatio` prop from `ShimmerImage`, change class to `w-full h-auto block`:
```tsx
<div key={img.id} className="rounded-xl overflow-hidden border border-border shadow-sm bg-muted">
  <ShimmerImage
    src={getOptimizedUrl(img.image_url, { width: 400, quality: 75 })}
    alt={...}
    className="w-full h-auto block"
    fetchPriority={i < 3 ? 'high' : 'low'}
    loading={i < 3 ? 'eager' : 'lazy'}
  />
</div>
```

### Outcome Tabs Image (~lines 217-225)
Same fix — remove `aspectRatio`, use `w-full h-auto block object-cover`:
```tsx
<ShimmerImage
  src={getOptimizedUrl(img.image_url, { width: 600, quality: 80 })}
  alt={...}
  className="w-full h-auto block"
  loading="lazy"
/>
```

### Discovery Showcase Grid (~lines 370-377)
Same fix — remove `aspectRatio`, use `w-full h-auto block`:
```tsx
<ShimmerImage
  src={getOptimizedUrl(img.image_url, { width: 350, quality: 70 })}
  alt={...}
  className="w-full h-auto block group-hover:scale-105 transition-transform duration-500"
  loading="lazy"
/>
```

This matches the proven `DiscoverCard` pattern used throughout the app. One file changed.

