

## Add More Bottom Space on Mobile for Feedback Banner

The floating chat button overlaps the feedback banner on mobile because `mb-16` (64px) isn't enough vertical clearance on small screens.

### Change

**`src/components/app/FeedbackBanner.tsx`** — Increase bottom margin on mobile only:

```tsx
// Line 66: Change mb-16 to mb-20 (80px) to give more breathing room
<div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 flex items-center justify-between gap-3 mb-20">
```

This adds 16px more bottom space (80px total), ensuring the floating chat icon sits comfortably below the banner when the user scrolls to the very bottom on mobile.

