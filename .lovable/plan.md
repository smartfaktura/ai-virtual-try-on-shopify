

## Fix Hero Showcase: Instant Image Loading and Clearer Carousel Interaction

### Problem 1: Slow Image Loading
The hero section loads full-resolution images from storage without any optimization. There are 24 output images across 3 product showcases, all fetched at original quality. When switching between products (Cropped Tee, Face Serum, Gold Ring), images load from scratch causing visible shimmer delays.

### Problem 2: Carousel Not Obviously Interactive  
The product pills (Cropped Tee / Face Serum / Gold Ring) don't clearly communicate they are clickable product switchers. The horizontal scroll carousel also lacks visual affordance.

---

### Solution

#### A. Optimize all hero images with `getOptimizedUrl()`

Apply width-constrained, quality-reduced URLs to all hero images:
- Product card images: `width: 200, quality: 70` (they display at 180-200px)
- Output carousel images: `width: 250, quality: 70` (they display at 150-180px)

This alone will cut each image from ~200-500KB down to ~15-40KB, making loads nearly instant.

#### B. Preload all 3 showcases on mount

Add a `useEffect` that creates hidden `Image()` objects for all 24 output images + 3 product images on component mount. This means switching between Cropped Tee / Face Serum / Gold Ring will be instant since images are already cached.

#### C. Add `loading="lazy"` for off-screen carousel images

Only the first 3-4 visible carousel items load eagerly; the rest use `loading="lazy"`.

#### D. Make carousel interaction clearer

- Add a subtle horizontal scroll indicator (gradient fade on the right edge)
- Add a small "swipe" or dot indicator below the carousel showing total/active position
- Make the product pills slightly larger with a subtle arrow or "tap to switch" animation on first load

---

### Technical Changes

**File: `src/components/landing/HeroSection.tsx`**

1. Import `getOptimizedUrl` from `@/lib/imageOptimization`

2. Apply optimization to product images:
```tsx
src={getOptimizedUrl(current.product.img, { width: 200, quality: 70 })}
```

3. Apply optimization to output carousel images:
```tsx
src={getOptimizedUrl(output.img, { width: 250, quality: 70 })}
```

4. Add lazy loading for carousel images beyond the first 3:
```tsx
{current.outputs.map((output, idx) => (
  <ShimmerImage
    src={getOptimizedUrl(output.img, { width: 250, quality: 70 })}
    loading={idx < 3 ? 'eager' : 'lazy'}
    ...
  />
))}
```

5. Preload all showcase images on mount:
```tsx
useEffect(() => {
  showcases.forEach(scene => {
    new Image().src = getOptimizedUrl(scene.product.img, { width: 200, quality: 70 });
    scene.outputs.forEach(o => {
      new Image().src = getOptimizedUrl(o.img, { width: 250, quality: 70 });
    });
  });
}, []);
```

6. Add right-edge gradient fade to signal scrollability:
```tsx
<div className="absolute right-0 top-0 bottom-3 w-16 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
```

7. Add dot indicators below the carousel showing scroll position (small dots for each output, active one highlighted)

8. Add a subtle pulse animation on the product pills on first visit to draw attention:
```tsx
// One-time attention pulse on the inactive pills
const [pulsed, setPulsed] = useState(false);
useEffect(() => {
  const t = setTimeout(() => setPulsed(true), 2000);
  return () => clearTimeout(t);
}, []);
```

### Performance Impact
- Image sizes reduced by ~80% (200-500KB each to 15-40KB each)
- All 3 showcase sets preloaded in background -- switching products is instant
- Off-screen carousel items load lazily
- Total initial payload drops from ~2-4MB to ~200-400KB for the hero section

