

## Fix the category chip thumbnails so they fully fill the mini placeholder

### Confirmed issue
The Step 2 category chips beside “Beverages” and “Shoes” are no longer zoomed, but they now look too small inside the thumbnail slot because the current chip uses:
- `object-contain`
- `bg-white`
- inner padding
- a thick `border-background` outline

That combination preserves the whole product, but visually creates empty white space and makes the thumbnail feel like it’s floating inside a box.

### Root cause
In `src/components/app/product-images/ProductImagesStep2Scenes.tsx`, the category chip currently renders like this:

```tsx
<div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-white flex-shrink-0 border-2 border-background flex items-center justify-center p-0.5 overflow-hidden">
  <img
    src={getOptimizedUrl(p.image_url, { quality: 40 })}
    className="max-w-full max-h-full object-contain"
    loading="lazy"
  />
</div>
```

This is why the gaps appear:
- `object-contain` shrinks to fit
- `p-0.5` adds more empty room
- `bg-white` makes transparent edges highly visible
- `border-2 border-background` makes the chip feel even smaller

### Fix
Update only the Step 2 category chip thumbnails to behave like true filled mini covers:

1. Keep **quality-only** optimization:
   - `getOptimizedUrl(p.image_url, { quality: 40 })`
   - never add `width`, `height`, or `resize`

2. Change the chip wrapper to a tighter full-bleed thumbnail:
   - remove inner padding
   - replace the thick white outline with a subtle standard border
   - keep the same compact square sizing and rounded corners

3. Change the image fit behavior from:
   - `max-w-full max-h-full object-contain`
   to:
   - `w-full h-full object-cover object-center`

### Target code shape
In `src/components/app/product-images/ProductImagesStep2Scenes.tsx`, the chip should move toward this pattern:

```tsx
<div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md overflow-hidden flex-shrink-0 border border-border/40 bg-muted/20">
  <img
    src={getOptimizedUrl(p.image_url, { quality: 40 })}
    alt={p.title}
    className="w-full h-full object-cover object-center"
    loading="lazy"
  />
</div>
```

### Why this solves it
- `object-cover` makes the thumbnail fill the full square
- removing padding eliminates the internal empty margin
- reducing/removing the thick white border stops the “tiny image inside a larger card” look
- keeping quality-only optimization avoids the original server-side crop/zoom regression

### Scope
Only touch:
- `src/components/app/product-images/ProductImagesStep2Scenes.tsx`

Do not touch:
- scene cards
- Step 3 chips
- selection logic
- category grouping
- generation flow
- large previews / lightboxes

### Expected result
- Beverages and Shoes thumbnails fully fill their mini placeholder
- no visible white empty space inside the image area
- consistent sizing across categories
- still compact and premium-looking

### QA
On `/app/generate/product-images` Step 2:
1. Check the mini chips beside “Beverages” and “Shoes”
2. Confirm the image fills the whole square
3. Confirm there is no white gap inside the thumbnail area
4. Confirm the chip still looks aligned and clean inside the category card
5. In Network tab, verify the image URL still has `?quality=40` and does not include `width=`, `height=`, or `resize=`

