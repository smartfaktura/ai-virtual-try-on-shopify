

## Change Image Count Options: Default to 1, Max 4, Remove "recommended"

### Changes

**`src/pages/Generate.tsx`**

1. Change default `imageCount` state from `'4'` to `'1'`
2. Update the type from `'1' | '4' | '8'` to `'1' | '2' | '3' | '4'`
3. Update both "Number of Images" Select dropdowns (workflow and try-on) to show options: 1, 2, 3, 4 -- without any "(recommended)" labels
4. Update credit calculation references that use `parseInt(imageCount)` (these will work as-is since they parse the string value)

### Technical Details

- Line 191: Change `useState<'1' | '4' | '8'>('4')` to `useState<'1' | '2' | '3' | '4'>('1')`
- Lines 1475-1481 and 2163-2169: Replace select options with plain "1 image", "2 images", "3 images", "4 images"
- The `setImageCount` cast on lines 1475 and 2163 updated to match new type

