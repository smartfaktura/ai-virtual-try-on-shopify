

# Fix Metric Cards: Equal Height, Better Hover, Value Fitting, Mobile Tooltip

## Problems
1. Hover tooltip has cramped background that wraps awkwardly with small space
2. Cards are different heights (action cards vs value cards)
3. Large values like €42,930 don't fit well
4. No hover on mobile — tooltip info is invisible

## Changes

### `src/components/app/MetricCard.tsx`

1. **Equal card heights**: Add `min-h-[160px] sm:min-h-[180px]` to the outer card container so all 5 cards match height regardless of content type.

2. **Fix hover tooltip layout**: Replace `absolute -bottom-1 -left-1 -right-1` with proper positioning inside the card. Use `absolute bottom-0 left-0 right-0 rounded-b-2xl px-5 py-3 bg-card/95 backdrop-blur-md border-t border-border/30` — more padding, card-colored background instead of secondary, no negative offsets.

3. **Value auto-sizing**: For values, use responsive font sizing: `text-xl sm:text-2xl lg:text-3xl` so large numbers like €42,930 fit without breaking. Add `whitespace-nowrap` to prevent line breaks.

4. **Mobile: show tooltip inline instead of hover**: On mobile (no hover), show the branded tooltip always-visible as a subtle inline row at the bottom of the card instead of hover-reveal. Use a media query approach: `opacity-100 sm:opacity-0 sm:group-hover:opacity-100` — always visible on mobile, hover-reveal on desktop. Make the mobile version more compact (smaller avatar, shorter text).

5. **Add bottom padding** to card content to reserve space for the tooltip so it doesn't overlap the value/action content. Use `pb-8 sm:pb-2` (more padding on mobile since tooltip is always visible there).

### `src/pages/Dashboard.tsx`

No changes needed — just the MetricCard component fixes.

### Files
- `src/components/app/MetricCard.tsx`

