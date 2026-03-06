

## Make "Share to Discover" Clickable and More Visible in Lightbox

### Problem
The "Share to Discover — win up to 10,000 credits each month" line at the bottom of the Freestyle lightbox is just a passive `div` with very low visibility (`bg-white/5`, `text-muted-foreground`). There's no way to click it, and the separate "Share" button above doesn't clearly communicate the Discover contest.

### Solution
Merge the two elements: replace the passive info line with a **clickable button** that combines the Trophy icon, contest text, and triggers `onShare`. Remove the separate generic "Share" button from the action bar since this replaces it.

### Changes in `src/components/app/ImageLightbox.tsx`

**Lines 162-170** — Remove the generic `onShare` button from the action bar (the one that says "Share" with a Send icon).

**Lines 181-186** — Replace the passive `div` with a clickable `button` that calls `onShare(currentIndex)`, styled with better visibility:
- Use `bg-primary/20 hover:bg-primary/30` for better contrast against the dark backdrop
- Use `text-primary` for the text so it stands out
- Add `cursor-pointer` and hover transition
- Keep the Trophy icon and contest text

Result: One clear, prominent, clickable call-to-action for sharing to Discover.

