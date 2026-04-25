## Problem

In the **"Built for every category"** section on `/home`, every time you click a category pill (Swimwear, Fragrance, Eyewear, Jackets, Footwear, Bags), the grid **flashes its skeleton shimmer and re-fades the images in** — even for categories you've already viewed. It feels like the page is "loading again."

### Why this happens

In `src/components/home/HomeTransformStrip.tsx`:

1. Only the active category's cards are rendered (`current.cards.map(...)`). Switching categories **unmounts the previous `<GridCard>`s and mounts new ones**, so React creates fresh `<img>` elements every time.
2. Inside `GridCard`, a `useEffect([card.src])` resets `loaded` to `false`, and the image starts at `opacity-0` until `onLoad` fires. Even when the browser has the image cached, this triggers a brief skeleton + 500ms fade-in.
3. Although there is a `<link rel="preload">` warmer for all tiles, the browser still goes through `decode → onLoad`, so the React state still toggles back to "not loaded" on every switch.

The images themselves are fine — this is purely a UX/state issue.

## Fix — Keep all categories mounted, toggle visibility

Instead of swapping which cards render, **render every category's grid once** and just show/hide them with CSS. Once a tile has loaded, it stays loaded and there is zero shimmer when you tab back.

### Changes to `src/components/home/HomeTransformStrip.tsx`

1. **Stop remounting on category switch.** Replace the single `current.cards.map(...)` grid with one grid per category, each wrapped in a container that uses `hidden`/`block` based on `active`. All `<img>` elements stay mounted in the DOM.

2. **Remove the `loaded`-reset effect in `GridCard`.** The `useEffect([card.src]) → setLoaded(false)` is no longer needed because `card.src` never changes for a given mounted card. This eliminates the shimmer flash on switch.

3. **Lazy-load non-active categories on first reveal.** To avoid a huge initial paint cost from rendering all ~70 images at once, track which categories have been "visited" in a `Set<CategoryId>` (seeded with `'swimwear'`). When a pill is clicked, add that id to the set; only render `<GridCard>`s for categories that have been visited at least once. After first visit they remain mounted forever, so subsequent switches are instant with no skeleton.

4. **Keep the existing preload warmer** — it still helps the very first visit to each tab feel fast.

### Pseudocode sketch (technical)

```tsx
const [active, setActive] = useState<CategoryId>('swimwear');
const [visited, setVisited] = useState<Set<CategoryId>>(new Set(['swimwear']));

const handleSelect = (id: CategoryId) => {
  setActive(id);
  setVisited(prev => prev.has(id) ? prev : new Set(prev).add(id));
};

// In render, one grid per category, all kept mounted:
{CATEGORIES.map(cat => (
  <div key={cat.id} className={cn('grid grid-cols-3 sm:grid-cols-6 gap-3 lg:gap-4',
                                  active === cat.id ? 'block' : 'hidden')}>
    {visited.has(cat.id) && cat.cards.map((card, i) => (
      <GridCard key={`${cat.id}-${i}`} card={card}
                hideOnMobile={i >= 9}
                eager={cat.id === 'swimwear' && i < 9} />
    ))}
  </div>
))}
```

And in `GridCard`, drop the reset effect:

```tsx
// REMOVE:
// useEffect(() => { setLoaded(false); }, [card.src]);
```

## Result

- First click on a category: brief one-time skeleton while images load (expected).
- Every subsequent click on the same category: **instant**, no shimmer, no fade-in — feels like a real tabbed gallery.
- No layout / visual changes; only the switching behavior is fixed.

## Files changed

- `src/components/home/HomeTransformStrip.tsx` — restructure grid rendering and remove the `loaded` reset effect in `GridCard`.