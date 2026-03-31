

## Fix Oversized Blog Post Images

### Problem
The markdown `img` renderer in `BlogPost.tsx` uses `w-full h-auto` which makes every image stretch to the full 720px container width. Portrait and tall images become extremely large, dominating the page.

### Fix

**`src/pages/BlogPost.tsx` (line 128-136)** — Update the `img` component in `markdownComponents`:

- Replace `w-full h-auto` with constrained dimensions: `max-w-full max-h-[500px] w-auto h-auto mx-auto object-contain`
- This ensures:
  - Landscape images still fill width naturally
  - Portrait/tall images are capped at 500px height
  - All images are centered and maintain aspect ratio
  - No cropping (object-contain, not object-cover)

```tsx
img: ({ src, alt }) => (
  <ShimmerImage
    src={getOptimizedUrl(src, { width: 720, quality: 75 })}
    alt={alt || ''}
    className="max-w-full max-h-[500px] w-auto h-auto mx-auto rounded-xl my-6 object-contain"
    loading="lazy"
    decoding="async"
  />
),
```

Single file change, one line update.

