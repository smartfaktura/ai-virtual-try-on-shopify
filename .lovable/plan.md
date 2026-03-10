

## Fix: Feedback Banner Overlapping with Studio Chat Floating Button

The `StudioChat` floating button is `fixed bottom-4 left-4` (z-40), and the `FeedbackBanner` sits at the bottom of page content. On pages with short content or when scrolled to the bottom, the floating chat button overlaps the feedback banner.

### Solution

**`src/components/app/FeedbackBanner.tsx`** — Add bottom padding/margin to push the banner above the floating button zone:
- Add `mb-16` (64px) to the outer wrapper to ensure the banner content clears the 48px floating button + its 16px bottom offset
- This gives consistent spacing on both mobile and desktop

**Alternative (better):** Instead of adding margin to every `FeedbackBanner` instance, add `pb-20` to the page content containers that include the banner (Dashboard, Settings), ensuring the floating button never overlaps the last content item. But since the banner is always the last element, adding the margin directly to it is simpler and more maintainable.

### Change

**`src/components/app/FeedbackBanner.tsx`** — Add `mb-16` to the root `div`:
```tsx
<div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 flex items-center justify-between gap-3 mb-16">
```

This single change fixes the overlap on all pages that use the banner (Dashboard, Settings) on both mobile and desktop.

