

# Move Feedback Banner Below Recent Creations for New Users

## Problem
On the new-user `/app` dashboard, the "Help us improve VOVV.AI" feedback banner sits between the tool cards and the "Recent Creations" gallery. It should appear after Recent Creations instead.

## Fix

### `src/pages/Dashboard.tsx` — Lines 492-495

Swap the order of `<FeedbackBanner />` and `<RecentCreationsGallery />`:

**Before:**
```tsx
<FeedbackBanner />
<RecentCreationsGallery />
```

**After:**
```tsx
<RecentCreationsGallery />
<FeedbackBanner />
```

| File | Change |
|------|--------|
| `src/pages/Dashboard.tsx` | Swap FeedbackBanner and RecentCreationsGallery in the new-user layout (line ~492) |

