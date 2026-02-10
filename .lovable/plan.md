

## Fix Library: Image Aspect Ratios, Better Select UI, and Source Filters

### Problem 1: Images Not Showing Actual Format

The shimmer placeholder in `LibraryImageCard` always uses `aspect-[3/4]`, and images load with `h-auto`. This works for masonry but the placeholder doesn't match the actual image ratio. Since we have the `aspectRatio` field (e.g., "1:1", "3:4", "9:16"), we can use it to set the correct placeholder aspect ratio so there's no layout shift.

### Problem 2: Select UI Hard to See

The current select checkbox is a small 24px circle with `border-white/70` and `bg-black/30` -- too subtle. We will:
- Make the checkbox always visible when `selectMode` is on (not just on hover)
- Add a subtle highlight border/ring around the entire card when selected
- Increase checkbox size slightly and improve contrast

### Problem 3: No Filtering by Source Type

Add filter pills for "All", "Generations", "Freestyle" so users can filter by source. Since model/scene associations don't have data yet, source filtering is the most useful filter to add now.

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/app/LibraryImageCard.tsx` | Use `item.aspectRatio` for placeholder sizing; improve select checkbox contrast and add selected card highlight ring |
| `src/pages/Jobs.tsx` | Add source filter pills ("All" / "Generations" / "Freestyle"); pass filter to hook |
| `src/hooks/useLibraryItems.ts` | Accept optional `sourceFilter` parameter and filter results accordingly |

### Technical Details

**Aspect ratio mapping for placeholder (LibraryImageCard.tsx):**

```tsx
function getAspectClass(ratio?: string) {
  switch (ratio) {
    case '1:1': return 'aspect-square';
    case '3:4': return 'aspect-[3/4]';
    case '4:5': return 'aspect-[4/5]';
    case '9:16': return 'aspect-[9/16]';
    case '16:9': return 'aspect-video';
    default: return 'aspect-[3/4]';
  }
}
```

**Improved select checkbox:**
- Increase to `w-7 h-7` with a stronger border (`border-white`)
- When selected: solid primary background with white check
- Add a `ring-2 ring-primary` to the entire card when selected

**Source filter pills (Jobs.tsx):**
```tsx
const SOURCE_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'generation', label: 'Generations' },
  { id: 'freestyle', label: 'Freestyle' },
];
```

Added as a row of pills below the search bar, following the same styling as sort pills.

**Hook update (useLibraryItems.ts):**
- Add `sourceFilter: 'all' | 'generation' | 'freestyle'` parameter
- When not 'all', skip fetching the other source entirely (saves a query)

