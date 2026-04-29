## Library selection spacing fix

**Root cause:** `src/components/app/LibraryImageCard.tsx` line 99 applies `ring-2 ring-primary ring-offset-2 ring-offset-background` when a card is selected. The grid layout in `src/pages/Jobs.tsx` (line 600-602) uses `gap-2` (8px). The 2px ring + 2px offset extends 4px outside the card on every side, eating most of the gap and visually "attaching" two adjacent selected cards.

### Single change
Switch the selection indicator to an **inset ring** so it stays inside the card bounds — no offset, no overflow, gap remains intact.

`src/components/app/LibraryImageCard.tsx` line 99:

```diff
- selected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
+ selected && "ring-[3px] ring-primary ring-inset"
```

### Why this approach
- `ring-inset` draws inward, never expanding the card's footprint
- Slightly thicker (3px) keeps the selected state clearly visible despite being inside
- Preserves the existing `gap-2` masonry rhythm — no layout shift between selected and unselected states
- No changes needed to `Jobs.tsx`, the bulk-action bar, or other selection consumers

### Files touched
- `src/components/app/LibraryImageCard.tsx` (1 line)