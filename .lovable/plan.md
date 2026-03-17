

## Fix Freestyle Gallery Layout for Few Images on Mobile

### Problem
When there are only 1-3 items (generating cards + images), the gallery uses a special flex layout (lines 569-586) with `flex-col sm:flex-row` and max-width/max-height constraints. On mobile, this causes the GeneratingCard avatar box to render at an awkward small size because the `max-h-[50vh]` combined with the aspect-ratio creates a cramped card.

### Fix — `src/components/app/freestyle/FreestyleGallery.tsx`

**Remove the special `count <= 3` branch on mobile.** Instead, always use the 2-column masonry grid on mobile regardless of item count. Keep the special centered flex layout only for desktop with ≤3 items.

**Lines 569-587** — Change the condition from `count <= 3` to `count <= 3 && !isMobile`:

```tsx
if (count <= 3 && !isMobile) {
  return (
    <>
      <div className="flex flex-row items-stretch justify-center gap-2 px-3 lg:px-1">
        {generatingCards.map((card, i) => (
          <div key={`gen-wrap-${i}`} className="w-auto max-w-[45%] max-h-[calc(100vh-400px)]">{card}</div>
        ))}
        {blockedCards.map((card, i) => (
          <div key={`block-wrap-${i}`} className="w-auto max-w-[45%] max-h-[calc(100vh-400px)]">{card}</div>
        ))}
        {failedCards.map((card, i) => (
          <div key={`fail-wrap-${i}`} className="w-auto max-w-[45%] max-h-[calc(100vh-400px)]">{card}</div>
        ))}
        {imageCards(true)}
      </div>
      {modals}
    </>
  );
}
```

On mobile, it falls through to the masonry grid (lines 589+) which already uses `columnCount = isMobile ? 2 : 3` — so mobile always gets a clean 2-column layout regardless of image count.

Single file, minimal change.

