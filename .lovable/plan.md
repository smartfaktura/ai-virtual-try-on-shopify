

# Fix Tablet Prompt Bar Overlapping Livechat Widget

## Problem
At tablet width (768px), the prompt panel container has no right-side padding — `lg:pr-20` only kicks in at 1024px+. The livechat widget sits in the bottom-right corner, causing overlap.

## Change — `src/pages/Freestyle.tsx` (line 809)

Add right padding at the `md` breakpoint so the prompt bar clears the livechat widget on tablets:

**Before:**
```
lg:px-4 lg:sm:px-8 lg:pb-5 lg:sm:pb-6 lg:pt-2 lg:pointer-events-none lg:pr-20
```

**After:**
```
px-4 sm:px-8 pb-5 sm:pb-6 lg:pt-2 lg:pointer-events-none pr-16 lg:pr-20
```

This adds `pr-16` (64px) padding on all sizes to clear the chat widget, and keeps the existing `lg:pr-20` for larger screens. The `px-4` and `pb-5` are also applied universally instead of only at `lg` to give tablets proper spacing.

