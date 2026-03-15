

## Change Scene Thumbnails from 1:1 to 4:5 Aspect Ratio

**File**: `src/components/app/freestyle/SceneSelectorChip.tsx`

**Change**: Line 105 — replace `aspect-square` with `aspect-[4/5]` on the scene thumbnail `<img>` tag.

```tsx
// Before
<img src={pose.previewUrl} alt={pose.name} className="w-full aspect-square object-cover" />

// After
<img src={pose.previewUrl} alt={pose.name} className="w-full aspect-[4/5] object-cover" />
```

This applies to both the compact popover and expanded dialog views since they share the same `renderGrid` function. The taller thumbnails will better showcase scene compositions.

