

# Remove Thumbnail Images from Workflow Selection

## Change

### File: `src/components/app/CreativeDropWizard.tsx` (lines 948-950)

Remove the thumbnail `<div>` with `ShimmerImage` entirely. The workflow cards will just show the name, description, badges, and radio indicator — clean and fast.

```tsx
// Before (lines 948-950)
<div className="w-16 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
  <ShimmerImage src={...} className="w-full h-full object-cover object-top" aspectRatio="4/5" />
</div>

// After: removed entirely
```

The button layout stays the same — `flex items-center gap-4 p-4` with just the text content and radio circle.

## Summary
- 1 file, 3 lines removed
- Cleaner workflow selection without problematic thumbnails

