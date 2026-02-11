

## Fix: Freestyle Gallery 2 Columns on Mobile

Currently the masonry layout in `FreestyleGallery.tsx` is hardcoded to 3 columns regardless of screen size (line 418). On mobile, this makes images too small.

### Change

**File:** `src/components/app/freestyle/FreestyleGallery.tsx`

Use the existing `useIsMobile` hook to switch between 2 columns on mobile and 3 on desktop:

1. Import `useIsMobile` from `@/hooks/use-mobile`
2. Call `const isMobile = useIsMobile()` in the component
3. Change column count from hardcoded 3 to dynamic:

```typescript
const columnCount = isMobile ? 2 : 3;
const columns: React.ReactNode[][] = Array.from({ length: columnCount }, () => []);
allCards.forEach((card, i) => columns[i % columnCount].push(card));
```

No other files need to change. This follows the same responsive pattern used in the Library and Discover galleries.
