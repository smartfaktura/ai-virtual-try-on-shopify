

# Fix Contact Form Dialog Mobile Spacing

## Problem
The "Message Our Team" dialog has no left/right margin on mobile — it stretches edge-to-edge because the base `DialogContent` uses `w-full` without mobile insets.

## Change

### File: `src/components/app/ContactFormDialog.tsx` (line 80)

Add `mx-4 sm:mx-0` to the `DialogContent` className so it gets 16px horizontal margin on mobile while remaining centered on desktop:

```tsx
// Before
<DialogContent className="max-w-md p-0 gap-0 overflow-hidden">

// After
<DialogContent className="max-w-md p-0 gap-0 overflow-hidden mx-4 sm:mx-0">
```

### Files
- `src/components/app/ContactFormDialog.tsx` — 1 class addition

