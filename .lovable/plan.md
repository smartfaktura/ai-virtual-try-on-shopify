

# Replace Product Visuals Carousel Images

## Change

### File: `src/components/app/workflowAnimationData.tsx`

**Lines 56-77** — Replace the entire `pvImages` array with the 16 user-provided URLs.

**Line 87** — Change `interval` from `500` to `750` (0.75s per image).

## Impact
- 1 file changed
- 16 curated images instead of 20
- 0.75s rotation — slower than current 0.5s for lighter loading, but still dynamic

