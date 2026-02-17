
## Fix Recent Jobs Thumbnail Previews

The thumbnails in the "Recent Jobs" table are using `object-cover`, which crops and zooms images to fill the square container. This makes them appear "zoomed in" and cuts off important content.

### Change

**File: `src/pages/Dashboard.tsx` (line 341)**

Change the image class from `object-cover` to `object-contain` and add a subtle background so the image sits cleanly inside the 1:1 square without cropping.

- `object-cover` (current): Fills the box but crops the image
- `object-contain` (fix): Shows the full image within the box, letterboxed if needed

The container already has `bg-muted/30` which will serve as a nice neutral background behind any letterboxed areas.

### Technical Detail

| File | Line | Change |
|---|---|---|
| `src/pages/Dashboard.tsx` | 341 | Replace `object-cover` with `object-contain` on the thumbnail `<img>` element |
