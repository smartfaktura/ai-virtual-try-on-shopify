

## Fix: Recent Creations Gallery - Labels and Click Experience

### Issue 1: Misleading Labels

The gallery IS showing real generated try-on images (from the `tryon-images` storage bucket), not the original product photos. However, the label displays "Generated" because the workflow name lookup returns null when no workflow is associated (virtual try-on jobs may not have a workflow). This makes it hard to tell if you're seeing the actual AI output.

**Fix:** Check the `results` URLs to detect the source type. If the URL contains `tryon-images`, label it "Virtual Try-On". Also show the product name alongside the label for better context.

**File: `src/components/app/RecentCreationsGallery.tsx` (lines 52-68)**

- Detect try-on results by checking if the result URL contains `tryon-images`
- Use "Virtual Try-On" label when detected, fall back to workflow name or "Product Shot"
- Show product title as a subtitle for extra context

### Issue 2: Click Sensitivity on Mobile

Currently, the entire card has an `onClick` handler that navigates to `/app/library` on any tap. On mobile, this is too sensitive -- even a slight touch while scrolling triggers navigation.

**Fix:** Remove the navigation `onClick` from the card wrapper. Instead, add a small overlay button ("View") that appears on hover/tap, so navigation is intentional and not triggered by accidental touches during scrolling.

**File: `src/components/app/RecentCreationsGallery.tsx` (lines 160-179)**

- Remove `onClick` and `cursor-pointer` from the card wrapper `div`
- Make the hover overlay always visible on mobile (using `group-active:` or always-on for touch)
- Add a dedicated "View" button in the overlay that navigates to library
- Keep hover interaction on desktop for the label reveal

### Summary of Changes

One file: `src/components/app/RecentCreationsGallery.tsx`

1. Smart labeling: detect "Virtual Try-On" from result URLs, show product name
2. Safe click: replace card-level onClick with an intentional overlay button to prevent accidental navigation while scrolling
