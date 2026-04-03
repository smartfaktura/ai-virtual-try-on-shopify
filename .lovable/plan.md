

# Add Category Selector to Transform Strip Section

## What Changes

### HomeTransformStrip.tsx — full rework

**1. Category pills below the heading**
Add four selectable pills: "Beauty & Skincare", "Fashion & Accessories", "Jewelry", "Home & Lifestyle". Clicking one swaps the marquee images AND the "Original" product photo to match that category.

Data structure — define per-category image sets:
- Each category has: `original` image path, and an array of 9 marquee cards with category-appropriate images (reusing existing hero/ assets that match)
- Default selected: "Fashion & Accessories" (since most existing images are fashion)

**2. Pill styling**
- Active: `bg-foreground/10 text-foreground font-semibold ring-1 ring-foreground/15` — clearly selected but NOT looking like a CTA button
- Inactive: `text-muted-foreground hover:text-foreground hover:bg-muted/40`

**3. CTA button below the marquee**
Add a "Try it on my product" CTA (Link to `/auth`) centered below the marquee rows, matching the hero button style.

**4. Shimmer loading state**
- Track image load state per category with a simple counter
- On first category switch, show shimmer placeholders (animated gradient) on each card until images load
- Use `onLoad` callbacks to flip loaded state
- Only start loading a category's images when that category is selected (lazy per-category)

**5. Crossfade on category switch**
When user clicks a new category, fade out current images (opacity 0) → swap src → fade in (opacity 1) over 300ms for a smooth transition instead of a jarring swap.

## File Modified
- `src/components/home/HomeTransformStrip.tsx`

