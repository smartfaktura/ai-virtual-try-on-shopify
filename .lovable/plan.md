

## Fix Desktop Generating Card Sizing for Few Items

### Problem
On desktop with 1-3 items, the special flex layout (`count <= 3 && !isMobile`) constrains generating/blocked/failed cards with `max-w-[45%]` and `max-h-[calc(100vh-400px)]`. Combined with the `aspectRatio` CSS on GeneratingCard, this causes the avatar placeholder to render much smaller than the completed images. When a second generation starts, the cards shrink even further.

### Fix — `src/components/app/freestyle/FreestyleGallery.tsx`

**Remove the special `count <= 3` branch entirely (lines 569-587).** Always use the masonry grid for all counts on both mobile and desktop.

The masonry grid already handles low counts gracefully — with 1-2 items they simply fill the first column(s) at full width. The 3-column desktop layout ensures generating cards get the same column width as images, so the avatar placeholder will be properly sized.

This is a deletion of ~18 lines (the entire `if (count <= 3 && !isMobile)` block). The masonry grid below (lines 589+) becomes the single code path for all scenarios.

Single file, minimal change.

